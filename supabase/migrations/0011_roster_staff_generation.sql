-- 명단에도 직책 기수를 담는다
--
-- 프로필에는 입회 기수와 직책 기수를 나눠 뒀는데, 명단에는 기수 하나뿐이라
-- 명단으로 자동 승인된 사람은 "14기 대표" 처럼만 들어갔다. 14기로 들어와
-- 15기에 대표를 맡은 경우를 명단 단계에서부터 적을 수 있게 한다.

alter table public.roster
  add column if not exists staff_generation smallint;

comment on column public.roster.staff_generation is
  '직책을 맡은 기수. 입회 기수와 같으면 비워둔다.';

-- 명단 등록. 화면에서 정제한 배열만 받는다.
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

  insert into public.roster (email, name, generation, title, staff_generation, added_by)
  select lower(trim(r ->> 'email')),
         trim(r ->> 'name'),
         (r ->> 'generation')::smallint,
         nullif(trim(coalesce(r ->> 'title', '')), ''),
         nullif(r ->> 'staff_generation', '')::smallint,
         auth.uid()
    from jsonb_array_elements(p_rows) as r
   where coalesce(trim(r ->> 'email'), '') <> ''
  on conflict (email) do update
     set name             = excluded.name,
         generation       = excluded.generation,
         title            = excluded.title,
         staff_generation = excluded.staff_generation;

  get diagnostics saved = row_count;

  update public.profiles p
     set status           = 'approved',
         name             = coalesce(nullif(p.name, ''), e.name),
         generation       = coalesce(p.generation, e.generation),
         title            = coalesce(p.title, e.title),
         staff_generation = coalesce(p.staff_generation, e.staff_generation),
         reviewed_by      = auth.uid(),
         reviewed_at      = now(),
         reject_note      = null
    from public.roster e
   where lower(p.email) = e.email
     and p.status <> 'approved';

  return saved;
end;
$$;

revoke all on function public.upsert_roster(jsonb) from public;
grant execute on function public.upsert_roster(jsonb) to authenticated;

-- 가입할 때도 명단의 직책 기수를 그대로 받아온다.
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
    (id, email, name, generation, title, staff_generation, status, role, is_owner)
  values (
    new.id,
    new.email,
    coalesce(nullif(entry.name, ''), nullif(new.raw_user_meta_data ->> 'full_name', ''), ''),
    entry.generation,
    entry.title,
    entry.staff_generation,
    case
      when entry.email is not null or em = owner_email
        then 'approved'::public.member_status
      else 'pending'::public.member_status
    end,
    case
      when em = owner_email then 'admin'::public.member_role
      else 'member'::public.member_role
    end,
    em = owner_email and not exists (select 1 from public.profiles where is_owner)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
