import styled, { css, keyframes } from "styled-components";
import { squircle, lift, liftHover } from "styles/surface";

/**
 * 학회원 영역 (로그인 · 라운지 · 운영진)
 *
 * 다른 페이지와 같은 문법을 쓴다 — 왼쪽 정렬, 검정 제목, 위계는 크기와 굵기로.
 * 오렌지는 누를 수 있는 것에만 쓰고, 밝은 바탕의 글자에는 #95500A 를 쓴다.
 * (#F7941E 를 흰 바탕 텍스트로 쓰면 대비 2.28:1 로 WCAG 미달이다.)
 */

export const Page = styled.main`
  width: 100%;
  min-height: 100dvh;
  background: #fbf8f3;
  color: #17150f;
  padding-top: max(11rem, calc(9rem + env(safe-area-inset-top)));
  padding-bottom: clamp(6rem, 10vw, 12rem);
`;

/**
 * 카드 하나로 끝나는 화면(로그인 · 신청서 · 승인 대기)용.
 *
 * 내용이 짧은데 위에 붙여두면 아래가 텅 비어 위로 쏠려 보인다. 세로 가운데로
 * 두되, 헤더가 위쪽 100px 가량을 가리므로 아래 여백을 덜어 시각적 중심을
 * 화면 중앙에 맞춘다. 내용이 길어지면 가운데 정렬은 저절로 풀린다.
 */
export const PageCenter = styled(Page)`
  display: grid;
  align-content: center;
  padding-bottom: clamp(4rem, 6vw, 7rem);
`;

export const Wrap = styled.div`
  width: 100%;
  max-width: 108rem;
  margin: 0 auto;
  padding-inline: max(clamp(2rem, 5vw, 6rem), env(safe-area-inset-left));
`;

export const Narrow = styled(Wrap)`
  max-width: 52rem;
`;

export const Intro = styled.div`
  margin-bottom: clamp(3.2rem, 5vw, 5.6rem);

  & h1 {
    margin: 0 0 1.2rem;
    font-size: clamp(2.4rem, 3.4vw, 3.6rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.25;
    text-wrap: balance;
  }
  & p {
    margin: 0;
    font-size: clamp(1.5rem, 1.6vw, 1.7rem);
    line-height: 1.75;
    letter-spacing: -0.025em;
    color: #7d766c;
    word-break: keep-all;
    max-width: 46ch;
  }
`;

/* ─── 로그인 ──────────────────────────────────────────────────────────── */

export const AuthCard = styled.div`
  max-width: 40rem;
  padding: clamp(2.8rem, 4vw, 4rem);
  background: #ffffff;
  ${squircle(18)}
  ${lift}
`;

export const GoogleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  min-height: 5.2rem;
  padding: 0 2rem;
  border: 1px solid #ddd7cd;
  border-radius: 8px;
  background: #ffffff;
  color: #17150f;
  font-size: 1.6rem;
  font-weight: 650;
  letter-spacing: -0.025em;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease;

  & svg {
    width: 2rem;
    height: 2rem;
    flex: 0 0 auto;
  }

  @media (any-hover: hover) {
    &:hover {
      border-color: #b9b2a6;
      background: #fdfcfa;
    }
  }
  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`;

export const AuthNote = styled.p`
  margin: 1.8rem 0 0;
  font-size: 1.4rem;
  line-height: 1.7;
  letter-spacing: -0.02em;
  color: #8d877f;
  word-break: keep-all;

  & a {
    color: #57524a;
    font-weight: 600;
    box-shadow: inset 0 -1px 0 #cfc8bc;
  }
  @media (any-hover: hover) {
    & a:hover {
      box-shadow: inset 0 -1px 0 #f7941e;
    }
  }
`;

/* ─── 신청서 · 게시물 작성 폼 ─────────────────────────────────────────── */

export const FormCard = styled.form`
  max-width: 46rem;
  padding: clamp(2.4rem, 3.4vw, 3.6rem);
  background: #ffffff;
  ${squircle(18)}
  ${lift}
  display: grid;
  gap: 1.8rem;
