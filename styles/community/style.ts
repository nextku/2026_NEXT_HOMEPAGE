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

/* ─── 게시판 이동과 계정 ──────────────────────────────────────────────── */

/**
 * 두 칸.
 *
 * 판이 일곱 개다. 알약 버튼을 가로로 늘어놓았더니 제목 바로 아래에 색색의 줄이
 * 하나 더 생겨서, 읽으러 온 사람이 글보다 버튼을 먼저 봤다. 판 목록은 자주
 * 바뀌지 않는 이동 수단이므로 옆으로 뺀다. 본문은 글만 남는다.
 */
export const Shell = styled.div`
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr);
  gap: clamp(2.4rem, 5vw, 5.6rem);
  align-items: start;

  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    /*
       위의 align-items: start 를 여기서 풀어야 한다. 세로로 쌓을 때 그대로
       두면 칸이 내용 폭까지 늘어나, 가로 스크롤러가 판 일곱 개만큼 넓어진다.
    */
    align-items: stretch;
    gap: 2rem;
  }
`;

export const Side = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 2.8rem;
  /*
     flex 자식의 기본 최소 폭은 내용 전체다. 이것을 풀지 않으면 아래 가로
     스크롤러가 줄어들지 못하고, 판 일곱 개를 한 줄에 늘어놓은 만큼 폭이
     커져 화면 전체가 옆으로 밀린다.
  */
  min-width: 0;
  /* 글이 길어도 판 목록은 따라온다. */
  position: sticky;
  top: 11rem;

  @media (max-width: 900px) {
    position: static;
    gap: 1.6rem;
  }
`;

/**
 * 판 목록.
 *
 * 좁은 화면에서는 세로로 세울 자리가 없다. 같은 요소를 가로로 눕히고 넘치면
 * 옆으로 민다 — DOM 을 둘로 만들면 하나만 고치는 실수가 나온다.
 */
export const SideNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;

  @media (max-width: 900px) {
    flex-direction: row;
    gap: 0.4rem;
    overflow-x: auto;
    scrollbar-width: none;
    margin-inline: calc(clamp(2rem, 5vw, 6rem) * -1);
    padding-inline: clamp(2rem, 5vw, 6rem);

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

/**
 * 판 하나.
 *
 * 테두리를 두르지 않는다. 일곱 개에 전부 선을 그으면 목록이 아니라 격자가
 * 된다. 지금 보고 있는 판만 바탕을 깔아 구별한다.
 */
export const SideLink = styled.button<{ $on: boolean }>`
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  text-align: left;
  white-space: nowrap;
  min-height: 3.4rem;
  padding: 0 1.2rem;
  ${squircle(9)};
  font-size: 1.45rem;
  letter-spacing: -0.025em;
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease;

  ${({ $on }) =>
    $on
      ? css`
          background: ${TINT};
          color: ${INK};
          font-weight: 700;
        `
      : css`
          color: ${BODY};
          font-weight: 550;
        `}

  @media (any-hover: hover) {
    &:hover {
      background: ${({ $on }) => ($on ? TINT : "rgba(23, 21, 15, 0.04)")};
      color: ${INK};
    }
  }
`;

/**
 * 운영진 화면으로.
 *
 * 처음에는 판 목록 아래에 굵은 글씨로만 세웠다. 대기 인원이 0 이면 아무 표시도
 * 없어서 그냥 글자 하나였고, 승인하러 갈 자리를 찾지 못했다. 색을 아끼려다
 * 정작 필요한 사람에게 안 보이면 아낀 것이 아니다.
 *
 * 글쓰기 옆에 버튼으로 세운다. 글쓰기와 같은 크기지만 검정으로 채워 구별한다 -
 * 오렌지 둘을 나란히 두면 어느 쪽이 주된 행동인지 흐려지고, 테두리만 있는
 * 버튼은 다시 눈에 안 들어온다.
 */
export const AdminButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  white-space: nowrap;
  min-height: 4.6rem;
  padding: 0 1.6rem;
  border: 1px solid ${INK};
  border-radius: 9px;
  background: ${INK};
  color: #fbf8f3;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  cursor: pointer;
  transition:
    background 0.16s ease,
    border-color 0.16s ease;

  @media (any-hover: hover) {
    &:hover {
      background: #2e2a20;
      border-color: #2e2a20;
    }
  }
`;

/**
 * 대기 인원.
 *
 * 장식이 아니라 수다. 0 이면 그리지 않는다 - 늘 떠 있으면 눈이 익어서 정작
 * 사람이 기다릴 때 알아채지 못한다.
 */
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.6rem;
  border-radius: 999px;
  background: ${ORANGE};
  color: ${INK};
  font-size: 1.2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
