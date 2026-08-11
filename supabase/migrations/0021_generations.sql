-- 기수와 소속을 표로 나눈다
--
-- 지금은 프로필 한 줄에 세 칸으로 눌러담고 있다.
--
--   generation        14      들어온 기수
--   staff_generation  15      직책을 맡은 기수
--   title             '대표'   직책 (빈 값이면 일반 학회원)
--
-- 직책을 한 번밖에 담지 못한다. 15기 대표였다가 16기에 부대표가 되면 앞의 것이
-- 덮인다. 기수별로 몇 명이었는지도 셀 수 없고, 기수가 언제부터 언제까지였는지도
-- 어디에도 없다.
--
-- 사람과 기수 사이를 표 하나로 두면 "14기 부원" 과 "15기 대표" 가 각각 남는다.
--
-- 직책과 권한은 계속 나눠 둔다. 이미 그렇게 되어 있고, 섞으면 곤란해진다.
--
--   직책  기수마다 다르다      memberships.position   부원·운영진·부대표·대표
--   권한  계정에 붙는다        profiles.role/is_owner  member·admin·owner
--
-- profiles 의 role, is_owner, status 는 건드리지 않는다. 로그인과 승인 흐름은
-- 그대로다.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. 기수
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.generations (
  id         uuid primary key default gen_random_uuid(),
  number     smallint not null unique,
  started_on date,
  ended_on   date,
  created_at timestamptz not null default now(),

  constraint generations_number_range check (number between 1 and 99),
  constraint generations_period check (ended_on is null or started_on is null
                                       or ended_on >= started_on)
);

comment on table public.generations is
  '기수. 활동 중인지는 ended_on 으로 판단한다 - 상태를 따로 저장하면 날짜와 어긋난다.';

alter table public.generations enable row level security;

-- 기수 목록은 승인된 학회원이면 볼 수 있다. 누가 몇 기인지는 명단에 준하는 정보다.
drop policy if exists "approved members read generations" on public.generations;
create policy "approved members read generations"
  on public.generations for select
  using (public.is_approved());

drop policy if exists "admins write generations" on public.generations;
create policy "admins write generations"
  on public.generations for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. 소속
-- ─────────────────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_type where typname = 'membership_position') then
    create type public.membership_position as enum
      ('member', 'staff', 'vice_lead', 'lead');
  end if;
end
$$;

comment on type public.membership_position is
  'member 부원 · staff 운영진 · vice_lead 부대표 · lead 대표';

create table if not exists public.memberships (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  generation_id uuid not null references public.generations(id) on delete cascade,
  position      public.membership_position not null default 'member',
  /*
     목록에 없는 직책을 위한 자리. '팀장' 처럼 기수마다 생기는 것이 있어서
     열어두되, 비어 있으면 position 의 이름을 쓴다. 자유 입력만 두면 "부대표" 와
     "부 대표" 가 섞여 나중에 세지 못한다.
  */
  title_note    text,
  created_at    timestamptz not null default now(),

  -- 한 사람이 한 기수에 두 번 속하지는 않는다.
  unique (profile_id, generation_id)
);

create index if not exists memberships_profile_idx
  on public.memberships (profile_id);
create index if not exists memberships_generation_idx
  on public.memberships (generation_id, position);

alter table public.memberships enable row level security;

drop policy if exists "approved members read memberships" on public.memberships;
create policy "approved members read memberships"
  on public.memberships for select
  using (public.is_approved());

drop policy if exists "admins write memberships" on public.memberships;
create policy "admins write memberships"
  on public.memberships for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.generations to authenticated;
grant select on public.memberships to authenticated;
grant insert, update, delete on public.generations to authenticated;
grant insert, update, delete on public.memberships to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. 지금 있는 값을 옮긴다
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 기존 칸은 지우지 않는다. 화면이 아직 그것을 보고 있고, 옮긴 결과가 맞는지
-- 눈으로 확인한 뒤에 지우는 편이 되돌리기 쉽다.

