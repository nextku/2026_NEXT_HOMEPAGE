-- 관리자(소유 계정)와 운영진을 나눈다
--
-- 지금까지는 권한이 하나였다. 그래서 대표가 바뀔 때마다 "누가 최종 권한을
-- 가지는가" 가 사람에게 묶였다. 대표 계정이 곧 최고 권한이면, 인수인계가
-- 곧 계정 넘기기가 된다.
--
-- 학회 공용 메일을 관리자로 두고, 대표를 포함한 사람들은 운영진으로 둔다.
-- 사람은 매년 바뀌지만 학회 메일은 남는다. 관리자 권한은 필요할 때 다음
-- 계정으로 넘긴다.
--
--   관리자(is_owner)  운영진이 하는 모든 일 + 운영진 정리 + 권한 이전
--   운영진(role=admin) 승인·명단·통계·글쓰기
--   학회원(role=member) 라운지
--
-- enum 에 값을 더하지 않고 컬럼을 하나 둔다. ALTER TYPE ... ADD VALUE 는
-- 같은 트랜잭션 안에서 그 값을 쓸 수 없어서, 한 파일로 실행하면 중간에 막힌다.

alter table public.profiles
  add column if not exists is_owner boolean not null default false;

comment on column public.profiles.is_owner is
  '학회 공용 관리자 계정. 항상 한 명이며 권한 이전으로만 바뀐다.';

-- 두 명이 되는 순간 "누가 최종인가" 가 사라진다. DB 가 막는다.
create unique index if not exists profiles_one_owner
  on public.profiles ((is_owner)) where is_owner;

-- ─────────────────────────────────────────────────────────────────────────────
-- is_owner 는 아무도 직접 못 고친다
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 정책으로 막으려 하면 "본인 수정" 과 "운영진 수정" 두 곳에 같은 조건을 넣어야
-- 하고, 나중에 정책을 하나 더 만들 때 빠뜨린다. 컬럼 자체를 못 쓰게 하고
-- 이전 함수만 열어두는 편이 확실하다.

revoke update on public.profiles from authenticated;
grant update (
  name, generation, department, title, staff_generation,
  status, role, reviewed_by, reviewed_at, reject_note
) on public.profiles to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 권한 판별
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_owner and status = 'approved'
  );
$$;

-- 관리자는 운영진이 하는 일을 모두 할 수 있다. 따로 확인하지 않아도 되게 여기 포함한다.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'approved'
      and (role = 'admin' or is_owner)
  );
$$;

-- 운영진이 관리자 계정을 건드리지 못하게 한다. 그러지 않으면 운영진 한 명이
-- 관리자를 학회원으로 내려버릴 수 있다.
drop policy if exists "admins update any profile" on public.profiles;
create policy "admins update any profile"
  on public.profiles for update
  using (public.is_admin() and (not is_owner or public.is_owner()))
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 권한 이전
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 한 문장으로 옮긴다. 내리고 올리는 것을 두 문장으로 나누면 그 사이에 관리자가
-- 없는 순간이 생기고, 유니크 색인도 중간 상태에서 걸린다.

create or replace function public.transfer_ownership(p_target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_owner() then
    raise exception 'owner only';
  end if;

  if not exists (
    select 1 from public.profiles
     where id = p_target and status = 'approved'
  ) then
    raise exception 'target must be an approved member';
  end if;

  update public.profiles
     set is_owner = (id = p_target),
         -- 넘겨받는 사람은 운영진 권한도 함께 갖는다. 넘긴 사람은 운영진으로 남는다.
         role = case when id = p_target then 'admin'::public.member_role else role end
   where is_owner or id = p_target;
end;
$$;

revoke all on function public.transfer_ownership(uuid) from public;
grant execute on function public.transfer_ownership(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 지금 상태 맞추기
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 학회 공용 메일을 관리자로. 대표 계정은 운영진으로 내린다 — 사람이 바뀌어도
-- 최종 권한은 학회에 남아야 한다.

update public.profiles
   set is_owner = (lower(email) = 'nextku.contact@gmail.com'),
       role = 'admin'
 where lower(email) in ('nextku.contact@gmail.com', 'hi.danleedev@gmail.com');

update public.profiles
   set status = 'approved'
 where lower(email) = 'nextku.contact@gmail.com';

-- 새로 가입하는 계정 중 학회 공용 메일은 관리자로 시작한다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_email constant text := 'nextku.contact@gmail.com';
  em    text := lower(new.email);
  entry public.roster%rowtype;
begin
  select * into entry from public.roster where email = em;

  insert into public.profiles
    (id, email, name, generation, title, status, role, is_owner)
  values (
    new.id,
    new.email,
    coalesce(nullif(entry.name, ''), nullif(new.raw_user_meta_data ->> 'full_name', ''), ''),
    entry.generation,
    entry.title,
    case
      when entry.email is not null or em = owner_email
        then 'approved'::public.member_status
      else 'pending'::public.member_status
    end,
    case
      when em = owner_email then 'admin'::public.member_role
      else 'member'::public.member_role
    end,
    -- 이미 관리자가 있으면 유니크 색인이 막는다. 그래서 비어 있을 때만 넣는다.
    em = owner_email and not exists (select 1 from public.profiles where is_owner)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
