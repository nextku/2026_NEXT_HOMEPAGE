-- 승인된 뒤에는 기수를 스스로 바꾸지 못하게 한다
--
-- 기존 "update own profile" 정책은 status 와 role 만 고정했다. 그래서 승인된
-- 학회원이 기수를 아무 값으로나 바꿀 수 있었다. 기수는 운영진이 명단과 대조해
-- 승인한 근거이므로, 승인 뒤에 그것만 바뀌면 승인의 의미가 사라진다.
--
-- 이름과 학과는 그대로 열어둔다. 오타를 본인이 고칠 수 있어야 한다.
-- 기수를 정말 고쳐야 하면 운영진이 고친다("admins update any profile").
--
-- 승인 전(pending/rejected)에는 기수도 바꿀 수 있어야 한다. 신청서를 다시
-- 쓰는 경로가 그것이다.

drop policy if exists "update own profile" on public.profiles;

create policy "update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and status = (select status from public.profiles where id = auth.uid())
    and role   = (select role   from public.profiles where id = auth.uid())
    and (
      -- 승인 전에는 자유롭게, 승인 뒤에는 기수 고정
      (select status from public.profiles where id = auth.uid()) <> 'approved'
      or generation is not distinct from
         (select generation from public.profiles where id = auth.uid())
    )
  );
