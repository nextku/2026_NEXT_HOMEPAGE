import {
  BubbleMenu,
  EditorContent,
  ReactRenderer,
  useEditor,
} from "@tiptap/react";
import type { Editor, JSONContent } from "@tiptap/react";
import tippy, { type Instance } from "tippy.js";
import React, { useCallback, useRef, useState } from "react";

import {
  editorExtensions,
  looksLikeMarkdown,
  markdownToHtml,
  uploadImage,
} from "lib/editor";
import * as S from "styles/community/style";

import {
  IconBold,
  IconBulletList,
  IconCode,
  IconCodeBlock,
  IconDivider,
  IconH1,
  IconH2,
  IconH3,
  IconImage,
  IconItalic,
  IconLink,
  IconOrderedList,
  IconQuote,
  IconStrike,
  IconTaskList,
} from "./icons";
import {
  SlashCommand,
  filterSlashItems,
  slashItems,
  type SlashItem,
} from "./SlashCommand";
import SlashMenu, { type SlashMenuHandle } from "./SlashMenu";

/**
 * 글 편집기.
 *
 * 원문과 미리보기를 나란히 두지 않는다. '# ' 를 치면 그 자리에서 제목이 되고,
 * 화면에 보이는 것이 곧 결과물이다. 나눠 보여주면 쓰는 사람이 두 곳을 번갈아
 * 봐야 하고, 마크다운을 모르는 사람은 왼쪽이 무슨 말인지 알 수 없다.
 *
 * 그래서 넣는 길을 네 갈래로 둔다. 마크다운을 아는 사람은 그대로 치고, 모르는
 * 사람은 위의 도구를 누르거나 '/' 를 쳐서 목록에서 고른다. 글을 끌어 선택하면
 * 그 자리에 막대가 뜬다. 사진은 끌어다 놓거나 붙여넣어도 된다.
 */

type Props = {
  value: JSONContent | null;
  onChange: (doc: JSONContent) => void;
  userId: string;
  placeholder?: string;
};

