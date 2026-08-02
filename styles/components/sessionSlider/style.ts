import styled from "styled-components";
import { THEME } from "styles/theme";

export const SliderWrapper = styled.div<{ $fit?: string; $ratio?: string }>`
  width: 100%;
  position: relative;

  .slick-slide img {
    width: 100%;
    aspect-ratio: ${(props) => props.$ratio || "16 / 9"};
    object-fit: ${(props) => props.$fit || "cover"};
  }

  /* 좌우 이동 화살표: 평소엔 숨기고, 사진에 마우스를 올렸을 때만 노출 */
  .slick-prev,
  .slick-next {
    z-index: 2;
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  &:hover .slick-prev,
  &:hover .slick-next {
    opacity: 1;
  }
  .slick-prev {
    left: 1.2rem;
  }
  .slick-next {
    right: 1.2rem;
  }
  /* 화살표 모양: 텍스트 기호가 아니라 선 두 개(border)로 그린 얇은 chevron */
  .slick-prev:before,
  .slick-next:before {
    content: "";
    display: block;
    width: 1.3rem;
    height: 1.3rem;
    border-top: 3px solid ${THEME.WHITE};
    border-right: 3px solid ${THEME.WHITE};
    opacity: 0.6;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
    transition: opacity 0.2s ease;
  }
  .slick-next:before {
    transform: rotate(45deg);
  }
  .slick-prev:before {
    transform: rotate(-135deg);
  }
  .slick-prev:hover:before,
  .slick-next:hover:before {
    opacity: 0.85;
  }

  /* 하단 인디케이터(점) */
  .slick-dots {
    bottom: 1rem;
  }
  .slick-dots li button:before {
    font-size: 1rem;
    color: ${THEME.WHITE};
    opacity: 0.6;
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  }
  .slick-dots li.slick-active button:before {
    color: ${THEME.ORANGE};
    opacity: 1;
  }
`;

export const Slide = styled.div`
  width: 100%;
  outline: none;
`;
