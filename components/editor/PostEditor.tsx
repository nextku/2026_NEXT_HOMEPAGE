import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import type { Editor, JSONContent } from "@tiptap/react";
import React, { useCallback, useRef, useState } from "react";

import {
  editorExtensions,
  looksLikeMarkdown,
  markdownToHtml,
  uploadImage,
} from "lib/editor";
import * as S from "styles/community/style";

/**
 * 글 편집기.
 *
 * 원문과 미리보기를 나란히 두지 않는다. '# ' 를 치면 그 자리에서 제목이 되고,
 * 화면에 보이는 것이 곧 결과물이다. 나눠 보여주면 쓰는 사람이 두 곳을 번갈아
 * 봐야 하고, 마크다운을 모르는 사람은 왼쪽이 무슨 말인지 알 수 없다.
 *
 * 그래서 마크다운을 아는 사람은 그대로 치면 되고, 모르는 사람은 위의 도구나
 * 글을 끌어 선택했을 때 뜨는 막대를 쓰면 된다. 둘 다 같은 결과에 닿는다.
 */

type Props = {
  value: JSONContent | null;
  onChange: (doc: JSONContent) => void;
  userId: string;
  placeholder?: string;
};

const SHORTCUTS = [
  { label: "제목", hint: "# " },
  { label: "목록", hint: "- " },
  { label: "인용", hint: "> " },
  { label: "코드", hint: "``` " },
];

export default function PostEditor({
  value,
  onChange,
  userId,
  placeholder,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  /*
   * 붙여넣기 처리기는 useEditor 설정 안에 있어서 editor 를 아직 볼 수 없다.
   * 만들어진 뒤 이 상자에 넣어두고 그때 꺼내 쓴다.
   */
  const editorRef = useRef<Editor | null>(null);

  const editor = useEditor({
    extensions: editorExtensions(placeholder),
    content: value ?? undefined,
    // 서버에서 그리면 hydration 이 어긋난다. 이 컴포넌트는 항상 클라이언트에서만 뜬다.
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: { class: "next-doc" },
      // 사진을 붙여넣거나 끌어다 놓으면 바로 올린다. 버튼을 찾게 만들지 않는다.
      handlePaste: (_view, event) => {
        const data = event.clipboardData;
        const files = Array.from(data?.files ?? []);
        const images = files.filter((f) => f.type.startsWith("image/"));
        if (images.length > 0) {
          event.preventDefault();
          images.forEach(insert);
          return true;
        }

        /*
           마크다운 문서를 붙여넣은 경우.

           편집기의 마크다운 규칙은 글쇠를 누를 때만 돌아서, 문서를 통째로
           옮겨오면 '# ' 이 제목이 되지 않고 글자 그대로 남았다.

           웹 페이지에서 복사한 것은 건드리지 않는다. 그쪽은 이미 짜임새 있는
           HTML 이 함께 오고, 편집기가 그것을 더 정확히 읽는다. 손댈 것은
           마크다운 파일이나 편집기에서 온, 글자밖에 없는 붙여넣기다.
        */
        const html = data?.getData("text/html") ?? "";
        const text = data?.getData("text/plain") ?? "";
        const htmlHasStructure = /<(h[1-6]|ul|ol|blockquote|pre|table)\b/i.test(
          html,
        );
        if (htmlHasStructure || !looksLikeMarkdown(text)) return false;

        event.preventDefault();
        markdownToHtml(text).then((parsed) => {
          editorRef.current?.chain().focus().insertContent(parsed).run();
        });
        return true;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(
          (event as DragEvent).dataTransfer?.files ?? [],
        );
        const images = files.filter((f) => f.type.startsWith("image/"));
        if (images.length === 0) return false;
        event.preventDefault();
        images.forEach(insert);
        return true;
      },
    },
  });

  const insert = useCallback(
    async (file: File) => {
      setUploading(true);
      setError("");
      const { url, error: err } = await uploadImage(file, userId);
      setUploading(false);
      if (!url) {
        setError(err ?? "사진을 올리지 못했습니다.");
        return;
      }
      editor?.chain().focus().setImage({ src: url }).run();
    },
    [editor, userId],
  );

  editorRef.current = editor;

  if (!editor) return <S.EditorShell aria-busy="true" />;

  const on = (name: string, attrs?: Record<string, unknown>) =>
    editor.isActive(name, attrs);

  return (
    <S.EditorShell>
      <S.Toolbar>
        <S.ToolGroup>
          <S.Tool
            type="button"
            $on={on("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            title="제목"
          >
            제목
          </S.Tool>
          <S.Tool
            type="button"
            $on={on("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="굵게"
          >
            <b>B</b>
          </S.Tool>
          <S.Tool
            type="button"
            $on={on("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="기울임"
          >
            <i>I</i>
          </S.Tool>
          <S.Tool
            type="button"
            $on={on("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="목록"
          >
            목록
          </S.Tool>
          <S.Tool
            type="button"
            $on={on("taskList")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            title="체크리스트"
          >
            체크
          </S.Tool>
          <S.Tool
            type="button"
            $on={on("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="인용"
          >
            인용
          </S.Tool>
          <S.Tool
            type="button"
            $on={on("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="코드"
          >
            코드
          </S.Tool>
        </S.ToolGroup>

        <S.ToolGroup>
          <S.Tool
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            title="사진"
          >
            {uploading ? "올리는 중" : "사진"}
          </S.Tool>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              Array.from(e.target.files ?? []).forEach(insert);
              e.target.value = "";
            }}
          />
        </S.ToolGroup>
      </S.Toolbar>

      {/* 글을 끌어 선택했을 때만 뜬다. 손이 이미 그 자리에 있으니 가장 가깝다. */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 120 }}>
        <S.Bubble>
          <S.Tool
            type="button"
            $on={on("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <b>B</b>
          </S.Tool>
          <S.Tool
            type="button"
            $on={on("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <i>I</i>
          </S.Tool>
          <S.Tool
            type="button"
            $on={on("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <s>S</s>
          </S.Tool>
          <S.Tool
            type="button"
            $on={on("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            {"</>"}
          </S.Tool>
          <S.Tool
            type="button"
            $on={on("link")}
            onClick={() => {
              const prev = editor.getAttributes("link").href ?? "";
              const url = window.prompt("링크 주소", prev);
              if (url === null) return;
              if (url === "") {
                editor.chain().focus().unsetLink().run();
                return;
              }
              editor.chain().focus().setLink({ href: url }).run();
            }}
          >
            링크
          </S.Tool>
        </S.Bubble>
      </BubbleMenu>

      <S.EditorBody onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </S.EditorBody>

      {error && <S.EditorError>{error}</S.EditorError>}

      <S.EditorHint>
        {SHORTCUTS.map((s) => (
          <span key={s.label}>
            <code>{s.hint}</code> {s.label}
          </span>
        ))}
        <span>사진은 끌어다 놓거나 붙여넣으면 올라갑니다</span>
      </S.EditorHint>
    </S.EditorShell>
  );
}
