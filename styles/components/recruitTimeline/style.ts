import styled, { css, keyframes } from "styled-components";
import { THEME } from "styles/theme";

/**
 * 단계별 상태를 색 하나로만 구분하지 않는다.
 * 색맹이거나 대비가 낮은 화면에서도 읽히도록 점의 채움 여부, 글자 굵기,
 * "진행 중" / "마감" 텍스트까지 같이 바꾼다.
 */

export const Timeline = styled.ol`
  list-style: none;
  margin: 0.8rem 0 0;
  padding: 0;
  position: relative;


`;

export const Marker = styled.span`
  position: relative;
  z-index: 1;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 1px solid #4a4a4a;
  background: #151515;
  flex: 0 0 auto;
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
`;

export const Label = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: #8d877f;
  min-width: 11rem;
`;

export const Date = styled.span`
  font-size: 1.45rem;
  color: #6f6a63;
  font-variant-numeric: tabular-nums;
`;

export const Badge = styled.span`
  font-size: 1.3rem;
  font-weight: 600;
  color: #151515;
  background: ${THEME.ORANGE};
  border-radius: 3px;
  padding: 0.25rem 0.8rem;
  white-space: nowrap;
`;

export const DoneMark = styled.span`
  font-size: 1.3rem;
  color: #6f6a63;
  white-space: nowrap;
`;

export const Row = styled.li<{ $done: boolean; $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 0.55rem 0;
  flex-wrap: wrap;

  ${({ $done }) =>
    $done &&
    css`
      ${Label} {
        color: #6f6a63;
        font-weight: 500;
      }
      ${Date} {
        color: #5c574f;
      }
      ${Marker} {
        background: #3a3a3a;
        border-color: #3a3a3a;
      }
    `}

  ${({ $active }) =>
    $active &&
    css`
      ${Label} {
        color: #ffffff;
        font-weight: 700;
        font-size: 2rem;
      }
      ${Date} {
        color: #d8d4cd;
        font-size: 1.6rem;
      }
      ${Marker} {
        background: ${THEME.ORANGE};
        border-color: ${THEME.ORANGE};
        box-shadow: 0 0 0 4px rgba(247, 148, 30, 0.18);
      }
    `}

  /* 좁은 화면에서는 라벨과 날짜를 줄바꿈해 옆으로 넘치지 않게 */
  @media (max-width: 560px) {
    gap: 0.5rem 1rem;

    ${Label} {
      min-width: 0;
      flex: 1 1 auto;
    }
    ${Date} {
      flex: 0 0 auto;
    }
  }
`;

/**
 * 단계와 단계 "사이" 구간 표시.
 *
 * 지금이 어느 단계에도 걸치지 않은 시점(예: 1차 발표는 끝났고 면접은 아직)이면
 * 주황 점을 찍을 곳이 없어 타임라인이 통째로 멈춘 것처럼 보인다.
 * 그럴 때만 두 점 사이에 선을 하나 끼우고 주황빛을 아래로 흘려
 * "다음 단계로 가는 중"이라는 상태를 보여준다.
 */
const flowDown = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(100%); }
`;

export const Flow = styled.li`
  position: relative;
  /* 위아래 점에 바짝 붙여야 두 단계를 잇는 선으로 읽힌다.
     음수 마진으로 행 사이 여백을 파고들되, 늘린 만큼 높이로 되돌려
     타임라인 전체 간격은 그대로 유지한다. */
  height: 5.2rem;
  margin: -1.45rem 0;
  overflow: hidden;

  /* 흐름이 지나갈 궤도. 마커(11px)의 중심에 맞춘다. */
  &::before {
    content: "";
    position: absolute;
    left: 5px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgba(247, 148, 30, 0.22);
  }

  /* 위에서 아래로 반복해 지나가는 주황 빛. */
  &::after {
    content: "";
    position: absolute;
    left: 4.5px;
    top: 0;
    width: 2px;
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(247, 148, 30, 0.55) 35%,
      ${THEME.ORANGE} 55%,
      transparent 100%
    );
    animation: ${flowDown} 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }

  /* 모션에 민감한 사용자에게는 흐르지 않는 옅은 주황 선으로만 보여준다. */
  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
      background: rgba(247, 148, 30, 0.45);
    }
  }
`;
