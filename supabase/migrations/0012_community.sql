-- 게시판
--
-- 지금까지의 posts 는 "운영진이 채용 공고를 올리는 곳" 하나였다. 학회원이
-- 서로 글을 쓰는 자리가 없어서 라운지가 공지판에 가까웠다. 게시판을 나누고,
-- 글을 문서로 다룬다.
--
-- 설계에서 정한 것
--   * 게시판은 표로 둔다. 코드에 박으면 새 게시판을 만들 때마다 배포해야 한다.
--   * 본문은 jsonb 로 둔다. HTML 을 저장하면 누가 무엇을 넣었든 그대로 화면에
--     나가므로 저장할 때마다 소독해야 한다. 문서 구조로 두면 읽을 때 우리가
--     아는 태그로만 조립되어 그 위험이 사라진다.
--   * 목록에 쓸 발췌는 따로 저장한다. 목록 열 때마다 본문 전체를 내려받아
--     글자를 뽑아내면 스무 개만 되어도 느려진다.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. 게시판
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.boards (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  -- 누가 글을 쓸 수 있는가. 공지처럼 운영진만 쓰는 판이 있다.
  write_role  public.member_role not null default 'member',
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now()
);

comment on table public.boards is
  '게시판. 코드가 아니라 여기에서 늘린다.';

alter table public.boards enable row level security;

drop policy if exists "approved members read boards" on public.boards;
create policy "approved members read boards"
  on public.boards for select
  using (public.is_approved());

drop policy if exists "admins write boards" on public.boards;
create policy "admins write boards"
  on public.boards for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.boards (slug, name, description, write_role, sort_order) values
  ('notice',  '공지',        '학회 운영 공지. 운영진만 씁니다.',              'admin',  10),
  ('free',    '자유',        '아무 이야기나. 질문도 여기에.',                  'member', 20),
  ('career',  '채용·인턴',   '채용 공고와 인턴 자리를 공유합니다.',            'member', 30),
  ('invest',  '투자·IR',     '투자 소식, IR 자료, 데모데이 정보.',             'member', 40),
  ('event',   '행사',        '학회 안팎의 행사와 모임.',                       'member', 50),
  ('team',    '팀원 모집',   '프로젝트·스터디 팀원을 구합니다.',               'member', 60),
  ('archive', '자료실',      '발표 자료, 템플릿, 참고 링크.',                  'member', 70)
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. 글
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 기존 posts 를 버리지 않고 넓힌다. 이미 쓴 글이 있고, 채용 글의 마감일·회사명
-- 같은 칸은 계속 쓸모가 있다.

alter table public.posts
  add column if not exists board_id    uuid references public.boards(id) on delete cascade,
  add column if not exists content     jsonb,
  add column if not exists excerpt     text,
  add column if not exists cover_url   text,
  add column if not exists view_count  integer not null default 0,
  add column if not exists pinned      boolean not null default false;

-- 예전 글의 분류를 게시판으로 옮긴다.
update public.posts p
   set board_id = b.id
  from public.boards b
 where p.board_id is null
   and b.slug = case p.category
                  when 'notice' then 'notice'
                  when 'job'    then 'career'
                  when 'intern' then 'career'
                  when 'invest' then 'invest'
                  when 'event'  then 'event'
                  else 'free'
                end;

-- 예전 글의 본문(text)은 문단 하나짜리 문서로 바꿔 담는다.
update public.posts
   set content = jsonb_build_object(
         'type', 'doc',
         'content', jsonb_build_array(
           jsonb_build_object(
             'type', 'paragraph',
             'content', jsonb_build_array(
               jsonb_build_object('type', 'text', 'text', body)
             )
           )
         )
       ),
       excerpt = left(body, 200)
 where content is null and coalesce(body, '') <> '';

create index if not exists posts_board_idx
  on public.posts (board_id, pinned desc, created_at desc);

