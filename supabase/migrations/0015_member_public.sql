-- 글쓴이 이름이 보이게 한다
--
-- 두 가지가 겹쳐 있었다.
--
-- 1) 댓글이 화면에 안 나왔다
--
--    post_comments.author_id 는 auth.users 를 참조한다. 그런데 화면은
--    "profiles!post_comments_author_id_fkey" 로 profiles 를 붙여 달라고
--    물었다. 그 이름의 관계는 profiles 로 가지 않으므로 쿼리 전체가 실패했고,
--    실패를 버리고 빈 배열을 돌려주는 코드 때문에 댓글이 하나도 없는 것처럼
--    보였다. 글은 잘 저장되고 있었다.
--
-- 2) 학회원은 서로의 이름을 못 읽었다
--
--    profiles 의 select 정책은 "본인" 과 "운영진" 뿐이다. 운영진에게는 목록이
--    멀쩡해 보였지만, 일반 학회원 눈에는 남이 쓴 글의 글쓴이가 전부 비어 있다.
--
--    그렇다고 profiles 를 통째로 열 수는 없다. 그 표에는 메일 주소가 있고,
--    개인정보처리방침에 적어둔 것보다 넓게 열리게 된다.
--
-- 이름표에 필요한 칸만 내보내는 창을 따로 둔다.

create or replace view public.member_public as
  select id,
         name,
         generation,
         title,
         staff_generation,
         is_owner
    from public.profiles
   where status = 'approved'
     -- 승인되지 않은 계정은 한 줄도 못 가져간다. 창이 정의자 권한으로 돌기
     -- 때문에 여기서 막지 않으면 로그인만 하면 명단이 열린다.
     and public.is_approved();

comment on view public.member_public is
  '이름표에 쓰는 칸만. 메일 주소 같은 것은 나가지 않는다.';

-- 정의자 권한으로 돌려 profiles 의 정책을 지나간다. 대신 위 where 절이
-- 승인 여부를 직접 확인한다.
alter view public.member_public set (security_invoker = false);

revoke all on public.member_public from public, anon;
grant select on public.member_public to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 글 목록도 이 창을 본다
-- ─────────────────────────────────────────────────────────────────────────────
--
-- post_list 는 profiles 를 바로 붙이는데, 이 창은 호출자 권한으로 돌기 때문에
-- 일반 학회원에게는 글쓴이 칸이 비어서 나갔다.

create or replace view public.post_list as
  select p.id,
         p.board_id,
         b.slug        as board_slug,
         b.name        as board_name,
         p.title,
         p.excerpt,
         p.cover_url,
         p.pinned,
         p.view_count,
         p.company,
         p.deadline,
         p.created_at,
         p.author_id,
         pr.name       as author_name,
         pr.generation as author_generation,
         pr.title      as author_title,
         (select count(*) from public.post_comments c
           where c.post_id = p.id and c.deleted_at is null) as comment_count,
         (select count(*) from public.post_likes  l where l.post_id = p.id) as like_count
    from public.posts p
    join public.boards b        on b.id = p.board_id
    left join public.member_public pr on pr.id = p.author_id
   where p.published;

grant select on public.post_list to authenticated;
alter view public.post_list set (security_invoker = true);