`;

/**
 * 나.
 *
 * 글쓰기와 한 줄에 섞여 있었다. 글쓰기는 지금 보고 있는 판에 하는 일이고
 * 내 정보·로그아웃은 계정에 하는 일이라, 같은 줄에 두면 무엇이 무엇에 걸린
 * 버튼인지 읽히지 않는다. 계정은 계정끼리 묶어 판 목록 아래로 내린다.
 */
export const Me = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-top: 1.6rem;
  border-top: 1px solid ${LINE};

  @media (max-width: 900px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.2rem;
    padding-top: 0;
    border-top: 0;
  }
`;

export const MeName = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0 1.2rem;

  & strong {
    font-size: 1.5rem;
    font-weight: 750;
    letter-spacing: -0.03em;
    color: ${INK};
  }
  & span {
    font-size: 1.3rem;
    letter-spacing: -0.02em;
    color: ${FAINT};
  }

  @media (max-width: 900px) {
    padding: 0;
    /* 이름이 길어도 옆의 항목을 밀어내지 않게 한다. */
    min-width: 0;
    flex: 1 1 auto;
  }
`;

export const MeLinks = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;

  @media (max-width: 900px) {
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    /* 좁은 화면에서 세 항목이 한 줄에 안 들어가면 다음 줄로 내린다.
       넘친 채로 두면 로그아웃이 화면 밖으로 나간다. */
    flex-wrap: wrap;
    gap: 0.2rem;
  }
`;

/** 계정 쪽 항목. 판 목록과 같은 자리에 서지만 강조는 한 단계 낮춘다. */
export const MeLink = styled.button`
  border: 0;
  background: transparent;
  text-align: left;
  white-space: nowrap;
  min-height: 3.2rem;
  padding: 0 1.2rem;
  ${squircle(9)};
  font-size: 1.4rem;
  font-weight: 550;
  letter-spacing: -0.025em;
  color: ${MUTE};
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease;

  @media (any-hover: hover) {
    &:hover {
      background: rgba(23, 21, 15, 0.04);
      color: ${INK};
    }
  }

  @media (max-width: 900px) {
    padding: 0 0.8rem;
  }
`;

/* ─── 글 목록 ─────────────────────────────────────────────────────────── */

/**
 * 목록을 감싼다.
 *
 * 새 목록을 기다리는 동안 있던 글을 지우지 않고 흐리게만 둔다. 비우면 화면이
 * 한 번 깜빡이고, 아무 표시도 없으면 눌렀는데 반응이 없는 것처럼 보인다.
 */
export const Feed = styled.div<{ $busy: boolean }>`
  opacity: ${({ $busy }) => ($busy ? 0.45 : 1)};
  transition: opacity 0.18s ease;
`;

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
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

  /* 아이콘은 글자 크기를 따라간다. 낱말 버튼과 나란히 서도 키가 맞는다. */
  & svg {
    width: 1.8rem;
    height: 1.8rem;
    display: block;
  }

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

/**
 * 사진 넣기.
 *
 * 도구 막대에서 "사진" 이라는 낱말 하나로 서 있었더니 그것이 누를 수 있는
 * 것인지, 사진을 올릴 수 있기는 한 것인지 알아보지 못했다. 다른 도구와 달리
 * 테두리를 두르고 아이콘과 낱말을 함께 세워 버튼으로 읽히게 한다.
 */
export const ToolImage = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  height: 3.4rem;
  padding: 0 1.2rem;
  border: 1px solid ${LINE};
  border-radius: 8px;
  background: ${FILL};
  color: ${INK};
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.14s ease,
    border-color 0.14s ease;

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    display: block;
  }

  @media (any-hover: hover) {
    &:hover:not(:disabled) {
      background: ${TINT};
      border-color: #cfc7b8;
    }
  }
  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`;

/** 도구 사이를 가르는 실선. 무리마다 하나씩만. */
export const ToolDivider = styled.span`
  width: 1px;
  height: 1.8rem;
  background: ${LINE};
  flex: 0 0 auto;
`;

/* ─── '/' 목록 ────────────────────────────────────────────────────────── */

export const SlashCard = styled.div`
  width: 24rem;
  max-height: 28rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.5rem;
  border: 1px solid ${LINE};
  ${squircle(12)};
  background: #ffffff;
  ${lift};
`;

export const SlashRow = styled.button<{ $on: boolean }>`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  border: 0;
  background: ${({ $on }) => ($on ? TINT : "transparent")};
  text-align: left;
  padding: 0.8rem 1rem;
  ${squircle(8)};
  cursor: pointer;

  & span {
    font-size: 1.45rem;
    font-weight: 650;
    letter-spacing: -0.025em;
    color: ${INK};
  }
  & small {
    font-size: 1.2rem;
    letter-spacing: -0.02em;
    color: ${FAINT};
    white-space: nowrap;
  }
`;

export const SlashEmpty = styled.div`
  padding: 1.2rem 1rem;
  font-size: 1.4rem;
  letter-spacing: -0.025em;
  color: ${MUTE};
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
