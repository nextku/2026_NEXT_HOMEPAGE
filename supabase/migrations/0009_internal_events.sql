-- 내부 인원의 방문을 통계에서 뺀다
--
-- 운영진과 학회원도 사이트를 돌아다닌다. 특히 지원 기간에는 화면을 확인하느라
-- 자주 들어온다. 그 방문이 섞이면 "밖에서 몇 명이 왔나" 를 알 수 없다.
-- 45명 중 상당수가 우리 사람이면 전환율도 같이 거짓말을 한다.
--
-- 지우지는 않는다. 표시만 해두고 집계에서 빼면, 나중에 내부 사용까지 보고 싶을
-- 때 되살릴 수 있다.

alter table public.events
  add column if not exists internal boolean not null default false;

comment on column public.events.internal is
  '학회 내부 인원의 방문. 한 번이라도 로그인한 브라우저에서 true 로 들어온다.';

create index if not exists events_public_idx
  on public.events (internal, name, created_at desc);

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

    'funnel', jsonb_build_object(
      'visitors', (
        select count(distinct session_id) from public.events
         where created_at >= since and name = 'page_view' and not internal
      ),
      'join_page', (
        select count(distinct session_id) from public.events
         where created_at >= since and name = 'page_view' and path = '/join'
           and not internal
      ),
      'download', (
        select count(distinct session_id) from public.events
         where created_at >= since and name = 'download_click' and not internal
      ),
      'apply', (
        select count(distinct session_id) from public.events
         where created_at >= since and name = 'apply_click' and not internal
      )
    ),

    -- 참고용으로 내부 방문도 세어둔다. 화면에 작게 적어두면 "왜 줄었지" 를 묻지 않는다.
    'internal_visitors', (
      select count(distinct session_id) from public.events
       where created_at >= since and name = 'page_view' and internal
    ),

    'pages', coalesce((
      select jsonb_agg(x order by x.views desc)
        from (
          select path,
                 count(*)                    as views,
                 count(distinct session_id)  as visitors
            from public.events
           where created_at >= since and name = 'page_view'
             and path is not null and not internal
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
           where created_at >= since and name = 'tab_view'
             and tab is not null and not internal
           group by path, tab
        ) x
    ), '[]'::jsonb),

    'sources', coalesce((
      select jsonb_agg(x order by x.visits desc)
        from (
          select case
                   when coalesce(referrer, '') = '' then '직접 방문'
                   else split_part(split_part(referrer, '://', 2), '/', 1)
                 end as source,
                 count(distinct session_id) as visits
            from public.events
           where created_at >= since and name = 'page_view' and not internal
           group by 1
        ) x
    ), '[]'::jsonb),

    'daily', coalesce((
      select jsonb_agg(x order by x.day)
        from (
          select (created_at at time zone 'Asia/Seoul')::date as day,
                 count(distinct session_id) as visitors
            from public.events
           where created_at >= since and name = 'page_view' and not internal
           group by 1
        ) x
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_stats(integer) from public;
grant execute on function public.admin_stats(integer) to authenticated;

-- 이미 쌓인 기록 중 운영진·학회원의 것은 지금 표시할 방법이 없다. 브라우저가
-- 스스로 붙이는 값이라 지난 것은 알 수 없다. 앞으로 들어오는 것부터 갈린다.
