/**
 * 학회원 영역에서 쓰는 값들.
 *
 * 카테고리 키는 DB 의 post_category enum 과 반드시 같아야 한다.
 * (supabase/migrations/0001_member_auth.sql)
 */

export const POST_CATEGORIES = [
  { key: "job", label: "채용" },
  { key: "intern", label: "인턴" },
  { key: "invest", label: "투자" },
  { key: "event", label: "행사" },
  { key: "notice", label: "공지" },
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number]["key"];

export function categoryLabel(key: string) {
  return POST_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export type Post = {
  id: string;
  category: PostCategory;
  title: string;
  body: string;
  link: string | null;
  company: string | null;
  deadline: string | null;
  created_at: string;
};

/** 15기까지 있으므로 15부터 역순으로 고른다. 알럼나이는 아래쪽에서 찾는다. */
export const GENERATIONS = Array.from({ length: 15 }, (_, i) => 15 - i);

export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * date 컬럼("2026-08-31")은 Date 로 파싱하지 않는다. UTC 자정으로 읽혀서
 * 시간대에 따라 하루 밀린다. 문자열을 그대로 쪼개는 편이 정확하다.
 */
export function formatDay(date: string) {
  const [y, m, d] = date.split("-");
  return y && m && d ? `${y}. ${m}. ${d}` : date;
}

/** 운영진만 글을 쓰지만, javascript: 같은 스킴은 애초에 렌더하지 않는다. */
export function safeLink(url: string | null) {
  if (!url) return null;
  return /^https?:\/\//i.test(url.trim()) ? url.trim() : null;
}
