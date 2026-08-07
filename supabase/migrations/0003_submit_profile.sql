-- 승인 신청 제출
--
-- 왜 함수가 필요한가
--   신청서는 두 경우에 제출된다. 처음 내는 경우(status = pending)와, 거절당한
--   뒤 고쳐서 다시 내는 경우(status = rejected)다. 후자는 status 를 pending 으로
--   되돌려야 운영진 대기 목록에 다시 뜬다.
--
--   그런데 status 를 스스로 바꿀 수 있게 RLS 를 열면 pending 인 사람이 자신을
--   approved 로 만들 수 있다. 그래서 update 정책은 그대로 잠가두고, 허용된
--   전이(rejected → pending)만 하는 함수를 따로 둔다.
--
--   security definer 함수는 RLS 를 우회하므로 where 절에 auth.uid() 를 반드시
--   넣어야 한다. 빠뜨리면 남의 프로필을 고칠 수 있다.

create or replace function public.submit_profile(
  p_name       text,
  p_generation smallint,
  p_department text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_department), '') = '' then
    raise exception 'name and department are required';
  end if;
  if p_generation is null or p_generation < 1 or p_generation > 99 then
    raise exception 'invalid generation';
  end if;

  update public.profiles
     set name        = trim(p_name),
         generation  = p_generation,
         department  = trim(p_department),
         -- 거절당한 신청이 다시 들어오면 심사 이력을 지우고 대기열로 되돌린다.
         status      = case when status = 'rejected' then 'pending'::public.member_status
                            else status end,
         reject_note = case when status = 'rejected' then null else reject_note end,
         reviewed_by = case when status = 'rejected' then null else reviewed_by end,
         reviewed_at = case when status = 'rejected' then null else reviewed_at end
   where id = auth.uid()
     -- 이미 승인된 사람이 기수를 바꾸면 승인의 근거가 사라진다.
     and status <> 'approved';

  if not found then
    raise exception 'profile is not open for submission';
  end if;
end;
$$;

revoke all on function public.submit_profile(text, smallint, text) from public;
grant execute on function public.submit_profile(text, smallint, text) to authenticated;
