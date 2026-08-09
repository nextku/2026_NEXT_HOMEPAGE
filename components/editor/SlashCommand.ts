import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";

/**
 * '/' 를 치면 넣을 수 있는 것이 뜬다.
 *
 * 도구 막대만 두면 거기 없는 것은 없는 줄 안다. 실제로 사진을 올릴 수 있다는
 * 것을 못 알아본 사람이 있었다. 글을 쓰다가 '/' 를 치면 그 자리에서 목록이
 * 열리므로, 손이 글에서 떠나지 않고 무엇이 가능한지도 한 번에 보인다.
 *
 * 줄 맨 앞에서만 연다. 문장 중간의 '3/4' 나 'https://' 까지 잡으면 글을 쓰다가
 * 난데없이 목록이 뜬다.
 */

export type SlashItem = {
  title: string;
  hint: string;
  /** 제목에 없는 말로도 찾을 수 있게 한다. '이미지' 로 쳐도 '사진' 이 나온다. */
  keywords: string[];
  run: (ctx: { editor: Editor; range: Range }) => void;
};

/** onImage: 사진 항목을 고르면 파일 선택창을 여는 일. 화면 쪽이 쥐고 있다. */
export function slashItems(onImage: () => void): SlashItem[] {
  return [
    {
      title: "큰 제목",
      hint: "# ",
      keywords: ["제목", "h1", "heading", "title"],
      run: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run(),
    },
    {
      title: "중간 제목",
      hint: "## ",
      keywords: ["제목", "h2", "heading"],
      run: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run(),
    },
    {
      title: "작은 제목",
      hint: "### ",
      keywords: ["제목", "h3", "heading"],
      run: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 3 })
          .run(),
    },
    {
      title: "사진",
      hint: "끌어다 놓거나 붙여넣어도 됩니다",
      keywords: ["사진", "이미지", "그림", "image", "photo", "picture"],
      run: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        onImage();
      },
    },
    {
      title: "글머리 목록",
      hint: "- ",
      keywords: ["목록", "리스트", "bullet", "list"],
      run: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: "번호 목록",
      hint: "1. ",
      keywords: ["번호", "순서", "ordered", "number"],
      run: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      title: "체크 목록",
      hint: "[] ",
      keywords: ["체크", "할일", "todo", "task"],
      run: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleTaskList().run(),
    },
    {
      title: "인용",
      hint: "> ",
      keywords: ["인용", "quote"],
      run: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      title: "코드 블록",
      hint: "```",
      keywords: ["코드", "code"],
      run: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      title: "구분선",
      hint: "---",
      keywords: ["구분", "선", "divider", "hr"],
      run: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
  ];
}

/** 제목과 별명 양쪽으로 찾는다. */
export function filterSlashItems(items: SlashItem[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (i) =>
      i.title.toLowerCase().includes(q) ||
      i.keywords.some((k) => k.toLowerCase().includes(q)),
  );
}

export const slashPluginKey = new PluginKey("slashCommand");

export const SlashCommand = Extension.create<{
  suggestion: Omit<SuggestionOptions<SlashItem>, "editor">;
}>({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        // 줄 맨 앞에서만. 'https://' 가 목록을 열면 안 된다.
        startOfLine: true,
        pluginKey: slashPluginKey,
        command: ({ editor, range, props }) => props.run({ editor, range }),
      } as Omit<SuggestionOptions<SlashItem>, "editor">,
    };
  },

  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
  },
});
