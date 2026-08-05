import styled, { css, keyframes } from "styled-components";
import { motion } from "framer-motion";

export const MainContainer = styled.div`
  /* slick 트랙이 화면 폭보다 넓어 가로 스크롤이 생긴다. 여기서 잘라낸다. */
  overflow: hidden;
  margin-top: 6rem;
  width: 80%;

  /*
   * slick 트랙은 슬라이드 전체 폭(8000px+)으로 잡히고, .slick-list 에
   * overflow 가 없으면 그대로 화면 밖으로 삐져나와 가로 스크롤이 생긴다.
   * cdnjs 로 불러오는 slick.css 가 덮이는 경우가 있어 여기서 다시 못 박는다.
   */
  .slick-list {
    overflow: hidden;
  }
`;
export const ElementWrapper = styled.div`
  width: 40%;
  padding: 2rem;
`;
export const ImageWrapper = styled.div`
  /*
   * object-fit: cover 에 정사각형 비율이라 로고가 좌우로 잘려 나갔다.
   * 원본 비율을 살리고 카드로 감싼다. 회사 로고는 대개 밝은 배경 기준이라
   * 흰 판 위에 올린다.
   */
  width: 88%;
  aspect-ratio: 4 / 3;
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border-radius: 14px;
  @supports (corner-shape: squircle) {
    corner-shape: squircle;
    border-radius: 20px;
  }
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.08),
    0 8px 20px rgba(0, 0, 0, 0.1);

  & img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 12%;
  }
`;
export const ElementInfo = styled.div`
  font-size: 1.6rem;
  margin-top: 2rem;
  & p {
    margin: 0;
    margin-top: 0.5rem;
  }
`;