export default function PostEditor({
  value,
  onChange,
  userId,
  placeholder,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  /** 여러 장을 올릴 때 몇 번째인지. 0 이면 올리는 중이 아니다. */
  const [queue, setQueue] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  /*
   * 붙여넣기 처리기와 '/' 목록은 useEditor 설정 안에 있어서 editor 를 아직 볼
   * 수 없다. 만들어진 뒤 이 상자에 넣어두고 그때 꺼내 쓴다.
   */
  const editorRef = useRef<Editor | null>(null);
  const pickFile = useCallback(() => fileRef.current?.click(), []);

  const editor = useEditor({
    extensions: [
      ...editorExtensions(placeholder),
      SlashCommand.configure({
        suggestion: {
          items: ({ query }) =>
            filterSlashItems(slashItems(pickFile), query).slice(0, 10),
          render: makeSlashRenderer,
        },
      }),
    ],
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
          void insertMany(images);
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
        void insertMany(images);
        return true;
      },
    },
  });

  /**
   * 여러 장을 차례로 올린다.
   *
   * 한꺼번에 보내면 어느 것이 끝났는지 셀 수 없어 진행 표시가 맞지 않고,
   * 순서도 도착하는 대로 섞인다. 하나씩 올려 고른 순서대로 넣는다.
   */
  const insertMany = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setError("");
      setQueue({ done: 0, total: files.length });

      const failed: string[] = [];
      for (let i = 0; i < files.length; i += 1) {
        const { url, error: err } = await uploadImage(files[i], userId);
        if (url) {
          editorRef.current?.chain().focus().setImage({ src: url }).run();
        } else {
          failed.push(err ?? files[i].name);
        }
        setQueue({ done: i + 1, total: files.length });
      }

      setQueue({ done: 0, total: 0 });
      if (failed.length > 0) {
        setError(
          failed.length === files.length
            ? `사진을 올리지 못했습니다. ${failed[0]}`
            : `${failed.length}장을 올리지 못했습니다. ${failed[0]}`,
        );
      }
    },
    [userId],
  );

  editorRef.current = editor;

  if (!editor) return <S.EditorShell aria-busy="true" />;

  const on = (name: string, attrs?: Record<string, unknown>) =>
    editor.isActive(name, attrs);
  const uploading = queue.total > 0;

  const tool = (
    label: string,
    active: boolean,
    run: () => void,
    icon: React.ReactNode,
  ) => (
    <S.Tool
      type="button"
      $on={active}
      onClick={run}
      title={label}
      aria-label={label}
      aria-pressed={active}
    >
      {icon}
    </S.Tool>
  );

  const editLink = () => {
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("링크 주소", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <S.EditorShell>
      <S.Toolbar>
        <S.ToolGroup>
          {tool("큰 제목", on("heading", { level: 1 }), () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run(),
            <IconH1 />,
          )}
          {tool("중간 제목", on("heading", { level: 2 }), () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
            <IconH2 />,
          )}
          {tool("작은 제목", on("heading", { level: 3 }), () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run(),
            <IconH3 />,
          )}

          <S.ToolDivider />

          {tool("굵게", on("bold"), () =>
            editor.chain().focus().toggleBold().run(),
            <IconBold />,
          )}
          {tool("기울임", on("italic"), () =>
            editor.chain().focus().toggleItalic().run(),
            <IconItalic />,
          )}
          {tool("취소선", on("strike"), () =>
            editor.chain().focus().toggleStrike().run(),
            <IconStrike />,
          )}
          {tool("인라인 코드", on("code"), () =>
            editor.chain().focus().toggleCode().run(),
            <IconCode />,
          )}
          {tool("링크", on("link"), editLink, <IconLink />)}

          <S.ToolDivider />

          {tool("글머리 목록", on("bulletList"), () =>
            editor.chain().focus().toggleBulletList().run(),
            <IconBulletList />,
          )}
          {tool("번호 목록", on("orderedList"), () =>
            editor.chain().focus().toggleOrderedList().run(),
            <IconOrderedList />,
          )}
          {tool("체크 목록", on("taskList"), () =>
            editor.chain().focus().toggleTaskList().run(),
            <IconTaskList />,
          )}

          <S.ToolDivider />

          {tool("인용", on("blockquote"), () =>
            editor.chain().focus().toggleBlockquote().run(),
            <IconQuote />,
          )}
          {tool("코드 블록", on("codeBlock"), () =>
            editor.chain().focus().toggleCodeBlock().run(),
            <IconCodeBlock />,
          )}
          {tool("구분선", false, () =>
            editor.chain().focus().setHorizontalRule().run(),
            <IconDivider />,
          )}
        </S.ToolGroup>

        <S.ToolGroup>
          {/* 다른 도구와 달리 테두리를 둔다. 낱말 하나로는 누를 수 있는
              것인지 알아보지 못했다. */}
          <S.ToolImage
            type="button"
            onClick={pickFile}
            disabled={uploading}
            title="사진 넣기"
          >
            <IconImage />
            {uploading
              ? `${queue.done}/${queue.total} 올리는 중`
              : "사진"}
          </S.ToolImage>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              void insertMany(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </S.ToolGroup>
      </S.Toolbar>

      {/* 글을 끌어 선택했을 때만 뜬다. 손이 이미 그 자리에 있으니 가장 가깝다. */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 120 }}>
        <S.Bubble>
          {tool("굵게", on("bold"), () =>
            editor.chain().focus().toggleBold().run(),
            <IconBold />,
          )}
          {tool("기울임", on("italic"), () =>
            editor.chain().focus().toggleItalic().run(),
            <IconItalic />,
          )}
          {tool("취소선", on("strike"), () =>
            editor.chain().focus().toggleStrike().run(),
            <IconStrike />,
          )}
          {tool("인라인 코드", on("code"), () =>
            editor.chain().focus().toggleCode().run(),
            <IconCode />,
          )}
          {tool("링크", on("link"), editLink, <IconLink />)}
        </S.Bubble>
      </BubbleMenu>

      <S.EditorBody onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </S.EditorBody>

      {error && <S.EditorError>{error}</S.EditorError>}

      <S.EditorHint>
        <span>
          <code>/</code> 를 치면 넣을 수 있는 것이 뜹니다
        </span>
        <span>
          <code>#</code> 제목
        </span>
        <span>
          <code>-</code> 목록
        </span>
        <span>
          <code>&gt;</code> 인용
        </span>
        <span>사진은 끌어다 놓거나 붙여넣어도 올라갑니다</span>
      </S.EditorHint>
    </S.EditorShell>
  );
}

/* ─── '/' 목록을 띄우는 자리 ──────────────────────────────────────────── */

/**
 * 목록을 글자 옆에 붙여 띄운다.
 *
 * 편집기 안에 그리면 글 흐름을 밀어내므로 tippy 로 띄운다. 이미 말풍선 막대가
 * 쓰고 있는 것이라 따로 받아오는 것이 없다.
 */
function makeSlashRenderer() {
  let component: ReactRenderer<SlashMenuHandle> | null = null;
  let popup: Instance | null = null;

  return {
    onStart: (props: {
      editor: Editor;
      items: SlashItem[];
      command: (item: SlashItem) => void;
      clientRect?: (() => DOMRect | null) | null;
    }) => {
      component = new ReactRenderer(SlashMenu, {
        props,
        editor: props.editor,
      });
      if (!props.clientRect) return;

      popup = tippy(document.body, {
        getReferenceClientRect: props.clientRect as () => DOMRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },

    onUpdate: (props: {
      items: SlashItem[];
      clientRect?: (() => DOMRect | null) | null;
    }) => {
      component?.updateProps(props);
      if (props.clientRect && popup) {
        popup.setProps({
          getReferenceClientRect: props.clientRect as () => DOMRect,
        });
      }
    },

    onKeyDown: (props: { event: KeyboardEvent }) => {
      // 목록이 떠 있을 때 Esc 는 글이 아니라 목록을 닫는다.
      if (props.event.key === "Escape") {
        popup?.hide();
        return true;
      }
      return component?.ref?.onKeyDown(props) ?? false;
    },

    onExit: () => {
      popup?.destroy();
      component?.destroy();
      popup = null;
      component = null;
    },
  };
}
