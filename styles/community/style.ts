import styled, { css } from "styled-components";
import { squircle, lift, liftHover } from "styles/surface";

/**
 * 게시판.
 *
 * 사이트의 다른 화면과 같은 문법을 쓴다 — 크림 바탕, 왼쪽 정렬, 검정 제목,
 * 오렌지는 누를 수 있는 것에만. 다만 여기는 읽는 시간이 긴 화면이라 본문
 * 타이포그래피에 더 많은 자리를 준다.
 */

const INK = "#17150f";
const BODY = "#57524a";
const MUTE = "#8d877f";
const FAINT = "#a9a196";
const LINE = "#e7e2d8";
const FILL = "#fdfcfa";
const TINT = "#f1ece2";
const ORANGE = "#f7941e";

/* ─── 뼈대 ────────────────────────────────────────────────────────────── */

export const Wrap = styled.div`
  width: 100%;
  max-width: 92rem;
  margin: 0 auto;
  padding-inline: max(clamp(2rem, 5vw, 6rem), env(safe-area-inset-left));
`;

/** 본문을 읽는 화면은 더 좁게. 한 줄이 길면 다음 줄을 찾다가 지친다. */
export const Reading = styled(Wrap)`
  max-width: 74rem;
`;

export const Head = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.6rem;
  flex-wrap: wrap;
  margin-bottom: clamp(2rem, 3vw, 2.8rem);

  & h1 {
    margin: 0;
    font-size: clamp(2.2rem, 3vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.25;
  }
  & p {
    margin: 0.6rem 0 0;
    font-size: 1.5rem;
    line-height: 1.7;
    letter-spacing: -0.025em;
    color: ${MUTE};
    word-break: keep-all;
  }
`;

/* ─── 게시판 목록 ─────────────────────────────────────────────────────── */

/**
 * 게시판 이동.
 *
 * 판이 일곱 개다. 드롭다운에 넣으면 어떤 판이 있는지 열어봐야 알고, 세로로
 * 세우면 화면 절반을 먹는다. 가로로 늘어놓고 넘치면 옆으로 민다.
 */
export const BoardNav = styled.nav`
  display: flex;
  gap: 0.6rem;
  margin-bottom: clamp(2rem, 3vw, 2.8rem);
  padding-bottom: 0.4rem;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const BoardTab = styled.button<{ $on: boolean }>`
  flex: 0 0 auto;
  min-height: 3.8rem;
  padding: 0 1.5rem;
  border-radius: 999px;
  font-size: 1.45rem;
  font-weight: 650;
  letter-spacing: -0.025em;
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;

  ${({ $on }) =>
    $on
      ? css`
          background: ${INK};
          border: 1px solid ${INK};
          color: #fbf8f3;
        `
      : css`
          background: transparent;
          border: 1px solid ${LINE};
          color: ${BODY};
        `}

  @media (any-hover: hover) {
    &:hover {
      border-color: ${({ $on }) => ($on ? INK : "#a9a196")};
    }
  }
`;

/* ─── 글 목록 ─────────────────────────────────────────────────────────── */

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid ${LINE};
`;

/**
 * 글 한 줄.
 *
 * 카드로 띄우지 않는다. 게시판은 훑는 화면이라 줄 사이가 벌어지면 한 화면에
 * 담기는 글이 줄고, 그림자가 스무 개 겹치면 그 자체로 시끄럽다. 구분선 하나면
 * 충분하다.
 */
export const Item = styled.li`
  border-bottom: 1px solid ${LINE};
  transition: background 0.14s ease;

  @media (any-hover: hover) {
    &:hover {
      background: ${FILL};
    }
  }
`;

export const ItemLink = styled.a`
  display: grid;
  gap: 1.4rem;
  padding: clamp(1.8rem, 2.4vw, 2.2rem) clamp(0.6rem, 1.4vw, 1.2rem);
  color: inherit;
  cursor: pointer;

  @media (min-width: 40rem) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
`;

export const ItemMain = styled.div`
  min-width: 0;
`;

export const ItemTop = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.8rem;
  margin-bottom: 0.6rem;
`;

export const Pin = styled.span`
  display: inline-flex;
  align-items: center;
  height: 2.1rem;
  padding: 0 0.7rem;
  border-radius: 4px;
  background: rgba(247, 148, 30, 0.16);
  color: #95500a;
  font-size: 1.2rem;
  font-weight: 750;
  letter-spacing: -0.02em;
`;

export const BoardChip = styled.span`
  font-size: 1.25rem;
  font-weight: 650;
  letter-spacing: -0.02em;
  color: #95500a;
`;

export const ItemTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.7rem, 1.9vw, 1.9rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.4;
  color: ${INK};
  word-break: keep-all;

  /* 두 줄까지만. 제목이 길다고 목록이 흐트러지면 안 된다. */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const ItemExcerpt = styled.p`
  margin: 0.5rem 0 0;
  font-size: 1.45rem;
  line-height: 1.65;
  letter-spacing: -0.025em;
  color: ${MUTE};
  word-break: keep-all;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin-top: 0.9rem;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
  color: ${FAINT};
  font-variant-numeric: tabular-nums;

  & b {
    font-weight: 650;
    color: ${BODY};
  }
`;

/** 목록 오른쪽 썸네일. 사진이 있는 글만. */
export const Thumb = styled.div`
  display: none;

  @media (min-width: 40rem) {
    display: block;
    width: 11rem;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: ${TINT};
    ${squircle(10)}

    & img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }
`;

/* ─── 글 읽기 ─────────────────────────────────────────────────────────── */

export const PostHead = styled.header`
  padding-bottom: clamp(2rem, 3vw, 2.6rem);
  border-bottom: 1px solid ${LINE};
  margin-bottom: clamp(2.4rem, 3.5vw, 3.2rem);

  & h1 {
    margin: 0.8rem 0 0;
    font-size: clamp(2.4rem, 3.6vw, 3.4rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.3;
    word-break: keep-all;
    text-wrap: balance;
  }
`;

export const Byline = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: 1.4rem;
  font-size: 1.4rem;
  letter-spacing: -0.02em;
  color: ${MUTE};
  font-variant-numeric: tabular-nums;

  & b {
    font-weight: 700;
    color: ${INK};
  }
`;

/**
 * 본문.
 *
 * 읽는 데 쓰는 시간이 가장 긴 곳이라 여기만 규칙을 따로 둔다. 글줄은
 * 68자 근처, 줄 간격은 1.85 — 한글은 글자가 빽빽해서 라틴 문자 기준보다
 * 조금 더 벌려야 눈이 편하다.
 */
/**
 * 문서 본문 규칙.
 *
 * 쓰는 화면과 읽는 화면이 같은 값을 써야 한다. 다르면 화면에서 본 대로 나오지
 * 않고, 그 순간 이 편집기를 쓸 이유가 사라진다.
 *
 * 읽는 데 쓰는 시간이 가장 긴 곳이라 여기만 규칙을 따로 둔다. 글줄은 68자
 * 근처, 줄 간격은 1.85 — 한글은 글자가 빽빽해서 라틴 문자 기준보다 조금 더
 * 벌려야 눈이 편하다.
 */
export const docStyles = css`
  & .next-doc {
    font-size: 1.7rem;
    line-height: 1.85;
    letter-spacing: -0.025em;
    color: ${BODY};
    word-break: keep-all;
    overflow-wrap: anywhere;
  }

  & .next-doc > * + * {
    margin-top: 1.5em;
  }

  & .next-doc h1,
  & .next-doc h2,
  & .next-doc h3 {
    color: ${INK};
    font-weight: 750;
    letter-spacing: -0.035em;
    line-height: 1.4;
    /* 제목 앞은 넓게, 뒤는 좁게. 아래 문단과 한 덩어리로 읽혀야 한다. */
    margin-top: 2.2em;
    margin-bottom: -0.6em;
  }
  & .next-doc h1 {
    font-size: 1.55em;
  }
  & .next-doc h2 {
    font-size: 1.32em;
  }
  & .next-doc h3 {
    font-size: 1.12em;
  }

  & .next-doc strong {
    color: ${INK};
    font-weight: 700;
  }
  & .next-doc em {
    font-style: italic;
  }

  & .next-doc a {
    color: ${INK};
    font-weight: 600;
    box-shadow: inset 0 -1px 0 #cfc8bc;
  }
  @media (any-hover: hover) {
    & .next-doc a:hover {
      box-shadow: inset 0 -1px 0 ${ORANGE};
    }
  }

  & .next-doc ul,
  & .next-doc ol {
    padding-left: 1.4em;
  }
  & .next-doc li + li {
    margin-top: 0.5em;
  }
  & .next-doc li p {
    margin: 0;
  }

  & .next-doc ul[data-type="taskList"] {
    list-style: none;
    padding-left: 0;
  }
  & .next-doc ul[data-type="taskList"] li {
    display: flex;
    align-items: flex-start;
    gap: 0.7em;
  }
  & .next-doc ul[data-type="taskList"] input {
    margin-top: 0.45em;
    width: 1.6rem;
    height: 1.6rem;
    accent-color: ${ORANGE};
  }

  & .next-doc blockquote {
    margin-left: 0;
    padding-left: 1.4em;
    border-left: 2px solid ${LINE};
    color: ${MUTE};
  }

  & .next-doc code {
    padding: 0.15em 0.4em;
    border-radius: 4px;
    background: ${TINT};
    color: ${INK};
    font-size: 0.9em;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  & .next-doc pre {
    padding: 1.4rem 1.6rem;
    border-radius: 10px;
    background: #17150f;
    color: #f3efe7;
    overflow-x: auto;
    font-size: 1.4rem;
    line-height: 1.7;
  }
  & .next-doc pre code {
    padding: 0;
    background: none;
    color: inherit;
    font-size: inherit;
  }

  & .next-doc img {
    max-width: 100%;
    height: auto;
    display: block;
    ${squircle(12)}
  }

  & .next-doc hr {
    border: 0;
    border-top: 1px solid ${LINE};
  }
`;

export const Article = styled.div`
  ${docStyles}
`;

/* ─── 편집기 ──────────────────────────────────────────────────────────── */

export const EditorShell = styled.div`
  border: 1px solid ${LINE};
  border-radius: 14px;
  background: #ffffff;
  overflow: hidden;

  &:focus-within {
    border-color: #cfc8bc;
  }
`;

export const Toolbar = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid ${LINE};
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
`;

export const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

export const Tool = styled.button<{ $on?: boolean }>`
  min-width: 3.4rem;
  height: 3.4rem;
  padding: 0 0.9rem;
  border: 0;
  border-radius: 7px;
  background: ${({ $on }) => ($on ? TINT : "transparent")};
  color: ${({ $on }) => ($on ? INK : BODY)};
  font-size: 1.4rem;
  font-weight: 650;
  letter-spacing: -0.02em;
  cursor: pointer;
  transition:
    background 0.14s ease,
    color 0.14s ease;

  @media (any-hover: hover) {
    &:hover:not(:disabled) {
      background: ${TINT};
      color: ${INK};
    }
  }
  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

/** 선택한 글 위에 뜨는 막대. */
export const Bubble = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.3rem;
  border-radius: 10px;
  background: ${INK};
  box-shadow: 0 8px 24px rgba(23, 21, 15, 0.28);

  & button {
    color: rgba(251, 248, 243, 0.75);
    background: transparent;
  }
  & button[data-on="true"],
  & button:hover {
    background: rgba(255, 255, 255, 0.12) !important;
    color: #fff !important;
  }
`;

export const EditorBody = styled.div`
  ${docStyles}
  padding: clamp(1.8rem, 3vw, 2.8rem);
  min-height: 34rem;
  cursor: text;

  & .ProseMirror {
    outline: none;
  }

  /* 빈 문단에 안내를 띄운다. 빈 상자만 있으면 무엇을 해야 할지 알 수 없다. */
  & .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    color: ${FAINT};
  }
`;

export const EditorHint = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.4rem;
  padding: 0.9rem clamp(1.8rem, 3vw, 2.8rem) 1.2rem;
  border-top: 1px solid ${LINE};
  background: ${FILL};
  font-size: 1.25rem;
  letter-spacing: -0.02em;
  color: ${FAINT};

  & code {
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    background: ${TINT};
    color: ${BODY};
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
`;

export const EditorError = styled.p`
  margin: 0;
  padding: 0.9rem clamp(1.8rem, 3vw, 2.8rem);
  border-top: 1px solid ${LINE};
  font-size: 1.35rem;
  color: #9a2c1e;
`;

/* ─── 댓글 ────────────────────────────────────────────────────────────── */

export const Comments = styled.section`
  margin-top: clamp(3.2rem, 5vw, 4.8rem);

  & > h2 {
    margin: 0 0 1.6rem;
    font-size: 1.8rem;
    font-weight: 750;
    letter-spacing: -0.03em;
  }
`;

export const CommentList = styled.ul`
  list-style: none;
  margin: 0 0 2rem;
  padding: 0;
  display: grid;
  gap: 1.6rem;
`;

export const Comment = styled.li<{ $reply?: boolean }>`
  padding-left: ${({ $reply }) => ($reply ? "clamp(1.6rem, 4vw, 3.2rem)" : "0")};
  border-left: ${({ $reply }) => ($reply ? `1px solid ${LINE}` : "0")};
`;

export const CommentHead = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.4rem 0.8rem;
  font-size: 1.35rem;
  letter-spacing: -0.02em;
  color: ${FAINT};
  font-variant-numeric: tabular-nums;

  & b {
    font-size: 1.45rem;
    font-weight: 700;
    color: ${INK};
  }
`;

export const CommentBody = styled.p`
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  line-height: 1.75;
  letter-spacing: -0.025em;
  color: ${BODY};
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: anywhere;
`;

export const CommentActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.6rem;

  & button {
    padding: 0;
    border: 0;
    background: none;
    font-size: 1.3rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: ${FAINT};
    cursor: pointer;
  }
  @media (any-hover: hover) {
    & button:hover {
      color: ${INK};
    }
  }
`;

export const CommentForm = styled.form`
  display: grid;
  gap: 0.9rem;
  justify-items: end;
`;

export const CommentInput = styled.textarea`
  width: 100%;
  min-height: 9rem;
  padding: 1.2rem 1.4rem;
  border: 1px solid ${LINE};
  border-radius: 10px;
  background: ${FILL};
  color: ${INK};
  font-size: 1.5rem;
  line-height: 1.7;
  letter-spacing: -0.025em;
  resize: vertical;

  &::placeholder {
    color: ${FAINT};
  }
  &:focus {
    outline: none;
    border-color: ${INK};
  }
`;

/* ─── 공통 조각 ───────────────────────────────────────────────────────── */

export const Primary = styled.button`
  min-height: 4.6rem;
  padding: 0 1.8rem;
  border: 1px solid ${ORANGE};
  border-radius: 9px;
  background: ${ORANGE};
  color: ${INK};
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  cursor: pointer;
  transition:
    background 0.16s ease,
    border-color 0.16s ease;

  @media (any-hover: hover) {
    &:hover:not(:disabled) {
      background: #ffa63d;
      border-color: #ffa63d;
    }
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const Ghost = styled.button`
  min-height: 4.6rem;
  padding: 0 1.6rem;
  border: 1px solid ${LINE};
  border-radius: 9px;
  background: transparent;
  color: ${BODY};
  font-size: 1.45rem;
  font-weight: 650;
  letter-spacing: -0.025em;
  cursor: pointer;

  @media (any-hover: hover) {
    &:hover:not(:disabled) {
      border-color: #a9a196;
      color: ${INK};
    }
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

export const Spread = styled(Row)`
  justify-content: space-between;
`;

export const Empty = styled.div`
  padding: clamp(4rem, 8vw, 8rem) 0;
  text-align: center;
  font-size: 1.55rem;
  letter-spacing: -0.025em;
  color: ${MUTE};
`;

export const Back = styled.button`
  padding: 0;
  border: 0;
  background: none;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${MUTE};
  cursor: pointer;

  @media (any-hover: hover) {
    &:hover {
      color: ${INK};
    }
  }
`;

/** 좋아요. 누르면 채워진다 — 색만 바뀌면 눌렀는지 알기 어렵다. */
export const Like = styled.button<{ $on: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 4.2rem;
  padding: 0 1.4rem;
  border-radius: 999px;
  font-size: 1.4rem;
  font-weight: 650;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;

  ${({ $on }) =>
    $on
      ? css`
          background: rgba(247, 148, 30, 0.16);
          border: 1px solid rgba(247, 148, 30, 0.5);
          color: #95500a;
        `
      : css`
          background: transparent;
          border: 1px solid ${LINE};
          color: ${BODY};
        `}

  & svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

/* ─── 글쓰기 화면 ─────────────────────────────────────────────────────── */

export const TitleInput = styled.textarea`
  width: 100%;
  border: 0;
  background: none;
  resize: none;
  overflow: hidden;
  color: ${INK};
  font-size: clamp(2.2rem, 3.4vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.3;

  &::placeholder {
    color: #ddd7cd;
  }
  &:focus {
    outline: none;
  }
`;

export const Field = styled.label`
  display: grid;
  gap: 0.7rem;
  min-width: 0;

  & > span {
    font-size: 1.4rem;
    font-weight: 650;
    letter-spacing: -0.025em;
    color: ${INK};
  }
`;

export const Input = styled.input`
  width: 100%;
  min-height: 4.6rem;
  padding: 0 1.2rem;
  border: 1px solid ${LINE};
  border-radius: 9px;
  background: ${FILL};
  color: ${INK};
  font-size: 1.5rem;
  letter-spacing: -0.025em;

  &::placeholder {
    color: ${FAINT};
  }
  &:focus {
    outline: none;
    border-color: ${INK};
  }
`;

export const Select = styled.select`
  width: 100%;
  min-height: 4.6rem;
  padding: 0 3rem 0 1.2rem;
  border: 1px solid ${LINE};
  border-radius: 9px;
  background: ${FILL};
  color: ${INK};
  font-size: 1.5rem;
  letter-spacing: -0.025em;
  cursor: pointer;
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, ${MUTE} 50%),
    linear-gradient(135deg, ${MUTE} 50%, transparent 50%);
  background-position:
    calc(100% - 1.5rem) calc(50% + 1px),
    calc(100% - 1.05rem) calc(50% + 1px);
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;

  &:focus {
    outline: none;
    border-color: ${INK};
  }
`;

export const WriteMeta = styled.div`
  display: grid;
  gap: 1.2rem;
  margin: 1.6rem 0 2rem;

  @media (min-width: 44rem) {
    grid-template-columns: 18rem minmax(0, 1fr) 16rem;
    align-items: end;
  }
`;

/** 저장 상태. 조용히 있다가 바뀔 때만 말한다. */
export const SaveState = styled.span`
  font-size: 1.35rem;
  letter-spacing: -0.02em;
  color: ${FAINT};
`;

export const Card = styled.div`
  padding: clamp(2rem, 3vw, 2.8rem);
  background: #ffffff;
  ${squircle(16)}
  ${lift}
  transition: box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1);

  @media (any-hover: hover) {
    &:hover {
      ${liftHover}
    }
  }
`;
