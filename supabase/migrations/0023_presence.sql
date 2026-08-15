-- 지금 보고 있는 사람 수
--
-- events 로는 셀 수 없다. 그 표는 페이지를 열 때 한 줄을 남길 뿐이라, 한 화면을
-- 십 분째 읽고 있는 사람은 오 분 안에 아무 기록도 없어서 접속자에서 빠진다.
-- 머무는 동안 살아 있다는 신호가 따로 있어야 한다.
--
-- 그 신호를 events 에 쌓지는 않는다. 사람마다 일 분에 한 줄씩 늘면 그 표는
-- 금세 감당이 안 되고, 오래된 줄을 지우는 장치도 아직 없다.
--
-- 세션마다 한 줄을 두고 시각만 갱신한다. 표의 크기가 접속자 수를 넘지 않는다.

create table if not exists public.presence (
  session_id text primary key,
  path       text,
  -- 학회원·운영진의 방문은 통계에서 빼는 것과 같은 기준으로 여기서도 나눈다.
  internal   boolean not null default false,
  last_seen  timestamptz not null default now()
);

comment on table public.presence is
  '지금 머무는 사람. 세션마다 한 줄이고 시각만 갱신된다 - 기록이 아니라 현재 상태다.';

create index if not exists presence_last_seen_idx on public.presence (last_seen desc);

alter table public.presence enable row level security;

/*
   갱신은 누구나. events 와 같은 이유로 로그인하지 않은 방문자도 세야 한다.

   자기 줄만 건드리게 하는 정책은 둘 수 없다. session_id 는 브라우저가 만든
   난수일 뿐 로그인과 이어져 있지 않아서, 데이터베이스가 "이 요청이 그 세션인가"
   를 확인할 방법이 없다. 대신 담기는 것이 현재 경로와 시각뿐이라 남의 줄을
   건드려도 잃을 것이 없고, 아래 함수만 열고 표는 잠가 둔다.
*/
drop policy if exists "admins read presence" on public.presence;
create policy "admins read presence"
  on public.presence for select
  using (public.is_admin());

/*
   신호 한 번.

   upsert 로 두는 이유는 줄이 늘지 않게 하기 위해서다. 그리고 지나간 줄을 여기서
   함께 치운다 - 따로 도는 청소를 두면 그것이 멈춘 것을 아무도 모른다.
*/
create or replace function public.ping_presence(
  p_session  text,
  p_path     text,
  p_internal boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 브라우저가 만든 난수를 그대로 받는다. 길이만 확인해 이상한 값을 막는다.
  if p_session is null or length(p_session) < 8 or length(p_session) > 64 then
    return;
  end if;

  insert into public.presence (session_id, path, internal, last_seen)
  values (p_session, left(coalesce(p_path, ''), 200), coalesce(p_internal, false), now())
  on conflict (session_id) do update
    set path      = excluded.path,
        internal  = excluded.internal,
        last_seen = now();

  -- 삼십 분 넘게 소식이 없으면 떠난 것으로 본다.
  delete from public.presence where last_seen < now() - interval '30 minutes';
end;
$$;

revoke all on function public.ping_presence(text, text, boolean) from public;
grant execute on function public.ping_presence(text, text, boolean) to anon, authenticated;

/*
   지금 몇 명인가.

   마지막 신호가 이 분 안이면 보고 있는 것으로 본다. 신호는 일 분마다 오므로
   한 번 놓쳐도 사라지지 않는다.

   운영진 자신은 따로 센다. 이 화면을 열어둔 사람이 접속자에 잡히면 언제 봐도
   최소 한 명이라 수를 믿을 수 없다.
*/
create or replace function public.presence_now()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  return (
    select jsonb_build_object(
      'visitors', count(*) filter (where not internal),
      'internal', count(*) filter (where internal),
      'paths', coalesce((
        select jsonb_agg(x order by x.n desc)
          from (
            select path, count(*) as n
              from public.presence
             where last_seen > now() - interval '2 minutes'
               and not internal
             group by path
             order by n desc
             limit 8
          ) x
      ), '[]'::jsonb)
    )
      from public.presence
     where last_seen > now() - interval '2 minutes'
  );
end;
$$;

revoke all on function public.presence_now() from public;
grant execute on function public.presence_now() to authenticated;
