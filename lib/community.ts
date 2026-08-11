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
  author_staff_generation: number | null;
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
/**
 * 댓글과 글쓴이 이름.
 *
 * 한 번에 붙여 받지 않는다. 예전에는 이렇게 물었다.
 *
 *   .select("*, author:profiles!post_comments_author_id_fkey(name, generation)")
 *
 * post_comments.author_id 는 auth.users 를 참조하므로 그 이름의 관계는
 * profiles 로 가지 않는다. 관계를 못 찾으면 한 줄도 못 가져오는 것이 아니라
 * 쿼리 전체가 실패하는데, 그 실패를 버리고 빈 배열을 돌려주고 있어서 댓글이
 * 하나도 없는 것처럼 보였다. 글은 계속 저장되고 있었다.
 *
 * 표를 따로 읽고 화면에서 잇는다. 요청이 하나 늘지만 사람 수만큼이 아니라
 * 언제나 두 번이고, 관계 이름에 기대지 않아 같은 방식으로 조용히 깨지지 않는다.
 *
 * 실패는 돌려준다. 삼키면 이 일이 그대로 되풀이된다.
 */
export async function fetchComments(postId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at");

  if (error) return { rows: [] as Comment[], error: error.message };

  const rows = (data as Comment[]) ?? [];
  const ids = Array.from(new Set(rows.map((r) => r.author_id)));
  if (ids.length === 0) return { rows, error: null };

  // 이름표에 쓰는 칸만 나오는 창. 메일 주소 같은 것은 여기로 안 나온다.
  const { data: people, error: peopleError } = await supabase
    .from("member_public")
    .select("id, name, generation")
    .in("id", ids);

  /*
     이름을 못 읽어도 댓글은 보여준다. 글이 있는데 이름 때문에 통째로 감추는
     것은 손해가 크다. 다만 조용히 "이름 없음" 으로 두지는 않는다 - 그러면
     창이 없는 것인지 정말 이름이 빈 것인지 알 수 없다.
  */

  const byId = new Map(
    (people ?? []).map((p: { id: string; name: string | null; generation: number | null }) => [
      p.id,
      { name: p.name, generation: p.generation },
    ]),
  );

  return {
    rows: rows.map((r) => ({ ...r, author: byId.get(r.author_id) ?? null })),
    error: null,
  };
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
  staffGeneration?: number | null,
) {
  const who = name?.trim() || "이름 없음";
  const role = title?.trim();

  /*
     직책은 그것을 맡은 기수에 붙인다.

     14기로 들어와 15기에 대표를 맡은 사람이 "14기 대표" 로 나왔다. 들어온
     기수와 직책을 맡은 기수를 그냥 이어 붙였기 때문인데, 그 사람은 14기 때
     대표가 아니었다. 직책은 지금 맡고 있는 자리이므로 그 기수를 쓴다.

     이름표 한 줄에 둘 다 넣지는 않는다. 글쓴이 자리에서 알고 싶은 것은 "지금
     누구인가" 이고, 들어온 기수까지 붙이면 길어져 제목을 밀어낸다. 두 기수를
     함께 보여주는 것은 내 정보 쪽의 memberLabel 이 한다.
  */
  const at = role && staffGeneration ? staffGeneration : generation;

  const parts = [];
  if (at) parts.push(`${at}기`);
  /*
     직책이 이름과 같으면 붙이지 않는다. 공용 계정은 이름과 직책이 둘 다
     "관리자" 라서 "관리자 관리자" 로 나왔다.
  */
  if (role && role !== who) parts.push(role);
  return parts.length ? `${parts.join(" ")} ${who}` : who;
}
