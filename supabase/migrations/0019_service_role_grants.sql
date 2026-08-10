-- service_role 이 명단을 읽을 수 있게 한다
--
-- 요약 메일의 받는 사람을 정하려고 서버가 profiles 를 읽는데 이렇게 막혔다.
--
--   42501: permission denied for table profiles
--
-- RLS 가 아니라 그 앞의 GRANT 다. 0007 에서 authenticated 에만 권한을 줬고
-- service_role 은 빠뜨렸다. 두 층이 따로 논다는 것을 그때 profiles 로 한 번
-- 겪고도 다른 역할에 같은 일을 되풀이했다.
--
-- 필요한 것만 연다. service_role 은 RLS 를 지나가는 열쇠라서 넓게 열어두면
-- 서버 코드가 실수했을 때 막아줄 것이 남지 않는다. 지금 서버가 이 열쇠로 하는
-- 일은 운영진 메일 주소를 읽는 것 하나뿐이다.

grant select on public.profiles to service_role;