`;

/** 게시물 작성은 항목이 많아 조금 더 넓게 쓴다. */
export const FormWide = styled(FormCard)`
  max-width: 68rem;
`;

export const Field = styled.label`
  display: grid;
  gap: 0.7rem;
  min-width: 0;

  & > span {
    font-size: 1.4rem;
    font-weight: 650;
    letter-spacing: -0.025em;
    color: #17150f;
  }
  & > small {
    font-size: 1.3rem;
    letter-spacing: -0.02em;
    color: #8d877f;
    word-break: keep-all;
  }
`;

/** 기수·학과처럼 짧은 항목은 넓어지면 나란히 놓는다. */
export const FieldRow = styled.div`
  display: grid;
  gap: 1.8rem;

  @media (min-width: 34rem) {
    grid-template-columns: 10rem minmax(0, 1fr);
  }
`;

/** 분류 select 나 날짜 입력은 10rem 에서 글자가 잘린다. 앞칸을 더 준다. */
export const FieldRowLead = styled(FieldRow)`
  @media (min-width: 34rem) {
    grid-template-columns: 16rem minmax(0, 1fr);
  }
`;

const controlBase = css`
  width: 100%;
  min-height: 4.8rem;
  padding: 0 1.2rem;
  border: 1px solid #ddd7cd;
  border-radius: 8px;
  background: #fdfcfa;
  color: #17150f;
  font-size: 1.55rem;
  letter-spacing: -0.025em;
  transition: border-color 0.16s ease;

  &::placeholder {
    color: #a9a196;
  }
  &:focus {
    outline: none;
    border-color: #17150f;
  }
  &:disabled {
    opacity: 0.6;
  }
`;

export const Input = styled.input`
  ${controlBase}
  font-variant-numeric: tabular-nums;
