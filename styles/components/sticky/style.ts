import styled, { css, keyframes } from "styled-components";
import { THEME } from "styles/theme";

const leftPrimary = keyframes` 
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-100%, 0);
  }

`;
const leftSecondary = keyframes` 
  0% {
    transform: translate(100%, 0);
  }
  100% {
    transform: translate(0, 0);
  }

`;

export const StickyContainer = styled.div`
  width: 100%;
  height: calc(100vh + 1000px + 12rem);
  position: relative;

  /*
   * 모바일에서는 사진이 낮아 이 높이를 다 쓰지 못하고 아래가 비어 보인다.
   * 스크롤 구간을 줄여 사진과 다음 섹션이 자연스럽게 이어지게 한다.
   */
  @media (max-width: 820px) {
    height: auto;
  }
`;

export const StickyContent = styled.div<{ isMobile: boolean }>`
  width: 100%;
  min-height: 100vh;
  padding: clamp(7rem, 11vw, 13rem) clamp(2.4rem, 8vw, 10rem);
  /*
   * 홈 전체가 다크로 6000px 이어져 눈이 쉴 곳이 없었다.
   * 이 구간만 밝은 면으로 바꿔 리듬을 만든다. 다른 페이지가 밝은 면이라
   * 사이트 전체로도 이어진다.
   */
  background-color: #fbf8f3;
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;

  /* 모바일에서는 absolute 를 풀어 사진과 세로로 이어지게 한다 */
  @media (max-width: 820px) {
    position: relative;
    min-height: 0;
  }
  flex-direction: column;
  justify-content: center;
  /* &::after {
    content: "";    
    display: block;
    padding-bottom: 56.25%;
  } */
  ${(props) =>
    props.isMobile &&
    css`
      padding: 10rem 8%;
      & div {
        width: 100%;
      }
    `}
`;

interface NextInlineLogoProps {
  width?: string;
}

export const NextInlineLogo = styled.img<NextInlineLogoProps>`
  position: relative;
  top: -3px;
  width: ${({ width }) => width || "120px"};
  display: inline-block;
  margin-left: 10px;
  margin-right: 3px;

  @media (max-width: 820px) {
    width: 80px;
  }
`;
export const Sticky = styled.div<{ isMobile: boolean }>`
  /*
   * 모바일에서 height: 100vh 를 강제했는데 사진은 contain 이라 실제 높이가
   * 그보다 훨씬 작다. 그 차이가 위아래 빈 검정 공간으로 남았다.
   * 단체사진은 잘라내면 안 되므로 높이를 사진에 맡기고, 화면 세로 중앙에 둔다.
   */
  width: 100%;
  top: 0;
  position: -webkit-sticky;
  position: sticky;
  display: flex;
  align-items: center;
  justify-content: center;

  & img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
  }

  ${(props) =>
    props.isMobile &&
    css`
      /* 사진이 화면보다 낮으면 그만큼만 차지한다 */
      min-height: 0;
      padding-block: clamp(2rem, 6vw, 4rem);
    `}
`;
export const TextWrapper = styled.div<{ isMobile: boolean }>`
  width: 100%;
  font-size: 2.4rem;
  word-break: keep-all;
  color: #17150f;
  overflow: hidden;
  position: relative;

  & p {
    line-height: 1.75;
    letter-spacing: -0.025em;
    width: 100%;
    max-width: 52ch;
    margin: 3.2rem 0 0;
    color: #57524a;
  }
  /*
   * 섹션 제목이 오렌지 가운데 정렬이라 다른 페이지와 문법이 달랐다.
   * 색으로 만들던 위계를 크기와 굵기로 옮긴다.
   */
  & > span {
    font-size: clamp(2.6rem, 4vw, 4.2rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.2;
  }
  & span big {
    font-size: clamp(2.4rem, 3.4vw, 3.4rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.35;
  }
  & span b {
    color: #17150f;
    font-weight: inherit;
  }
  ${(props) =>
    props.isMobile &&
    css`
      font-size: 1.8rem;
      & p {
        width: 100%;
      }
      & p span big {
        font-size: 3.2rem;
        font-weight: 700;
      }
    `}
`;

export const MoreBtn = styled.div<{ isMobile: boolean }>`
  /* width: 8rem; */
  height: 4rem;
  cursor: pointer;
  border: 1px solid transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${THEME.ORANGE};
  transition: 0.5s;
  ${(props) =>
    !props.isMobile &&
    css`
      &:hover {
        /* background-color: ${THEME.LIGHT_ORANGE}; */
        border-bottom: 1px solid ${THEME.ORANGE};
      }
    `}
`;
