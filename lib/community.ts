import type { JSONContent } from "@tiptap/react";

import { createClient } from "lib/supabase/client";

/**
 * 게시판 데이터.
 *
 * 화면마다 쿼리를 따로 쓰면 컬럼 이름 하나 바뀔 때 찾아다녀야 한다. 여기 모은다.
 */

export type Board = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  write_role: "member" | "admin";
  sort_order: number;
};

export type PostListItem = {
  id: string;
  board_id: string;
  board_slug: string;
  board_name: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  pinned: boolean;
  view_count: number;
  company: string | null;
  deadline: string | null;
  created_at: string;
  author_id: string;
  author_name: string | null;
  author_generation: number | null;
  author_title: string | null;
  comment_count: number;
  like_count: number;
};

export type Post = {
  id: string;
  board_id: string;
  title: string;
  content: JSONContent | null;
  body: string | null;
  company: string | null;
  deadline: string | null;
  link: string | null;
  pinned: boolean;
  view_count: number;
  author_id: string;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string;
  body: string;
  deleted_at: string | null;
  created_at: string;
  author?: { name: string | null; generation: number | null } | null;
};

export async function fetchBoards() {
  const { data } = await createClient()
    .from("boards")
    .select("*")
    .order("sort_order");
  return (data as Board[]) ?? [];
}

/**
 * 승인을 기다리는 사람 수.
 *
 * 운영진 화면으로 가는 자리에 함께 보여준다. 들어가 봐야 알 수 있으면 며칠씩
 * 방치되는데, 숫자가 옆에 있으면 그럴 일이 없다.
 *
 * 기수가 없는 행은 세지 않는다. 계정만 만들고 신청서를 아직 안 쓴 사람이라
 * 운영진이 할 수 있는 일이 없다 - admin 화면의 대기 목록과 같은 기준이다.
 *
 * 행을 받지 않고 개수만 센다(head: true). 운영진이 아닌 계정이 불러도 RLS 가
 * 자기 행만 보여주므로 남의 수는 새지 않는다.
 */
export async function fetchPendingCount() {
  const { count } = await createClient()
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
    .not("generation", "is", null);
  return count ?? 0;
}

export async function fetchPosts(boardSlug: string | null, limit = 30) {
  let q = createClient()
    .from("post_list")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (boardSlug) q = q.eq("board_slug", boardSlug);

  const { data } = await q;
  return (data as PostListItem[]) ?? [];
}

export async function fetchPost(id: string) {
  const { data } = await createClient()
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Post) ?? null;
}

/**
 * 댓글과 글쓴이 이름을 함께.
 *
 * 댓글마다 프로필을 따로 물어보면 스무 개짜리 글에서 요청이 스물한 번이다.
 */
export async function fetchComments(postId: string) {
  const { data } = await createClient()
    .from("post_comments")
    .select("*, author:profiles!post_comments_author_id_fkey(name, generation)")
    .eq("post_id", postId)
    .order("created_at");
  return (data as Comment[]) ?? [];
}

export async function toggleLike(postId: string, userId: string, on: boolean) {
  const supabase = createClient();
  if (on) {
    await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: userId });
  } else {
    await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
  }
}

export async function fetchMyLike(postId: string, userId: string) {
  const { data } = await createClient()
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

/** 언제 썼는지. 오늘 쓴 글에 날짜를 찍으면 새 글인지 알기 어렵다. */
export function whenText(iso: string) {
  const then = new Date(iso);
  const diff = Date.now() - then.getTime();
  const min = Math.floor(diff / 60000);

  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}일 전`;

  return `${then.getFullYear()}. ${String(then.getMonth() + 1).padStart(2, "0")}. ${String(
    then.getDate(),
  ).padStart(2, "0")}`;
}

/** 글쓴이를 부르는 말. "14기 이성민" 처럼. */
export function authorText(
  name: string | null,
  generation: number | null,
  title?: string | null,
) {
  const who = name?.trim() || "이름 없음";
  const parts = [];
  if (generation) parts.push(`${generation}기`);
  if (title) parts.push(title);
  return parts.length ? `${parts.join(" ")} ${who}` : who;
}
