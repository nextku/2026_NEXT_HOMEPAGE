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
        "여기에 쓰세요. '# ' 로 제목, '- ' 로 목록, 사진은 끌어다 놓으면 됩니다.",
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
