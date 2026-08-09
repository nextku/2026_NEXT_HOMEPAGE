import styled, { css, keyframes } from "styled-components";

import { squircle, lift } from "styles/surface";

/**
 * 확인 상자와 입력 상자.
 *
 * 사이트의 다른 화면과 같은 문법을 쓴다 — 크림 바탕, 검정 글씨, 오렌지는
 * 누르는 것에만. 브라우저가 그리는 상자와 달라야 하는 이유가 바로 이것이라,
 * 여기서만 쓰는 색을 새로 만들지 않는다.
 */

const INK = "#17150f";
const BODY = "#57524a";
const LINE = "#e7e2d8";
const FILL = "#fdfcfa";
const DANGER = "#c0392b";

const fade = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const rise = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.985); }
  to   { opacity: 1; transform: none; }
`;

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(23, 21, 15, 0.42);
  animation: ${fade} 0.14s ease;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Card = styled.div`
  width: min(100%, 40rem);
  padding: 2.6rem;
  ${squircle(16)};
  background: ${FILL};
  ${lift};
  animation: ${rise} 0.16s ease;

  & h2 {
    margin: 0;
    font-size: 1.9rem;
    font-weight: 750;
    letter-spacing: -0.035em;
    line-height: 1.4;
    color: ${INK};
    word-break: keep-all;
  }
  & p {
    margin: 1rem 0 0;
    font-size: 1.5rem;
    line-height: 1.7;
    letter-spacing: -0.025em;
    color: ${BODY};
    word-break: keep-all;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 2.4rem;
`;

const button = css`
  min-height: 4.4rem;
  padding: 0 1.8rem;
  border-radius: 9px;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  cursor: pointer;
  transition:
    background 0.14s ease,
    border-color 0.14s ease;

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`;

export const Cancel = styled.button`
  ${button};
  border: 1px solid ${LINE};
  background: transparent;
  color: ${BODY};

  @media (any-hover: hover) {
    &:hover:not(:disabled) {
      border-color: #a9a196;
      color: ${INK};
    }
  }
`;

export const Go = styled.button<{ $danger?: boolean }>`
  ${button};
  ${({ $danger }) =>
    $danger
      ? css`
          border: 1px solid ${DANGER};
          background: ${DANGER};
          color: #ffffff;
        `
      : css`
          border: 1px solid ${INK};
          background: ${INK};
          color: #fbf8f3;
        `}

  @media (any-hover: hover) {
    &:hover:not(:disabled) {
      background: ${({ $danger }) => ($danger ? "#a93226" : "#2e2a20")};
      border-color: ${({ $danger }) => ($danger ? "#a93226" : "#2e2a20")};
    }
  }
`;

/* ─── 한 줄 입력 ──────────────────────────────────────────────────────── */

export const Field = styled.label`
  display: block;
  margin-top: 1.8rem;

  & span {
    display: block;
    margin-bottom: 0.7rem;
    font-size: 1.35rem;
    font-weight: 650;
    letter-spacing: -0.02em;
    color: ${INK};
  }
`;

export const Input = styled.input`
  width: 100%;
  min-height: 4.6rem;
  padding: 0 1.4rem;
  border: 1px solid ${LINE};
  border-radius: 9px;
  background: #ffffff;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
  color: ${INK};

  &::placeholder {
    color: #a9a196;
  }
  &:focus {
    outline: none;
    border-color: ${INK};
  }
`;
