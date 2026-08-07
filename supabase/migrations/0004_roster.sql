-- 학회원 명단과 자동 승인
--
-- 지금까지는 모든 가입이 운영진의 수동 확인을 거쳤다. 명단을 미리 올려두면
-- 그 메일로 가입한 사람은 확인 없이 통과시킬 수 있다. 구글 로그인이 "이 사람이
-- 이 메일의 주인" 임을 증명해주므로, 명단에 그 메일이 있다는 것은 곧 학회원임이
-- 확인된 것과 같다.
--
-- 명단에 없는 사람은 종전대로 기수·이름을 적어 신청하고 운영진이 승인한다.
-- 두 경로가 공존한다.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. 직책
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 컬럼 이름을 position 으로 두지 않는다. position 은 SQL 키워드라(POSITION(x IN y))
-- 따옴표 없이 쓰면 파서가 걸리는 자리가 생긴다.

alter table public.profiles
  add column if not exists title text;

comment on column public.profiles.title is
  '학회 내 직책(대표/부대표/팀장 등). 비어 있으면 일반 학회원.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. 명단
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.roster (
  email      text primary key,     -- 소문자로 정규화해 저장한다
  name       text     not null,
  generation smallint not null,
  title      text,
  added_by   uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.roster is
  '운영진이 올려두는 학회원 명단. 여기 있는 메일로 가입하면 자동 승인된다.';

alter table public.roster enable row level security;

-- 명단은 개인 연락처 목록이다. 운영진만 본다.
drop policy if exists "admins read roster" on public.roster;
create policy "admins read roster"
  on public.roster for select
  using (public.is_admin());

drop policy if exists "admins write roster" on public.roster;
create policy "admins write roster"
  on public.roster for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. 가입 시 명단 대조
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  -- 승인할 사람이 아무도 없으면 첫 운영진이 생길 수 없다. 이 계정만 예외로 둔다.
  bootstrap_admins constant text[] := array['hi.danleedev@gmail.com'];
  em    text := lower(new.email);
  entry public.roster%rowtype;
begin
  select * into entry from public.roster where email = em;

  insert into public.profiles (id, email, name, generation, title, status, role)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(entry.name, ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      new.email
    ),
    entry.generation,
    entry.title,
    case
      when entry.email is not null or em = any(bootstrap_admins)
        then 'approved'::public.member_status
      else 'pending'::public.member_status
    end,
    case
      when em = any(bootstrap_admins) then 'admin'::public.member_role
      else 'member'::public.member_role
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. 명단 등록 (운영진 전용)
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 붙여넣은 텍스트를 SQL 에서 쪼개려 들면 따옴표·공백·엑셀 탭 때문에 금방
-- 지저분해진다. 파싱은 화면에서 하고 여기로는 정제된 배열만 들어온다.

create or replace function public.upsert_roster(p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  saved integer;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  insert into public.roster (email, name, generation, title, added_by)
  select lower(trim(r ->> 'email')),
         trim(r ->> 'name'),
         (r ->> 'generation')::smallint,
         nullif(trim(coalesce(r ->> 'title', '')), ''),
         auth.uid()
    from jsonb_array_elements(p_rows) as r
   where coalesce(trim(r ->> 'email'), '') <> ''
  on conflict (email) do update
     set name       = excluded.name,
         generation = excluded.generation,
         title      = excluded.title;

  get diagnostics saved = row_count;

  -- 명단을 나중에 올렸더라도 이미 가입해 기다리는 사람은 여기서 통과시킨다.
  -- 이 과정이 없으면 "명단에 올렸는데 왜 아직 대기냐" 가 반복된다.
  update public.profiles p
     set status      = 'approved',
         name        = coalesce(nullif(p.name, ''), e.name),
         generation  = coalesce(p.generation, e.generation),
         title       = coalesce(p.title, e.title),
         reviewed_by = auth.uid(),
         reviewed_at = now(),
         reject_note = null
    from public.roster e
   where lower(p.email) = e.email
     and p.status <> 'approved';

  return saved;
end;
$$;

revoke all on function public.upsert_roster(jsonb) from public;
grant execute on function public.upsert_roster(jsonb) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. 이미 가입한 계정 정리
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 트리거가 없던 시점에 가입했거나 마이그레이션 전에 로그인한 계정은 프로필 행이
-- 없다. 화면에는 "프로필을 불러오지 못했습니다" 로 보인다. 여기서 채워 넣는다.

insert into public.profiles (id, email, name, status, role)
select u.id,
       u.email,
       coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), u.email),
       'pending',
       'member'
  from auth.users u
  left join public.profiles p on p.id = u.id
 where p.id is null;

-- 대표 계정. 명단에도 넣어두어 재가입하거나 다른 기기에서 로그인해도 같게 잡힌다.
insert into public.roster (email, name, generation, title)
values ('hi.danleedev@gmail.com', '이성민', 14, '대표')
on conflict (email) do update
   set name       = excluded.name,
       generation = excluded.generation,
       title      = excluded.title;

update public.profiles
   set name       = '이성민',
       generation = 14,
       department = coalesce(nullif(department, ''), '컴퓨터학과'),
       title      = '대표',
       status     = 'approved',
       role       = 'admin'
 where lower(email) = 'hi.danleedev@gmail.com';

-- 명단에 있는 나머지 계정도 지금 한 번 맞춰준다.
update public.profiles p
   set status     = 'approved',
       name       = coalesce(nullif(p.name, ''), e.name),
       generation = coalesce(p.generation, e.generation),
       title      = coalesce(p.title, e.title)
  from public.roster e
 where lower(p.email) = e.email
   and p.status <> 'approved';
