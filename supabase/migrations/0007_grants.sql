-- 테이블 접근 권한
--
-- 증상: 로그인은 되는데 프로필을 읽으면 permission denied for table profiles.
--
-- RLS 와 GRANT 는 다른 층이다. 정책은 "어떤 행을 볼 수 있는가" 를 정하고,
-- GRANT 는 "그 테이블을 건드릴 수 있는가" 를 정한다. 정책을 아무리 잘 써도
-- GRANT 가 없으면 그 앞에서 막힌다. 여기서 막히면 오류 문구가 정책 얘기를
-- 하지 않기 때문에 원인을 찾기 어렵다.
--
-- 넓게 주는 것처럼 보이지만 안전하다. 세 테이블 모두 RLS 가 켜져 있고, 행
-- 단위 제한은 정책이 계속한다. GRANT 는 문을 열어줄 뿐 방을 열어주지 않는다.

grant usage on schema public to anon, authenticated;

-- 로그인한 사람. 실제로 볼 수 있는 행은 정책이 정한다.
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.posts    to authenticated;
grant select, insert, update, delete on public.roster   to authenticated;

-- 방문 기록은 로그인하지 않은 사람도 남긴다. 읽기는 운영진만(정책).
grant insert on public.events to anon, authenticated;
grant select on public.events to authenticated;

-- events.id 가 bigserial 이라 시퀀스 권한이 없으면 insert 가 실패한다.
grant usage, select on all sequences in schema public to anon, authenticated;

-- 앞으로 만들 테이블도 같은 상태에서 시작하게 한다. 이걸 빼두면 다음 테이블에서
-- 똑같은 일을 처음부터 다시 겪는다.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;

-- RPC 도 다시 확인해 둔다. 함수는 기본이 public 실행 허용이지만,
-- 앞선 마이그레이션에서 revoke 한 것들이 있다.
grant execute on function public.submit_profile(text, smallint, text) to authenticated;
grant execute on function public.upsert_roster(jsonb)                 to authenticated;
grant execute on function public.admin_stats(integer)                 to authenticated;