-- 글쓴이가 자기 글을 고치고 지울 수 있어야 한다. 지금은 운영진만 가능했다.
drop policy if exists "authors write posts" on public.posts;
create policy "authors write posts"
  on public.posts for insert
  with check (
    public.is_approved()
    and author_id = auth.uid()
    and exists (
      select 1 from public.boards b
       where b.id = board_id
         and (b.write_role = 'member' or public.is_admin())
    )
  );

drop policy if exists "authors update own posts" on public.posts;
create policy "authors update own posts"
  on public.posts for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "authors delete own posts" on public.posts;
create policy "authors delete own posts"
  on public.posts for delete
  using (author_id = auth.uid() or public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. 댓글
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 지우면 그 아래 답글이 통째로 사라진다. 지운 표시만 남기고 자리는 지킨다.

create table if not exists public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  parent_id  uuid references public.post_comments(id) on delete cascade,
  author_id  uuid not null references auth.users(id) on delete cascade,
  body       text not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists post_comments_post_idx
  on public.post_comments (post_id, created_at);

alter table public.post_comments enable row level security;

drop policy if exists "approved members read comments" on public.post_comments;
create policy "approved members read comments"
  on public.post_comments for select
  using (public.is_approved());

drop policy if exists "approved members write comments" on public.post_comments;
create policy "approved members write comments"
  on public.post_comments for insert
  with check (public.is_approved() and author_id = auth.uid());

drop policy if exists "authors edit own comments" on public.post_comments;
create policy "authors edit own comments"
  on public.post_comments for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "authors remove own comments" on public.post_comments;
create policy "authors remove own comments"
  on public.post_comments for delete
  using (author_id = auth.uid() or public.is_admin());

create trigger post_comments_touch_updated_at
  before update on public.post_comments
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. 좋아요
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 한 사람이 한 번. 키로 막으면 화면에서 따로 검사할 필요가 없다.

create table if not exists public.post_likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

drop policy if exists "approved members read likes" on public.post_likes;
create policy "approved members read likes"
  on public.post_likes for select
  using (public.is_approved());

drop policy if exists "approved members like" on public.post_likes;
create policy "approved members like"
  on public.post_likes for insert
  with check (public.is_approved() and user_id = auth.uid());

drop policy if exists "approved members unlike" on public.post_likes;
create policy "approved members unlike"
  on public.post_likes for delete
  using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. 조회수
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 글쓴이가 자기 글을 수정할 수 있으므로 update 정책만으로는 아무나 조회수를
-- 바꿀 수 있다. 값을 1 올리는 일만 하는 함수를 따로 둔다.

create or replace function public.bump_view(p_post uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_approved() then
    return;
  end if;
  update public.posts set view_count = view_count + 1 where id = p_post;
end;
$$;

revoke all on function public.bump_view(uuid) from public;
grant execute on function public.bump_view(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. 목록에 필요한 것을 한 번에
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 글 목록에서 글쓴이 이름과 댓글 수, 좋아요 수가 함께 필요하다. 화면에서
-- 글마다 따로 물어보면 스무 개면 요청이 예순 번이다.

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
    join public.boards b   on b.id = p.board_id
    left join public.profiles pr on pr.id = p.author_id
   where p.published;

-- 뷰는 기본 권한이 없다. 읽기만 연다. 실제 행 제한은 아래 posts 정책이 한다.
grant select on public.post_list to authenticated;

-- 뷰는 만든 사람 권한으로 도는 것이 기본이라 RLS 를 우회한다. 호출자 권한으로 돌려
-- 승인되지 않은 계정이 목록을 읽지 못하게 한다.
alter view public.post_list set (security_invoker = true);

grant select, insert, update, delete on public.posts         to authenticated;
grant select, insert, update, delete on public.post_comments to authenticated;
grant select, insert, delete         on public.post_likes    to authenticated;
grant select                          on public.boards        to authenticated;
grant insert, update, delete          on public.boards        to authenticated;
