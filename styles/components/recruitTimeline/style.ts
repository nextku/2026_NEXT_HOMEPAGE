import styled, { css } from "styled-components";
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
