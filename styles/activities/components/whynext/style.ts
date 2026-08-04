import styled, { css } from "styled-components";
import { squircle, lift, liftHover } from "styles/surface";

/**
 * Why NEXT 포스터 연작
 *
 * 포스터 5장은 그 자체로 완성된 디자인이다(로고 · 사진 콜라주 · 헤드라인 · 본문).
 * 그래서 카드로 감싸거나 테두리를 두르지 않는다. 새 장식을 얹으면 포스터 안의
 * 위계와 싸운다. 여백과 등장 순서만 설계한다.
 *
 * 넓은 화면에서는 좌우로 조금씩 엇갈리게 둔다. 크게 지그재그로 흔들면 배치가
 * 우연처럼 보이므로 폭의 7% 만 움직인다. 읽는 리듬만 만들고 시선은 안 뺏는다.
 */

export const Section = styled.section`
  width: 100%;
  max-width: 132rem;
  margin: 0 auto;
  padding: clamp(3.2rem, 6vw, 7.2rem) clamp(2rem, 5vw, 6rem)
    clamp(6rem, 10vw, 12rem);
`;

export const Intro = styled.div`
  max-width: 52rem;
  margin-bottom: clamp(4rem, 6vw, 7rem);

  & h2 {
    margin: 0 0 1.2rem;
    font-size: clamp(2.4rem, 3.4vw, 3.6rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.25;
    color: #17150f;
    text-wrap: balance;
  }
  & p {
    margin: 0;
    font-size: clamp(1.5rem, 1.6vw, 1.7rem);
    line-height: 1.75;
    letter-spacing: -0.025em;
    color: #7d766c;
    word-break: keep-all;
  }
`;

export const List = styled.div`
  display: grid;
  gap: clamp(4.8rem, 7vw, 9.6rem);
`;

/** 포스터 한 장. 스크롤로 들어오면 아래에서 살짝 올라오며 드러난다. */
export const Item = styled.div<{ $shown: boolean; $flip: boolean }>`
  position: relative;
  width: 100%;
  max-width: 62rem;
  margin-inline: auto;

  opacity: ${({ $shown }) => ($shown ? 1 : 0)};
  transform: ${({ $shown }) =>
    $shown ? "translate3d(0, 0, 0)" : "translate3d(0, 26px, 0)"};
  transition:
    opacity 0.62s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.62s cubic-bezier(0.22, 1, 0.36, 1);

  /*
   * 넓은 화면에서는 포스터를 한쪽에 두고 반대쪽에 짧은 글을 놓는다.
   * 이전에는 포스터만 좌우로 엇갈려서 반대편이 계속 비어 있었다.
   * 글은 포스터가 하지 않는 말을 맡는다 — 포스터는 무엇을 주는지 말하고,
   * 이 글은 읽는 사람이 지금 하고 있을 고민을 짚는다.
   */
  @media (min-width: 60rem) {
    max-width: none;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: center;
    gap: clamp(3.2rem, 5vw, 6.4rem);

    ${({ $flip }) =>
      $flip &&
      css`
        direction: rtl;
        > * {
          direction: ltr;
        }
      `}
  }

  @media (any-hover: hover) {
    &:hover [data-frame] {
      ${liftHover}
    }
  }

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: none;
    transition: none;
  }
`;

/** 포스터 옆 글. 좁은 화면에서는 포스터 위에 온다. */
export const Aside = styled.div`
  order: -1;
  margin-bottom: 1.8rem;

  @media (min-width: 60rem) {
    order: 0;
    margin-bottom: 0;
    padding-inline: clamp(0rem, 2vw, 2.4rem);
  }

  & h3 {
    margin: 0 0 1rem;
    font-size: clamp(1.9rem, 2.2vw, 2.4rem);
    font-weight: 750;
    letter-spacing: -0.035em;
    line-height: 1.35;
    color: #17150f;
    word-break: keep-all;
    text-wrap: balance;
  }
  & p {
    margin: 0;
    font-size: clamp(1.45rem, 1.5vw, 1.6rem);
    line-height: 1.8;
    letter-spacing: -0.025em;
    color: #7d766c;
    word-break: keep-all;
    max-width: 34ch;
  }
`;

export const Frame = styled.div`
  position: relative;
  width: 100%;
  /* 원본 2160 x 2700 */
  aspect-ratio: 2160 / 2700;
  overflow: hidden;
  background: #f4f1ea;
  ${squircle(24)}
  ${lift}
  transition: box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;
