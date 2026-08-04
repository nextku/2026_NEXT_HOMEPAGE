import styled, { keyframes } from "styled-components";

/**
 * 로딩 화면
 *
 * 이전에는 흰 로고 아래 "Loading..." 이 0.5초마다 깜빡였다. 깜빡이는 텍스트는
 * 오래돼 보이고, 실제 진행 상황과 아무 관계가 없어 정보도 주지 못한다.
 *
 * 대신 로고 아래 얇은 선 하나가 브랜드 오렌지로 훑고 지나간다.
 * 로고의 로켓이 지나간 자리처럼 읽히도록 왼쪽에서 오른쪽으로만 흐른다.
 * 가짜 퍼센트는 쓰지 않는다. 실제 진행률을 모르면서 숫자를 보여주면 거짓말이 된다.
 */

const sweep = keyframes`
  0% {
    transform: translateX(-100%) scaleX(0.35);
  }
  50% {
    transform: translateX(0%) scaleX(0.55);
  }
  100% {
    transform: translateX(100%) scaleX(0.35);
  }
`;

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const LoadingContainer = styled.div`
  width: 100%;
  /* iOS Safari 는 100vh 가 주소창 높이를 포함해 화면 밖으로 넘친다 */
  height: 100vh;
  height: 100dvh;
  background-color: #121009;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: clamp(20px, 4vw, 28px);
  padding-inline: 24px;
`;

export const LoadingWrapper = styled.div`
  /* 고정 300px 이면 좁은 화면에서 화면 폭을 넘는다 */
  width: clamp(140px, 42vw, 260px);
  animation: ${rise} 420ms cubic-bezier(0.22, 1, 0.36, 1) both;

  & img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

/** 로고 폭에 맞춘 얇은 트랙. 그 위를 오렌지 선이 훑는다. */
export const Track = styled.div`
  width: clamp(140px, 42vw, 260px);
  height: 2px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;

  &::after {
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    background: #f7941e;
    transform-origin: left center;
    animation: ${sweep} 1.15s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  }

  /* 모션을 줄이라고 했으면 흐르지 않고 가만히 채워둔다 */
  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
      transform: none;
      opacity: 0.5;
    }
  }
`;

export const Text = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.42);
  font-size: 13px;
  letter-spacing: -0.01em;
`;

export const SpinnerWrapper = styled.div`
  display: none;
`;