-- 프로필에 등장하는 기수를 모두 만든다.
insert into public.generations (number)
select distinct g
  from (
    select generation as g from public.profiles where generation is not null
    union
    select staff_generation from public.profiles where staff_generation is not null
  ) x
 where g between 1 and 99
on conflict (number) do nothing;

/*
   직책 글자를 자리로 옮긴다.

   '대표' 와 '부대표' 는 앞뒤가 겹치므로 부대표를 먼저 본다. 그러지 않으면
   '부대표' 가 '대표' 로 잡힌다.
*/
create or replace function public.position_from_title(p_title text)
returns public.membership_position
language sql
immutable
as $$
  select case
    when p_title is null or btrim(p_title) = '' then 'member'::public.membership_position
    when p_title like '%부대표%' then 'vice_lead'::public.membership_position
    when p_title like '%대표%'   then 'lead'::public.membership_position
    when p_title like '%운영진%' then 'staff'::public.membership_position
    else 'staff'::public.membership_position
  end;
$$;

-- 들어온 기수의 소속. 직책을 그 기수에서 맡았을 때만 직책을 붙인다.
insert into public.memberships (profile_id, generation_id, position, title_note)
select p.id,
       g.id,
       case
         when p.title is not null and btrim(p.title) <> ''
              and coalesce(p.staff_generation, p.generation) = p.generation
           then public.position_from_title(p.title)
         else 'member'::public.membership_position
       end,
       case
         when p.title is not null and btrim(p.title) <> ''
              and coalesce(p.staff_generation, p.generation) = p.generation
              and p.title not in ('대표', '부대표', '운영진')
           then p.title
         else null
       end
  from public.profiles p
  join public.generations g on g.number = p.generation
 where p.generation is not null
on conflict (profile_id, generation_id) do nothing;

-- 직책을 맡은 기수가 따로면 그 기수의 소속도 만든다.
insert into public.memberships (profile_id, generation_id, position, title_note)
select p.id,
       g.id,
       public.position_from_title(p.title),
       case when p.title not in ('대표', '부대표', '운영진') then p.title else null end
  from public.profiles p
  join public.generations g on g.number = p.staff_generation
 where p.staff_generation is not null
   and p.title is not null
   and btrim(p.title) <> ''
   and p.staff_generation is distinct from p.generation
on conflict (profile_id, generation_id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. 화면이 읽을 자리
-- ─────────────────────────────────────────────────────────────────────────────

/*
   기수와 자리를 사람이 읽는 말로.

   '15기 대표' 처럼 붙여 쓰는 곳이 여러 군데라, 만드는 규칙을 화면마다 두면
   같은 사람이 화면마다 다르게 불린다. 여기서 한 번 만든다.
*/
create or replace function public.membership_label(
  p_number smallint,
  p_position public.membership_position,
  p_note text
)
returns text
language sql
immutable
as $$
  select p_number || '기' ||
    case
      when coalesce(btrim(p_note), '') <> '' then ' ' || btrim(p_note)
      when p_position = 'lead'      then ' 대표'
      when p_position = 'vice_lead' then ' 부대표'
      when p_position = 'staff'     then ' 운영진'
      else ''
    end;
$$;

/*
   사람마다 '지금 무엇인가' 한 줄.

   글쓴이 이름표가 쓴다. 여러 기수에 속했으면 가장 높은 기수를 쓴다 - 이름표에서
   알고 싶은 것은 지금 누구인가이고, 지나간 기수는 내 정보에서 본다.

   기수마다 활동 기간을 채워두면 ended_on 으로 고를 수도 있지만, 아직 비어 있는
   기수가 있어서 번호로 고른다. 번호가 곧 순서다.
*/
create or replace view public.member_current as
  select distinct on (m.profile_id)
         m.profile_id                                  as id,
         g.number                                      as generation,
         m.position,
         m.title_note,
         public.membership_label(g.number, m.position, m.title_note) as label
    from public.memberships m
    join public.generations g on g.id = m.generation_id
   order by m.profile_id, g.number desc;

grant select on public.member_current to authenticated;
alter view public.member_current set (security_invoker = true);
