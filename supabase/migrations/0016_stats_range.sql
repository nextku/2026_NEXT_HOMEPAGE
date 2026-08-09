-- 통계를 기간과 시간대로 본다
--
-- 지금까지는 "최근 N일" 넷 중에 고르는 것이 전부였다. 홍보한 날 하루만 떼어
-- 보거나 마감 직전 이틀을 보려면 그럴 방법이 없었다.
--
-- 그리고 '오늘' 을 골라도 그래프는 여전히 날짜별이라 점이 하나뿐이었다. 하루를
-- 볼 때 알고 싶은 것은 몇 시에 사람이 들어왔는가다.
--
-- 두 가지를 고친다. 시작과 끝을 직접 받고, 기간이 짧으면 한 시간 단위로 묶는다.
--
-- 빈 칸은 여기서 채운다. 기록이 없는 시각은 행이 아예 없는데, 그대로 그리면
-- 빈 시간이 접혀 가로축이 거짓말을 한다.

create or replace function public.admin_stats(
  p_days integer default 30,
  p_from timestamptz default null,
  p_to   timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  from_ts timestamptz;
  to_ts   timestamptz;
  bucket  text;
  step    interval;
  result  jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  -- 직접 준 기간이 있으면 그것을 쓰고, 없으면 최근 N일.
  to_ts   := coalesce(p_to, now());
  from_ts := coalesce(p_from, to_ts - make_interval(days => greatest(p_days, 1)));

  if from_ts >= to_ts then
    raise exception 'from must be before to';
  end if;

  -- 이틀 이하는 시간별로. 그보다 길면 점이 너무 많아 선이 뭉갠다.
  if to_ts - from_ts <= interval '2 days' then
    bucket := 'hour';
    step   := interval '1 hour';
  else
    bucket := 'day';
    step   := interval '1 day';
  end if;

  select jsonb_build_object(
    'from',   to_char(from_ts at time zone 'Asia/Seoul', 'YYYY-MM-DD"T"HH24:MI'),
    'to',     to_char(to_ts   at time zone 'Asia/Seoul', 'YYYY-MM-DD"T"HH24:MI'),
    'bucket', bucket,

    'funnel', jsonb_build_object(
      'visitors', (
        select count(distinct session_id) from public.events
         where created_at >= from_ts and created_at < to_ts
           and name = 'page_view' and not internal
      ),
      'join_page', (
        select count(distinct session_id) from public.events
         where created_at >= from_ts and created_at < to_ts
           and name = 'page_view' and path = '/join' and not internal
      ),
      'download', (
        select count(distinct session_id) from public.events
         where created_at >= from_ts and created_at < to_ts
           and name = 'download_click' and not internal
      ),
      'apply', (
        select count(distinct session_id) from public.events
         where created_at >= from_ts and created_at < to_ts
           and name = 'apply_click' and not internal
      )
    ),

    'internal_visitors', (
      select count(distinct session_id) from public.events
       where created_at >= from_ts and created_at < to_ts
         and name = 'page_view' and internal
    ),

    'pages', coalesce((
      select jsonb_agg(x order by x.views desc)
        from (
          select path,
                 count(*)                   as views,
                 count(distinct session_id) as visitors
            from public.events
           where created_at >= from_ts and created_at < to_ts
             and name = 'page_view' and path is not null and not internal
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
           where created_at >= from_ts and created_at < to_ts
             and name = 'tab_view' and tab is not null and not internal
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
           where created_at >= from_ts and created_at < to_ts
             and name = 'page_view' and not internal
           group by 1
        ) x
    ), '[]'::jsonb),

    /*
       그래프.

       기록이 있는 칸만 주면 빈 시간이 접힌다. generate_series 로 눈금을 먼저
       깔고 값을 얹어, 사람이 없던 시간도 0 으로 자리를 지킨다.
    */
    /*
       날짜별 값도 그대로 둔다.

       화면이 아직 daily 를 보고 그린다. 이 함수만 먼저 올려도 그래프가 깨지지
       않도록 둘 다 내보낸다. 화면이 series 로 옮겨간 뒤에 지운다.
    */
    'daily', coalesce((
      select jsonb_agg(x order by x.day)
        from (
          select (created_at at time zone 'Asia/Seoul')::date as day,
                 count(distinct session_id) as visitors
            from public.events
           where created_at >= from_ts and created_at < to_ts
             and name = 'page_view' and not internal
           group by 1
        ) x
    ), '[]'::jsonb),

    'series', coalesce((
      select jsonb_agg(
               jsonb_build_object(
                 'at',       to_char(g.at, 'YYYY-MM-DD"T"HH24:MI'),
                 'visitors', coalesce(v.n, 0)
               ) order by g.at
             )
        from generate_series(
               date_trunc(bucket, from_ts at time zone 'Asia/Seoul'),
               date_trunc(bucket, to_ts   at time zone 'Asia/Seoul'),
               step
             ) g(at)
        left join (
          select date_trunc(bucket, created_at at time zone 'Asia/Seoul') as at,
                 count(distinct session_id) as n
            from public.events
           where created_at >= from_ts and created_at < to_ts
             and name = 'page_view' and not internal
           group by 1
        ) v on v.at = g.at
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_stats(integer, timestamptz, timestamptz) from public;
grant execute on function public.admin_stats(integer, timestamptz, timestamptz) to authenticated;
