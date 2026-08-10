-- 못 보낸 확인 메일을 적어둔다
--
-- 지원 마감날에는 지원이 몰린다. 메일 서비스의 무료 한도가 하루 100통이고,
-- 넘기면 그 뒤로는 조용히 거절된다. 지금은 그것을 알 방법이 없다 - 폼 스크립트가
-- 응답을 무시하도록 되어 있어서 실패해도 재시도도, 기록도 남지 않는다.
--
-- 지원서 자체는 구글 폼에 그대로 쌓이므로 지원이 사라지지는 않는다. 다만 누가
-- 확인 메일을 못 받았는지 알아야 나중에 손으로 보낼 수 있다.
--
-- 익명 삽입을 여는 이유는 events 와 같다. 이 표에 쓰는 것은 우리 서버의 API
-- 라우트인데, 거기에는 서비스 키가 없고 공개 키만 있다. 대신 읽기는 운영진에게만
-- 연다 - 지원자 메일 주소가 들어 있기 때문이다.

create table if not exists public.mail_failures (
  id         bigserial primary key,
  kind       text not null default 'form_receipt',
  to_email   text,
  name       text,
  -- 메일 서비스가 돌려준 말. "429 Too Many Requests" 인지 주소가 틀린 것인지
  -- 구분해야 다시 보낼지 판단할 수 있다.
  reason     text,
  resolved   boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.mail_failures is
  '못 보낸 메일. 마감날 한도를 넘겼는지 확인하고 손으로 다시 보내는 데 쓴다.';

create index if not exists mail_failures_open_idx
  on public.mail_failures (created_at desc) where not resolved;

alter table public.mail_failures enable row level security;

-- 쓰기는 서버의 API 라우트가 한다. 그 라우트는 공유 비밀로 막혀 있다.
drop policy if exists "server records mail failures" on public.mail_failures;
create policy "server records mail failures"
  on public.mail_failures for insert
  to anon, authenticated
  with check (true);

-- 읽기는 운영진만. 지원자 메일 주소가 들어 있다.
drop policy if exists "admins read mail failures" on public.mail_failures;
create policy "admins read mail failures"
  on public.mail_failures for select
  using (public.is_admin());

-- 다시 보낸 뒤 처리 표시.
drop policy if exists "admins resolve mail failures" on public.mail_failures;
create policy "admins resolve mail failures"
  on public.mail_failures for update
  using (public.is_admin())
  with check (public.is_admin());

grant insert on public.mail_failures to anon, authenticated;
grant select, update on public.mail_failures to authenticated;
grant usage, select on sequence public.mail_failures_id_seq to anon, authenticated;
