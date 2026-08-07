-- 최초 운영진 지정
--
-- 승인할 사람이 없으면 아무도 승인될 수 없다. 이 한 명만 예외로 자동 승인한다.
-- 이후 운영진 추가는 대시보드에서 한다.
--
-- 이 목록은 코드에 남는 값이므로 비밀이 아니다. 메일 주소를 안다고 해서
-- 그 계정으로 로그인할 수 있는 것은 아니기 때문이다.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bootstrap_admins constant text[] := array['hi.danleedev@gmail.com'];
  is_bootstrap boolean;
begin
  is_bootstrap := new.email = any (bootstrap_admins);

  insert into public.profiles (id, email, name, status, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    case when is_bootstrap then 'approved'::public.member_status
         else 'pending'::public.member_status end,
    case when is_bootstrap then 'admin'::public.member_role
         else 'member'::public.member_role end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- 이미 가입한 뒤에 이 마이그레이션을 돌리는 경우를 위해 한 번 더 맞춘다.
update public.profiles
set role = 'admin', status = 'approved'
where email = 'hi.danleedev@gmail.com';
