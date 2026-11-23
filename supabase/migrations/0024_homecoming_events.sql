-- 홈커밍 사이트의 방문·클릭 기록
--
-- 홈커밍 신청 사이트(next-homecoming.vercel.app)는 이 홈페이지와 따로 돌지만,
-- 운영진이 숫자를 보는 곳은 여기 /admin 하나로 둔다. 행사가 끝나면 지울 수 있게
-- events 와 섞지 않고 표를 따로 둔다.
--
-- events 와 다른 점
--   events 는 표에 익명 insert 를 열어두었다. 여기는 표를 잠그고 아래 함수 하나로만
--   쓴다(presence 와 같은 방식). 값 검사와 시각을 서버가 정하므로, 공개 키를 가진
--   누구라도 지난 날짜로 기록을 지어내거나 마음대로 칸을 채울 수 없다.
--
-- 개인정보
--   누가 했는지는 담지 않는다. session_id 는 브라우저가 만든 난수이고, 신청자
--   확인도 성공·실패 여부만 남긴다. 이름·전화번호·IP 는 받지도 저장하지도 않는다.

create table if not exists public.homecoming_events (
  id         bigserial primary key,
  name       text not null,
  session_id text,
  -- mobile / tablet / desktop
  device     text,
  -- 들어온 곳: 다른 사이트의 호스트(utm_source 가 있으면 그것). 직접 방문은 비운다.
  source     text,
  -- utm_campaign (없으면 utm_medium)
  campaign   text,
  -- 기수 자리(4-15, 운영진 16). 공유 링크로 들어온 방문은 그 링크의 기수.
  cohort     smallint,
  -- 어디서 눌렀나 (intro, join, bar, hall, chip, roster, link, mine ...)
  place      text,
  -- 어떻게 됐나 (shared, copied, ok, fail, reset, zoom_in ...)
  detail     text,
  -- 신청자로 확인된 브라우저에서 온 기록
  signer     boolean not null default false,
  created_at timestamptz not null default now(),

  constraint homecoming_events_name_check check (
    name in (
      'page_view', 'signup_click', 'share_click', 'seat_view', 'walk_start',
      'walk_skip', 'hall_touch', 'hall_control', 'signer_check'
    )
  ),
  constraint homecoming_events_device_check check (
    device is null or device in ('mobile', 'tablet', 'desktop')
  ),
  constraint homecoming_events_cohort_check check (
    cohort is null or cohort between 1 and 99
  )
);

comment on table public.homecoming_events is
  '홈커밍 사이트의 익명 방문·클릭 기록. log_homecoming() 으로만 쓰고 운영진만 읽는다.';

create index if not exists homecoming_events_recent_idx  on public.homecoming_events (created_at desc);
create index if not exists homecoming_events_name_idx    on public.homecoming_events (name, created_at desc);
create index if not exists homecoming_events_session_idx on public.homecoming_events (session_id, created_at desc);

alter table public.homecoming_events enable row level security;

-- 0007 의 기본 권한이 새 표마다 authenticated 에 쓰기 권한을 준다. 여기는 함수로만
-- 쓰는 표라 그 권한을 거둔다. 읽기 권한만 남기고, 실제로 읽는 사람은 정책이 정한다.
revoke all on public.homecoming_events from anon, authenticated;
grant select on public.homecoming_events to authenticated;

drop policy if exists "admins read homecoming events" on public.homecoming_events;
create policy "admins read homecoming events"
  on public.homecoming_events for select
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 기록 한 줄
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 잘못된 값은 거절하지 않고 비운다. 기록은 부가 기능이라, 사이트 쪽 코드가 조금
-- 어긋나도 오류를 돌려주기보다 남길 수 있는 만큼 남기는 편이 낫다. 이름이 목록에
-- 없을 때만 통째로 버린다.

