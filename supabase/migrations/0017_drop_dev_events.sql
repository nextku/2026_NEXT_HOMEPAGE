-- 개발하며 남은 방문 기록을 지운다
--
-- 화면을 확인하려고 만든 임시 페이지(/__preview, /zz-preview)의 방문이 실제
-- 통계에 들어가 있었다. 로컬 개발 서버도 .env.local 을 통해 운영 데이터베이스를
-- 보기 때문이다. 게다가 그 브라우저는 로그인한 적이 없어 internal 표시가 붙지
-- 않았고, 그래서 바깥에서 온 손님으로 집계됐다. 지원 유입을 보는 숫자가 그만큼
-- 부풀어 있었다.
--
-- 다시 생기지 않게 하는 것은 코드 쪽에서 한다(lib/analytics.ts). 여기서는 이미
-- 쌓인 것을 걷어낸다.
--
-- 세션 단위로 지운다. 임시 페이지를 거친 세션은 그 방문 자체가 개발 중에 생긴
-- 것이므로, 같은 세션이 홈이나 지원 페이지를 열어본 기록도 함께 지워야 방문자
-- 수가 맞는다. 행만 골라 지우면 세션은 남아 사람 수가 그대로다.

delete from public.events
 where session_id in (
   select distinct session_id
     from public.events
    where path like '/__preview%'
       or path like '/zz-preview%'
 );

-- 세션 없이 들어온 것(저장소를 못 쓰는 브라우저)도 같은 경로면 지운다.
delete from public.events
 where session_id is null
   and (path like '/__preview%' or path like '/zz-preview%');
