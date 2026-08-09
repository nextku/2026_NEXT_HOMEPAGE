import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import React from "react";

import { editorExtensions } from "lib/editor";
import * as S from "styles/community/style";

/**
 * 읽기 화면의 본문.
 *
 * 저장된 HTML 을 그대로 꽂지 않는다. 같은 확장 목록으로 다시 조립하면 우리가
 * 아는 태그만 나오므로, 누가 이상한 것을 넣어두었더라도 화면에 그대로 실리지
 * 않는다. 쓰는 화면과 같은 설정을 쓰니 보이는 모습도 어긋나지 않는다.
 */
export default function PostBody({ doc }: { doc: JSONContent | null }) {
  const editor = useEditor(
    {
      extensions: editorExtensions(),
      content: doc ?? undefined,
      editable: false,
      editorProps: { attributes: { class: "next-doc" } },
    },
    [doc],
  );

  if (!editor) return null;

  return (
    <S.Article>
      <EditorContent editor={editor} />
    </S.Article>
  );
}
