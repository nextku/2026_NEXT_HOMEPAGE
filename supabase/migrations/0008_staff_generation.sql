-- 직책을 맡은 기수, 그리고 이름 자리에 메일이 들어가던 문제
--
-- 1) 14기로 들어와 15기에 운영진을 하는 경우가 있다. 기수 하나로는 그것을
--    적을 수 없어서 "14기 대표" 처럼 사실과 다르게 보였다. 입회 기수와 직책을
--    맡은 기수를 나눈다.
--
--    이력 테이블을 따로 두지 않는다. 대부분의 학회원은 기수 하나에 직책이
--    없고, 있어도 한 번이다. 표를 하나 더 만들면 화면과 정책이 함께 복잡해지는데
--    그만한 이유가 없다.
--
-- 2) 가입할 때 이름을 모르면 메일 주소를 이름으로 넣고 있었다. 그래서 명단에
--    "14기 g4308@naver.com" 같은 행이 생겼다. 모를 때는 비워두고, 화면이
--    이름을 받도록 한다.

alter table public.profiles
  add column if not exists staff_generation smallint;

comment on column public.profiles.staff_generation is
  '직책을 맡은 기수. 입회 기수(generation)와 다를 수 있다. 직책이 없으면 비어 있다.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 이름 채우기 규칙
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 메일 주소로 대신 채우지 않는다. 채워두면 화면은 이름이 있다고 보고 더 묻지
-- 않는데, 그 값은 이름이 아니다. 비워두면 신청서가 이름을 받는다.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bootstrap_admins constant text[] := array['hi.danleedev@gmail.com'];
  em    text := lower(new.email);
  entry public.roster%rowtype;
begin
  select * into entry from public.roster where email = em;

  insert into public.profiles (id, email, name, generation, title, status, role)
  values (
    new.id,
    new.email,
    -- 명단에 있으면 그 이름, 없으면 빈 값. 메일 주소는 쓰지 않는다.
    coalesce(nullif(entry.name, ''), nullif(new.raw_user_meta_data ->> 'full_name', ''), ''),
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

-- 이미 메일 주소가 이름으로 들어간 행을 비운다. 다음 접속 때 신청서가 이름을 묻는다.
update public.profiles
   set name = ''
 where name = email
    or name like '%@%';
