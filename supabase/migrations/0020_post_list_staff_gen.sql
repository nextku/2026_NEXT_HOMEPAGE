-- 글쓴이 이름표에 직책 기수를 함께 내보낸다
--
-- 14기로 들어와 15기에 대표를 맡은 사람이 글 목록에서 "14기 대표" 로 나왔다.
-- 화면이 들어온 기수(generation)와 직책(title)만 받아서 그냥 이어 붙였기
-- 때문인데, 그 사람은 14기 때 대표가 아니었다.
--
-- 직책을 맡은 기수는 staff_generation 에 따로 있다(0008). 창이 그것을 안
-- 내보내고 있어서 화면이 알 방법이 없었다.

-- 지우고 다시 만든다.
--
-- create or replace 는 칸을 뒤에 덧붙이는 것만 되고 중간에 끼우지는 못한다.
-- author_staff_generation 을 comment_count 앞에 두었더니 자리가 밀려서
-- "cannot change name of view column" 으로 거절당했다. 칸 순서를 읽기 좋게
-- 두려면 지우고 새로 만드는 편이 낫다. 이 창에 기대는 다른 창은 없다.
drop view if exists public.post_list;

create view public.post_list as
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
         pr.name             as author_name,
         pr.generation       as author_generation,
         pr.title            as author_title,
         pr.staff_generation as author_staff_generation,
         (select count(*) from public.post_comments c
           where c.post_id = p.id and c.deleted_at is null) as comment_count,
         (select count(*) from public.post_likes  l where l.post_id = p.id) as like_count
    from public.posts p
    join public.boards b        on b.id = p.board_id
    left join public.member_public pr on pr.id = p.author_id
   where p.published;

grant select on public.post_list to authenticated;
alter view public.post_list set (security_invoker = true);