`;

export const Select = styled.select`
  ${controlBase}
  cursor: pointer;
  /* 기본 화살표가 브라우저마다 달라 크기가 튄다. 직접 그린다. */
  appearance: none;
  padding-right: 3.4rem;
  background-image:
    linear-gradient(45deg, transparent 50%, #8d877f 50%),
    linear-gradient(135deg, #8d877f 50%, transparent 50%);
  background-position:
    calc(100% - 1.7rem) calc(50% + 1px),
    calc(100% - 1.25rem) calc(50% + 1px);
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;
`;

export const Textarea = styled.textarea`
  ${controlBase}
  min-height: 12rem;
  padding: 1.2rem;
  line-height: 1.7;
  resize: vertical;
`;

export const Submit = styled.button`
  min-height: 5rem;
  padding: 0 2rem;
  border: 1px solid #f7941e;
  border-radius: 8px;
  background: #f7941e;
  color: #17150f;
  font-size: 1.55rem;
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

export const FileInput = styled.input`
  font-size: 1.4rem;
  letter-spacing: -0.02em;
  color: #57524a;

  &::file-selector-button {
    margin-right: 1rem;
    min-height: 3.8rem;
    padding: 0 1.4rem;
    border: 1px solid #ddd7cd;
    border-radius: 7px;
    background: #fdfcfa;
    color: #17150f;
    font-size: 1.4rem;
    font-weight: 650;
    letter-spacing: -0.025em;
    cursor: pointer;
  }
`;

/** 저장 전에 몇 줄이 읽혔고 몇 줄이 왜 빠졌는지 그 자리에서 보여준다. */
export const Preview = styled.div`
  padding: 1.6rem 1.8rem;
  border: 1px solid #e7e2d8;
  border-radius: 10px;
  background: #fdfcfa;
  font-size: 1.4rem;
  letter-spacing: -0.02em;

  & > strong {
    display: block;
    margin-bottom: 0.8rem;
    color: #17150f;
    font-weight: 700;
  }
  & ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0.4rem;
  }
  & li {
    color: #57524a;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }
`;

export const PreviewSkipped = styled.div`
  margin-top: 1.4rem;
  padding-top: 1.4rem;
  border-top: 1px solid #e7e2d8;

  & > strong {
    display: block;
    margin-bottom: 0.8rem;
    color: #9a2c1e;
    font-weight: 700;
  }
  & li {
    color: #8d877f;
  }
`;

export const Notice = styled.p<{ $bad?: boolean }>`
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.7;
  letter-spacing: -0.02em;
  color: ${({ $bad }) => ($bad ? "#9a2c1e" : "#7d766c")};
  word-break: keep-all;
`;

/* ─── 상태 배지 ───────────────────────────────────────────────────────── */

export const Badge = styled.span<{
  $tone: "pending" | "approved" | "rejected";
}>`
  display: inline-flex;
  align-items: center;
  height: 2.4rem;
  padding: 0 0.9rem;
  border-radius: 5px;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  white-space: nowrap;

  ${({ $tone }) =>
    $tone === "approved"
      ? css`
          background: rgba(29, 122, 62, 0.12);
          color: #1d7a3e;
        `
      : $tone === "rejected"
        ? css`
            background: rgba(154, 44, 30, 0.1);
            color: #9a2c1e;
          `
        : css`
            background: rgba(247, 148, 30, 0.16);
            color: #95500a;
          `}
`;

/* ─── 승인 대기 ───────────────────────────────────────────────────────── */

const pulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50%      { opacity: 1; }
`;

export const WaitCard = styled.div`
  max-width: 44rem;
  padding: clamp(2.8rem, 4vw, 4rem);
  background: #ffffff;
  ${squircle(18)}
  ${lift}

  & h2 {
    margin: 1.6rem 0 0.8rem;
    font-size: 2.1rem;
    font-weight: 750;
    letter-spacing: -0.03em;
  }
  & p {
    margin: 0;
    font-size: 1.55rem;
    line-height: 1.75;
    letter-spacing: -0.025em;
    color: #7d766c;
    word-break: keep-all;
  }
`;

/** 심사 중임을 나타내는 점. 상태를 실제로 반영하므로 장식이 아니다. */
export const WaitDots = styled.div`
  display: flex;
  gap: 0.5rem;

  & i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #f7941e;
    animation: ${pulse} 1.4s ease-in-out infinite;
  }
  & i:nth-child(2) {
    animation-delay: 0.2s;
  }
  & i:nth-child(3) {
    animation-delay: 0.4s;
  }

  @media (prefers-reduced-motion: reduce) {
    & i {
      animation: none;
      opacity: 0.7;
    }
  }
`;

/* ─── 라운지: 게시물 ──────────────────────────────────────────────────── */

export const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: clamp(2.4rem, 3.5vw, 3.2rem);
`;

export const Chip = styled.button<{ $on: boolean }>`
  min-height: 3.6rem;
  padding: 0 1.4rem;
  border-radius: 6px;
  font-size: 1.45rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;

  ${({ $on }) =>
    $on
      ? css`
          background: #17150f;
          border: 1px solid #17150f;
          color: #fbf8f3;
        `
      : css`
          background: transparent;
          border: 1px solid #ddd7cd;
          color: #57524a;
        `}

  @media (any-hover: hover) {
    &:hover {
      border-color: ${({ $on }) => ($on ? "#17150f" : "#a9a196")};
    }
  }
`;

export const PostList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: clamp(1.4rem, 2vw, 2rem);
`;

export const PostCard = styled.li`
  padding: clamp(2rem, 2.6vw, 2.6rem);
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

export const PostTop = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.6rem 1rem;
  margin-bottom: 0.9rem;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #8d877f;

  & time {
    font-variant-numeric: tabular-nums;
  }
`;

export const Kind = styled.span`
  color: #95500a;
`;

export const PostTitle = styled.h3`
  margin: 0 0 0.8rem;
  font-size: clamp(1.8rem, 2vw, 2.05rem);
  font-weight: 750;
  letter-spacing: -0.03em;
  line-height: 1.35;
  word-break: keep-all;
`;

export const PostBody = styled.p`
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.75;
  letter-spacing: -0.025em;
  color: #7d766c;
  word-break: keep-all;
  white-space: pre-line;
  max-width: 62ch;
`;

export const PostLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 4.4rem;
  margin-top: 0.6rem;
  font-size: 1.5rem;
  font-weight: 650;
  letter-spacing: -0.025em;
  color: #17150f;

  & span {
    box-shadow: inset 0 -1px 0 #cfc8bc;
    transition: box-shadow 0.16s ease;
  }
  & svg {
    width: 1.5rem;
    height: 1.5rem;
  }
  @media (any-hover: hover) {
    &:hover span {
      box-shadow: inset 0 -1px 0 #f7941e;
    }
  }
`;

export const Empty = styled.div`
  padding: clamp(4rem, 7vw, 7rem) 0;
  text-align: center;
  font-size: 1.55rem;
  letter-spacing: -0.025em;
  color: #8d877f;
`;

/* ─── 운영진: 승인 목록 ───────────────────────────────────────────────── */

export const Rows = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const Row = styled.li`
  display: grid;
  gap: 0.6rem 1.6rem;
  padding: clamp(1.6rem, 2.2vw, 2.2rem) 0;
  border-top: 1px solid #e7e2d8;

  @media (min-width: 52rem) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
  &:last-child {
    border-bottom: 1px solid #e7e2d8;
  }
`;

export const Who = styled.div`
  min-width: 0;

  & strong {
    font-size: 1.7rem;
    font-weight: 750;
    letter-spacing: -0.03em;
  }
  & p {
    margin: 0.4rem 0 0;
    font-size: 1.4rem;
    letter-spacing: -0.02em;
    color: #8d877f;
    overflow-wrap: anywhere;
  }
`;

/** 명단 대조 결과. 운영진이 승인 여부를 3초 안에 판단하게 하는 것이 목적이다. */
export const Match = styled.p<{ $ok: boolean }>`
  margin: 0.6rem 0 0 !important;
  font-size: 1.4rem !important;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${({ $ok }) => ($ok ? "#1d7a3e" : "#9a2c1e")} !important;
  word-break: keep-all;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

/** 거절 사유를 받는 동안만 나타나는 자리. 행 안에서 세로로 쌓인다. */
export const RejectBox = styled.div`
  display: grid;
  gap: 0.8rem;
  min-width: 0;

  @media (min-width: 52rem) {
    width: 32rem;
  }
`;

const actionBase = css`
  min-height: 4.2rem;
  padding: 0 1.6rem;
  border-radius: 7px;
  font-size: 1.45rem;
  font-weight: 650;
  letter-spacing: -0.025em;
  cursor: pointer;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const Approve = styled.button`
  ${actionBase}
  background: #f7941e;
  border: 1px solid #f7941e;
  color: #17150f;

  @media (any-hover: hover) {
    &:hover:not(:disabled) {
      background: #ffa63d;
      border-color: #ffa63d;
    }
  }
`;

export const Reject = styled.button`
  ${actionBase}
  background: transparent;
  border: 1px solid #ddd7cd;
  color: #57524a;

  @media (any-hover: hover) {
    &:hover:not(:disabled) {
      border-color: #9a2c1e;
      color: #9a2c1e;
    }
  }
`;

export const Promote = styled.button`
  ${actionBase}
  background: transparent;
  border: 1px solid #ddd7cd;
  color: #57524a;
  font-size: 1.35rem;
`;

/* ─── 운영진: 통계 ────────────────────────────────────────────────────── */

export const StatBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: clamp(2.4rem, 3.5vw, 3.2rem);
`;

/**
 * 지원 퍼널.
 *
 * 막대 길이는 첫 단계 대비 비율이다. 숫자만 나열하면 "1200 → 180" 이 큰 낙차인지
 * 눈으로 안 잡히는데, 길이로 두면 어디서 빠지는지 한눈에 보인다.
 */
export const Funnel = styled.ol`
  list-style: none;
  margin: 0 0 clamp(3.2rem, 5vw, 4.8rem);
  padding: 0;
  display: grid;
  gap: 1.2rem;
`;

export const FunnelStep = styled.li<{ $ratio: number; $last: boolean }>`
  display: grid;
  gap: 0.7rem;

  & > div:first-child {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1.6rem;
  }

  & .label {
    font-size: 1.5rem;
    font-weight: 650;
    letter-spacing: -0.025em;
    color: #17150f;
  }
  & .count {
    font-size: 1.9rem;
    font-weight: 750;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
    color: #17150f;
  }
  & .count small {
    margin-left: 0.6rem;
    font-size: 1.35rem;
    font-weight: 600;
    color: #8d877f;
  }

  /* 막대. 마지막 단계만 오렌지로 두어 목표 지점을 표시한다. */
  & .track {
    height: 1rem;
    border-radius: 3px;
    background: #eee9df;
    overflow: hidden;
  }
  & .fill {
    display: block;
    height: 100%;
    width: ${({ $ratio }) => Math.max($ratio * 100, 1.2)}%;
    border-radius: 3px;
    background: ${({ $last }) => ($last ? "#f7941e" : "#17150f")};
    transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    & .fill {
      transition: none;
    }
  }
`;

/** 단계 사이에서 몇 %가 남았는지. 퍼널에서 가장 중요한 숫자다. */
export const FunnelDrop = styled.p`
  margin: 0.2rem 0 0;
  font-size: 1.35rem;
  letter-spacing: -0.02em;
  color: #8d877f;
  font-variant-numeric: tabular-nums;

  & b {
    color: #57524a;
    font-weight: 700;
  }
`;

export const StatGrid = styled.div`
  display: grid;
  gap: clamp(2.4rem, 4vw, 3.6rem);

  @media (min-width: 62rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const StatBlock = styled.section`
  min-width: 0;

  & > h2 {
    margin: 0 0 1.2rem;
    font-size: 1.7rem;
    font-weight: 750;
    letter-spacing: -0.03em;
  }
`;

/** 순위표. 막대를 셀 배경으로 깔아 숫자와 크기를 같은 줄에서 읽게 한다. */
export const StatRows = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.2rem;
`;

export const StatRow = styled.li<{ $ratio: number }>`
  position: relative;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 0.9rem 1rem;
  border-radius: 6px;
  font-size: 1.45rem;
  letter-spacing: -0.02em;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: ${({ $ratio }) => Math.max($ratio * 100, 0.8)}%;
    background: #f1ece2;
    border-radius: 6px;
  }

  & span,
  & strong {
    position: relative;
  }
  & span {
    color: #57524a;
    overflow-wrap: anywhere;
  }
  & strong {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #17150f;
    white-space: nowrap;
  }
  & strong em {
    margin-left: 0.5rem;
    font-style: normal;
    font-weight: 600;
    font-size: 1.3rem;
    color: #8d877f;
  }
`;

/* ─── 운영진: 탭 ──────────────────────────────────────────────────────── */

export const Tabs = styled.div`
  display: flex;
  gap: 2.4rem;
  margin-bottom: clamp(2.4rem, 3.5vw, 3.2rem);
  border-bottom: 1px solid #e7e2d8;
`;

export const Tab = styled.button<{ $on: boolean }>`
  position: relative;
  padding: 0 0 1.2rem;
  background: none;
  border: 0;
  font-size: 1.6rem;
  font-weight: ${({ $on }) => ($on ? 750 : 600)};
  letter-spacing: -0.03em;
  color: ${({ $on }) => ($on ? "#17150f" : "#8d877f")};
  cursor: pointer;

  & small {
    margin-left: 0.5rem;
    font-size: 1.3rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: #a9a196;
  }

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background: #f7941e;
    transform: scaleX(${({ $on }) => ($on ? 1 : 0)});
    transform-origin: left center;
    transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
  }
`;

/* ─── 공통 ────────────────────────────────────────────────────────────── */

export const SignOut = styled.button`
  min-height: 4rem;
  padding: 0 1.2rem;
  background: none;
  border: 0;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #8d877f;
  cursor: pointer;

  @media (any-hover: hover) {
    &:hover {
      color: #17150f;
    }
  }
`;

/** 카드 아래에 붙는 보조 동작(로그아웃 등) 자리. */
export const Foot = styled.div`
  margin-top: 1.6rem;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  flex-wrap: wrap;
  margin-bottom: clamp(2rem, 3vw, 2.8rem);
`;
