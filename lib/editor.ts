import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "@tiptap/react";

import { createClient } from "lib/supabase/client";

/**
 * 글 편집기 설정.
 *
 * 쓰는 화면과 읽는 화면이 같은 확장 목록을 써야 한다. 다르면 저장은 됐는데
 * 화면에는 안 나오는 조각이 생긴다.
 *
 * 본문은 HTML 이 아니라 문서(JSON)로 저장한다. HTML 을 담으면 누가 무엇을
 * 넣었든 그대로 화면에 나가서 저장할 때마다 소독해야 하는데, 문서로 두면 읽을
 * 때 우리가 아는 태그로만 조립되므로 그 걱정이 사라진다.
 */

export function editorExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      // 인용문 안에서 엔터를 두 번 치면 빠져나오는 기본 동작을 쓴다.
      codeBlock: { HTMLAttributes: { spellcheck: "false" } },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      // javascript: 같은 주소를 막는다. 링크는 사람이 붙여넣는 값이다.
      protocols: ["http", "https", "mailto"],
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    }),
    Image.configure({ inline: false, allowBase64: false }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({
      placeholder:
        placeholder ??
        "여기에 쓰세요. '/' 를 치면 제목·목록·사진을 고를 수 있습니다.",
    }),
  ];
}

/** 목록에 보여줄 한 토막. 본문 전체를 내려받아 자르지 않으려고 저장해 둔다. */
export function excerptFrom(doc: JSONContent, limit = 180) {
  const out: string[] = [];

  const walk = (node: JSONContent) => {
    if (out.join(" ").length > limit) return;
    if (node.type === "text" && node.text) out.push(node.text);
    if (node.type === "image") out.push("(사진)");
    node.content?.forEach(walk);
  };
  walk(doc);

  const text = out.join(" ").replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

/** 본문에서 처음 나오는 사진. 목록의 썸네일로 쓴다. */
export function firstImage(doc: JSONContent): string | null {
  let found: string | null = null;

  const walk = (node: JSONContent) => {
    if (found) return;
    if (node.type === "image" && typeof node.attrs?.src === "string") {
      found = node.attrs.src;
      return;
    }
    node.content?.forEach(walk);
  };
  walk(doc);

  return found;
}

export function isEmptyDoc(doc: JSONContent | null | undefined) {
  if (!doc?.content?.length) return true;
  return excerptFrom(doc, 1).length === 0 && !firstImage(doc);
}

/* ─── 붙여넣은 마크다운 ────────────────────────────────────────────────── */

/**
 * 붙여넣은 글이 마크다운인가.
 *
 * 편집기의 마크다운 규칙은 글쇠를 누를 때만 돈다. 그래서 문서를 통째로
 * 붙여넣으면 '# ' 이 제목이 되지 않고 글자 그대로 남았다.
 *
 * 다만 모든 붙여넣기를 마크다운으로 읽으면 안 된다. '2026. 8. 3' 같은 줄이
 * 번호 목록이 되고, '- 대표 이성민' 이 글머리표가 된다. 문서 전체를 옮겨온
 * 경우에만 손대도록 줄 머리의 표시를 찾는다.
 */
export function looksLikeMarkdown(text: string) {
  const t = text.trim();
  if (!t) return false;

  const blocks = [
    /^#{1,6}\s+\S/m, // 제목
    /^>\s+\S/m, // 인용
    /^```/m, // 코드 블록
    /^(?:-{3,}|\*{3,}|_{3,})\s*$/m, // 구분선
    /^\s*[-*+]\s+\[[ xX]\]\s/m, // 체크 목록
    /!\[[^\]]*\]\([^)]+\)/, // 사진
    /\[[^\]]+\]\([^)]+\)/, // 링크
    /\*\*[^*\n]+\*\*/, // 굵게
  ];
  if (blocks.some((re) => re.test(t))) return true;

  /*
     글머리표는 그것만으로는 근거가 약하다. 붙여넣은 것이 '- 대표 이성민'
     한 줄일 수도 있다. 두 줄 이상 이어질 때만 목록으로 본다.
  */
  if ((t.match(/^\s*[-*+]\s+\S/gm) ?? []).length >= 2) return true;

  /*
     번호 목록은 더 조심해야 한다. '2026. 8. 3 서류 마감' 처럼 날짜를 세 줄
     적은 것이 '2026.' 때문에 목록으로 읽혔다.

     두 가지를 함께 본다. 번호는 두 자리까지만 — 연도는 네 자리라 걸러진다.
     그리고 첫 항목이 1 이어야 한다 — 옮겨 적은 목록은 1 부터 시작하지만
     날짜는 그럴 이유가 없다.
  */
  const numbered = t.match(/^\s*\d{1,2}[.)]\s+\S/gm) ?? [];
  return numbered.length >= 2 && /^\s*1[.)]\s/.test(numbered[0]);
}

/**
 * 마크다운을 편집기가 아는 문서로.
 *
 * 마크다운 → HTML → 편집기 순서로 간다. HTML 을 그대로 저장하지는 않는다.
 * 편집기가 자기 스키마로 다시 읽으므로, 우리가 정해둔 조각(제목·목록·인용·
 * 코드·링크·사진)만 남고 나머지는 버려진다. 마크다운에 섞인 날 HTML 도 그
 * 단계에서 함께 걸러진다.
 */
export async function markdownToHtml(text: string) {
  const { marked } = await import("marked");
  return marked.parse(text, { async: false, gfm: true, breaks: false });
}

/**
 * 사진 올리기.
 *
 * 사람마다 폴더를 갈라 둔다. 정책으로만 막으면 이름이 겹칠 때 남의 파일을
 * 덮어쓸 수 있는데, 경로가 다르면 그 일이 애초에 일어나지 않는다.
 */
export async function uploadImage(file: File, userId: string) {
  const supabase = createClient();

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const key = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(key, file, { cacheControl: "31536000", upsert: false });

  if (error) return { url: null, error: "사진을 올리지 못했습니다." };

  const { data } = supabase.storage.from("post-images").getPublicUrl(key);
  return { url: data.publicUrl, error: null };
}