create or replace function public.log_homecoming(
  p_name     text,
  p_session  text    default null,
  p_device   text    default null,
  p_source   text    default null,
  p_campaign text    default null,
  p_cohort   integer default null,
  p_place    text    default null,
  p_detail   text    default null,
  p_signer   boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sid text := case
    when p_session ~ '^[A-Za-z0-9_-]{8,64}$' then p_session
  end;
begin
  if p_name is null or p_name not in (
    'page_view', 'signup_click', 'share_click', 'seat_view', 'walk_start',
    'walk_skip', 'hall_touch', 'hall_control', 'signer_check'
  ) then
    return;
  end if;

  -- 한 브라우저가 일 분에 백 줄 넘게 보내면 사람이 누른 것이 아니다. 더 받지 않는다.
  if sid is not null and (
    select count(*) from public.homecoming_events
     where session_id = sid and created_at > now() - interval '1 minute'
  ) >= 100 then
    return;
  end if;

  insert into public.homecoming_events
    (name, session_id, device, source, campaign, cohort, place, detail, signer)
  values (
    p_name,
    sid,
    case when p_device in ('mobile', 'tablet', 'desktop') then p_device end,
    nullif(left(lower(trim(coalesce(p_source, ''))), 120), ''),
    nullif(left(trim(coalesce(p_campaign, '')), 120), ''),
    case when p_cohort between 1 and 99 then p_cohort end,
    case when p_place  ~ '^[a-z0-9_]{1,24}$' then p_place end,
    case when p_detail ~ '^[a-z0-9_]{1,24}$' then p_detail end,
    coalesce(p_signer, false)
  );
end;
$$;

revoke all on function public.log_homecoming(text, text, text, text, text, integer, text, text, boolean) from public;
grant execute on function public.log_homecoming(text, text, text, text, text, integer, text, text, boolean) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 집계
-- ─────────────────────────────────────────────────────────────────────────────
--
-- admin_stats 와 같다: 세는 일은 DB 가 하고 결과만 보낸다. 사람 수는 세션 수로
-- 센다. 한 사람이 여러 번 누른 것이 여러 명으로 보이지 않게 한다.

create or replace function public.admin_homecoming_stats(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  since timestamptz := now() - make_interval(days => greatest(p_days, 1));
  result jsonb;
begin
  -- null 이 와도 통과하지 않게 한다(not null 은 null 이라 if 를 그냥 지나친다)
  if not coalesce(public.is_admin(), false) then
    raise exception 'admin only';
  end if;

  with ev as (
    select * from public.homecoming_events where created_at >= since
  )
  select jsonb_build_object(
    'days', greatest(p_days, 1),
    'events', (select count(*) from ev),

    -- 방문에서 신청 클릭까지. 3D 를 만져본 사람, 기수 자리까지 가본 사람이 중간 단계다.
    'funnel', jsonb_build_object(
      'visitors', (select count(distinct session_id) from ev where name = 'page_view'),
      'touched',  (select count(distinct session_id) from ev
                    where name in ('hall_touch', 'hall_control', 'seat_view', 'walk_start')),
      'seat',     (select count(distinct session_id) from ev where name in ('seat_view', 'walk_start')),
      'signup',   (select count(distinct session_id) from ev where name = 'signup_click')
    ),

    'signers', (select count(distinct session_id) from ev where name = 'page_view' and signer),

    'devices', coalesce((
      select jsonb_agg(x order by x.visitors desc)
        from (
          select coalesce(device, 'unknown') as device,
                 count(distinct session_id)  as visitors
            from ev where name = 'page_view'
           group by 1
        ) x
    ), '[]'::jsonb),

    'sources', coalesce((
      select jsonb_agg(x order by x.visitors desc)
        from (
          select coalesce(source, '직접 방문') as source,
                 count(distinct session_id)    as visitors
            from ev where name = 'page_view'
           group by 1
        ) x
    ), '[]'::jsonb),

    'campaigns', coalesce((
      select jsonb_agg(x order by x.visitors desc)
        from (
          select campaign, count(distinct session_id) as visitors
            from ev where name = 'page_view' and campaign is not null
           group by 1
        ) x
    ), '[]'::jsonb),

    -- 버튼과 3D 조작. 화면이 이름·위치·결과를 한국어로 바꿔 보여준다.
    'actions', coalesce((
      select jsonb_agg(x order by x.count desc)
        from (
          select name, place, detail,
                 count(*)                   as count,
                 count(distinct session_id) as people
            from ev where name <> 'page_view'
           group by name, place, detail
        ) x
    ), '[]'::jsonb),

    -- 어느 기수 자리를 많이 봤나
    'cohorts', coalesce((
      select jsonb_agg(x order by x.views desc)
        from (
          select cohort,
                 count(*)                   as views,
                 count(distinct session_id) as people
            from ev where name = 'seat_view' and cohort is not null
           group by cohort
        ) x
    ), '[]'::jsonb),

    -- 어느 기수의 공유 링크로 몇 명이 들어왔나
    'shared_in', coalesce((
      select jsonb_agg(x order by x.visitors desc)
        from (
          select cohort, count(distinct session_id) as visitors
            from ev where name = 'page_view' and place = 'link' and cohort is not null
           group by cohort
        ) x
    ), '[]'::jsonb),

    'daily', coalesce((
      select jsonb_agg(x order by x.day)
        from (
          select (created_at at time zone 'Asia/Seoul')::date as day,
                 count(distinct session_id)                   as visitors
            from ev where name = 'page_view'
           group by 1
        ) x
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_homecoming_stats(integer) from public;
grant execute on function public.admin_homecoming_stats(integer) to authenticated;
