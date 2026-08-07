-- 학회원 로그인 / 승인 / 학회원 전용 콘텐츠
--
-- 설계 요지
--   구글 로그인은 "이 사람이 이 메일의 주인이다" 까지만 증명한다.
--   "이 사람이 12기 김철수다" 는 증명하지 못하므로 운영진 승인 단계가 필요하다.
--   졸업하면 학교 메일이 사라져 도메인 제한을 쓸 수 없기 때문에, 예외 없이
--   모든 가입이 승인을 거친다.
--
-- 보안 원칙
--   publishable key 는 브라우저에 그대로 나가는 공개 키다. 접근 제어는 전적으로
--   아래 RLS 정책이 담당한다. API 코드를 잘못 짜도 DB 가 막아야 한다.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. 프로필
-- ─────────────────────────────────────────────────────────────────────────────

create type public.member_status as enum ('pending', 'approved', 'rejected');
create type public.member_role   as enum ('member', 'admin');

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text        not null,
  name        text        not null,
  generation  smallint,                    -- 기수. 명단 대조에 쓴다.
  department  text,
  status      public.member_status not null default 'pending',
  role        public.member_role   not null default 'member',
  -- 승인 이력. 누가 언제 승인했는지 남겨야 나중에 문제가 생겼을 때 추적된다.
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  reject_note text,
  created_at  timestamptz not null default now()
);

comment on table public.profiles is
  '가입자. auth.users 와 1:1. status 가 approved 여야 학회원 콘텐츠를 볼 수 있다.';

create index profiles_status_idx on public.profiles (status, created_at desc);

-- 가입하면 프로필 행이 자동으로 생기게 한다. 클라이언트가 직접 insert 하게 두면
-- 그 호출을 빠뜨리거나 조작할 여지가 생긴다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. 권한 판별 함수
-- ─────────────────────────────────────────────────────────────────────────────
--
-- profiles 정책 안에서 profiles 를 조회하면 정책이 자기 자신을 다시 평가해
-- 무한 재귀에 빠진다. security definer 함수는 RLS 를 우회하므로 이 고리를 끊는다.
-- search_path 를 고정하는 것은 security definer 함수의 필수 방어다.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'approved'
  );
$$;

create or replace function public.is_approved()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. 프로필 정책
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

-- 본인 프로필은 언제나 읽을 수 있다. 승인 대기 화면에서 자기 상태를 봐야 한다.
create policy "read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- 본인이 고칠 수 있는 것은 이름·기수·학과뿐이다.
-- status 와 role 을 스스로 바꿀 수 있으면 승인 절차가 무의미해진다.
create policy "update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and status = (select status from public.profiles where id = auth.uid())
    and role   = (select role   from public.profiles where id = auth.uid())
  );

create policy "admins update any profile"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- insert 는 트리거만 한다. 클라이언트에는 열지 않는다.
-- delete 정책도 두지 않는다. 탈퇴는 auth.users 삭제로 연쇄된다.

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. 학회원 전용 게시물 (채용 · 투자 · 행사)
-- ─────────────────────────────────────────────────────────────────────────────

create type public.post_category as enum ('job', 'intern', 'invest', 'event', 'notice');

create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  category    public.post_category not null,
  title       text not null,
  body        text not null,
  link        text,
  company     text,
  deadline    date,
  author_id   uuid not null references auth.users(id) on delete cascade,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.posts is
  '학회원 전용 게시물. 승인된 학회원만 조회, 운영진만 작성.';

create index posts_feed_idx on public.posts (published, created_at desc);

alter table public.posts enable row level security;

-- 승인된 학회원만 읽는다. 로그인만 했다고 되는 것이 아니다.
create policy "approved members read posts"
  on public.posts for select
  using (published and public.is_approved());

create policy "admins read all posts"
  on public.posts for select
  using (public.is_admin());

create policy "admins write posts"
  on public.posts for insert
  with check (public.is_admin() and author_id = auth.uid());

create policy "admins update posts"
  on public.posts for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins delete posts"
  on public.posts for delete
  using (public.is_admin());

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();
