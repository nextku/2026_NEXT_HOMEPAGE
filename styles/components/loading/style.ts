import styled, { keyframes } from "styled-components";

/**
 * 로딩 화면
 *
 * 처음에는 "Loading..." 이 0.5초마다 깜빡였고, 그 다음에는 로고 아래에 오렌지
 * 진행 바를 뒀다. 둘 다 화면에 요소를 하나 더 얹는 방식이라 로딩 화면치고
 * 복잡했고, 배경(#121009)도 따뜻한 쪽으로 기울어 색이 도는 게 보였다.
 *
 * 지금은 워드마크 하나만 남긴다. 진행 표시는 별도 UI 가 아니라
 * 로고 위를 훑고 지나가는 빛으로 대신한다. 로고와 같은 모양으로 마스킹하므로
 * 사각형 하이라이트가 새로 생기지 않는다.
 */

const sweep = keyframes`
  from {
    background-position: 145% 0;
  }
  to {
    background-position: -45% 0;
  }
`;

const settle = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const LoadingContainer = styled.div`
  width: 100%;
  /* iOS Safari 는 100vh 가 주소창을 포함해 화면 밖으로 넘친다 */
  height: 100vh;
  height: 100dvh;
  /* 완전한 중립 무채색. 이전 #121009 는 따뜻한 쪽으로 기울어 색이 돌았다. */
  background-color: #0b0b0c;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline: 24px;
`;

const LOGO = '/assets/new_logo(wh).svg';

export const LoadingWrapper = styled.div`
  position: relative;
  width: clamp(148px, 40vw, 268px);
  animation: ${settle} 400ms cubic-bezier(0.22, 1, 0.36, 1) both;

  & img {
    width: 100%;
    height: auto;
    display: block;
  }

  /* 로고 모양으로 잘라낸 빛. 로고 밖으로는 아무것도 새지 않는다. */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      100deg,
      transparent 40%,
      rgba(255, 255, 255, 0.9) 50%,
      transparent 60%
    );
    background-size: 250% 100%;
    background-repeat: no-repeat;
    -webkit-mask: url("${LOGO}") center / contain no-repeat;
    mask: url("${LOGO}") center / contain no-repeat;
    animation: ${sweep} 1.5s cubic-bezier(0.45, 0, 0.25, 1) infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    &::after {
      animation: none;
      opacity: 0;
    }
  }
`;

/** 화면에는 안 보이지만 스크린리더에는 상태가 읽혀야 한다. */
export const Text = styled.p`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const Track = styled.div`
  display: none;
`;

export const SpinnerWrapper = styled.div`
  display: none;
`;
