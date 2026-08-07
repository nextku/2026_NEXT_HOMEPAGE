import styled from "styled-components";

/**
 * 약관 · 개인정보처리방침
 *
 * 읽히는 것이 목적인 문서다. 장식을 넣지 않고 글줄 길이와 위계만 관리한다.
 */

export const Page = styled.main`
  width: 100%;
  min-height: 100dvh;
  background: #fbf8f3;
  color: #17150f;
  padding-top: max(11rem, calc(9rem + env(safe-area-inset-top)));
  padding-bottom: clamp(6rem, 10vw, 12rem);
`;

export const Wrap = styled.div`
  width: 100%;
  max-width: 74rem;
  margin: 0 auto;
  padding-inline: max(clamp(2rem, 5vw, 6rem), env(safe-area-inset-left));
`;

export const Head = styled.header`
  margin-bottom: clamp(3.2rem, 5vw, 5rem);

  & h1 {
    margin: 0 0 1rem;
    font-size: clamp(2.4rem, 3.4vw, 3.4rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.25;
  }
  & p {
    margin: 0;
    font-size: 1.5rem;
    letter-spacing: -0.02em;
    color: #8d877f;
    font-variant-numeric: tabular-nums;
  }
`;

export const Section = styled.section`
  margin-bottom: clamp(3rem, 4.5vw, 4.4rem);

  & h2 {
    margin: 0 0 1.2rem;
    font-size: clamp(1.8rem, 2.1vw, 2.1rem);
    font-weight: 750;
    letter-spacing: -0.03em;
    line-height: 1.35;
    word-break: keep-all;
  }
  & p {
    margin: 0 0 1rem;
    font-size: 1.55rem;
    line-height: 1.8;
    letter-spacing: -0.025em;
    color: #57524a;
    word-break: keep-all;
  }
  & p:last-child {
    margin-bottom: 0;
  }
  & b {
    color: #17150f;
    font-weight: 700;
  }
  & a {
    color: #17150f;
    font-weight: 600;
    box-shadow: inset 0 -1px 0 #cfc8bc;
    overflow-wrap: anywhere;
  }
  @media (any-hover: hover) {
    & a:hover {
      box-shadow: inset 0 -1px 0 #f7941e;
    }
  }

  & ul {
    margin: 0 0 1rem;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0.7rem;
  }
  & li {
    position: relative;
    padding-left: 1.4rem;
    font-size: 1.55rem;
    line-height: 1.75;
    letter-spacing: -0.025em;
    color: #57524a;
    word-break: keep-all;
  }
  & li::before {
    content: "";
    position: absolute;
    left: 0.2rem;
    top: 0.85em;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #cfc8bc;
  }
`;

/** 수집 항목처럼 표로 보는 편이 빠른 내용에 쓴다. */
export const Table = styled.div`
  overflow-x: auto;
  margin: 0 0 1rem;

  & table {
    width: 100%;
    min-width: 40rem;
    border-collapse: collapse;
    font-size: 1.45rem;
    letter-spacing: -0.02em;
  }
  & th,
  & td {
    text-align: left;
    padding: 1rem 1.2rem 1rem 0;
    border-bottom: 1px solid #e7e2d8;
    vertical-align: top;
    word-break: keep-all;
  }
  & th {
    font-weight: 700;
    color: #17150f;
    border-bottom-color: #cfc8bc;
    white-space: nowrap;
  }
  & td {
    color: #57524a;
    line-height: 1.7;
  }
  /* 첫 칸은 행의 이름표다. 두 줄로 접히면 표가 지저분해진다. */
  & tbody td:first-child {
    white-space: nowrap;
    color: #17150f;
    font-weight: 600;
  }
`;

export const Contact = styled.div`
  margin-top: clamp(3.2rem, 5vw, 4.8rem);
  padding-top: clamp(2rem, 3vw, 2.8rem);
  border-top: 1px solid #e7e2d8;
  font-size: 1.5rem;
  line-height: 1.8;
  letter-spacing: -0.025em;
  color: #7d766c;

  & strong {
    display: block;
    margin-bottom: 0.6rem;
    color: #17150f;
    font-weight: 700;
  }
  & a {
    color: inherit;
    box-shadow: inset 0 -1px 0 #cfc8bc;
    overflow-wrap: anywhere;
  }
`;
