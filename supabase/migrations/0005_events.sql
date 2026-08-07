-- 방문·클릭 기록과 지원 퍼널
--
-- 왜 GA4 를 쓰지 않는가
--   GA4 는 이미 붙어 있지만 화면에 끌어오려면 서비스 계정 키와 서버 라우트가
--   필요하고, 집계도 몇 시간 늦게 반영된다. 필요한 것은 "지원서를 받아간 사람
--   중 몇 명이 실제로 냈나" 정도라, 여기에 직접 쌓는 편이 즉시 보이고 접근
--   제어도 RLS 로 끝난다. GA4 는 그대로 두고 병행한다.
--
-- 개인정보
--   누가 눌렀는지는 담지 않는다. session_id 는 브라우저가 스스로 만든 난수이고
--   사람과 연결할 방법이 없다. IP 도 저장하지 않는다.

create table if not exists public.events (
  id         bigserial primary key,
  name       text not null,
  path       text,
  tab        text,
  referrer   text,
  session_id text,
  created_at timestamptz not null default now(),

  -- 익명 insert 를 열어두는 테이블이라 이름을 자유롭게 두면 아무 값이나 쌓인다.
  constraint events_name_check check (
    name in ('page_view', 'tab_view', 'download_click', 'apply_click')
  )
);

comment on table public.events is
  '익명 방문·클릭 기록. 운영진만 조회한다.';

create index if not exists events_recent_idx on public.events (created_at desc);
create index if not exists events_name_idx   on public.events (name, created_at desc);

alter table public.events enable row level security;

-- 기록은 로그인하지 않은 방문자도 남긴다. 그래서 insert 만 공개한다.
drop policy if exists "anyone can log events" on public.events;
create policy "anyone can log events"
  on public.events for insert
  with check (true);

-- 읽기는 운영진만. 일반 학회원에게도 보이지 않는다.
drop policy if exists "admins read events" on public.events;
create policy "admins read events"
  on public.events for select
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 집계
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 원본을 브라우저로 내려 집계하면 행이 늘수록 화면이 느려진다. 세는 일은 DB 가
-- 하고 결과만 보낸다. security definer 지만 첫 줄에서 운영진인지 확인한다.

create or replace function public.admin_stats(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  since timestamptz := now() - make_interval(days => greatest(p_days, 1));
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  select jsonb_build_object(
    'days', greatest(p_days, 1),

    -- 퍼널. 각 단계는 사람 수(세션 수)로 센다. 클릭 수로 세면 한 사람이 여러 번
    -- 누른 것이 전환처럼 보인다.
    'funnel', jsonb_build_object(
      'visitors', (
        select count(distinct session_id) from public.events
         where created_at >= since and name = 'page_view'
      ),
      'join_page', (
        select count(distinct session_id) from public.events
         where created_at >= since and name = 'page_view' and path = '/join'
      ),
      'download', (
        select count(distinct session_id) from public.events
         where created_at >= since and name = 'download_click'
      ),
      'apply', (
        select count(distinct session_id) from public.events
         where created_at >= since and name = 'apply_click'
      )
    ),

    'pages', coalesce((
      select jsonb_agg(x order by x.views desc)
        from (
          select path,
                 count(*)                    as views,
                 count(distinct session_id)  as visitors
            from public.events
           where created_at >= since and name = 'page_view' and path is not null
           group by path
        ) x
    ), '[]'::jsonb),

    'tabs', coalesce((
      select jsonb_agg(x order by x.views desc)
        from (
          select path, tab,
                 count(*)                   as views,
                 count(distinct session_id) as visitors
            from public.events
           where created_at >= since and name = 'tab_view' and tab is not null
           group by path, tab
        ) x
    ), '[]'::jsonb),

    -- 어디서 들어왔는지. 호스트만 남겨 경로는 버린다.
    'sources', coalesce((
      select jsonb_agg(x order by x.visits desc)
        from (
          select case
                   when coalesce(referrer, '') = '' then '직접 방문'
                   else split_part(split_part(referrer, '://', 2), '/', 1)
                 end as source,
                 count(distinct session_id) as visits
            from public.events
           where created_at >= since and name = 'page_view'
           group by 1
        ) x
    ), '[]'::jsonb),

    'daily', coalesce((
      select jsonb_agg(x order by x.day)
        from (
          select (created_at at time zone 'Asia/Seoul')::date as day,
                 count(distinct session_id) as visitors
            from public.events
           where created_at >= since and name = 'page_view'
           group by 1
        ) x
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_stats(integer) from public;
grant execute on function public.admin_stats(integer) to authenticated;
