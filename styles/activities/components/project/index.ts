import styled, { css, keyframes } from "styled-components";
import { THEME } from "styles/theme";

export const Container = styled.div<{ isMobile: boolean }>`
  width: 100%;
  min-height: 100%;
  padding: 6rem 3rem;
`;

export const MainContainer = styled.div<{ isMobile: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;

  ${(props) =>
    props.isMobile &&
    css`
      padding: 0;
    `}

  & > div:nth-child(1),
& > div:nth-child(2) {
  border-right: 2px solid ${THEME.GRAY_200};
}
& > div:nth-child(3) {
  border-right: none;
}
`;

export const SessionWrapper = styled.div<{ isMobile: boolean }>`
  width: 33%;
  padding-top: 3%;
  padding-bottom: 8%;
  display: flex;
  flex-direction: column;
  justify-content: space-between; // 내부 요소 균형 맞춤
  align-items: stretch; // 높이 균일하게 맞춤

  @media screen and (max-width: 500px) {
    flex-direction: column;
    width: 100%;
  }

  ${(props) =>
    props.isMobile &&
    css`
      width: 100%;
      height: 100%;
      padding: 2% 0 10%;
      border: none !important;
    `}
    img {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
  }
`;

export const SessionImgBox = styled.div<{ isMobile: boolean }>`
  width: 90%;
  margin: 0 auto;
  margin-bottom: 3rem;

  /* &:after {
    content: "";
    display: block;
    padding-bottom: 56.25%;
  } */

  ${(props) =>
    props.isMobile &&
    css`
      width: 100%;
    `}
`;

export const SessionTitleBox = styled.div<{ isMobile: boolean }>`
  width: 90%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;

  & > p {
    color: ${THEME.ORANGE};
    font-size: 2.4rem;
    font-weight: 600;
  }

  @media screen and (max-width: 955px) {
    flex-direction: column;

    & > p {
      color: ${THEME.ORANGE};
      font-size: 2rem;
    }
  }

  @media screen and (max-width: 820px) {
    flex-direction: row;
  }
`;

export const SessionSemiTitleBox = styled.div<{ isMobile: boolean }>`
  width: 90%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;

  & > p {
    color: ${THEME.ORANGE};
    font-size: 1.5rem;
    font-weight: 600;
  }

  @media screen and (max-width: 955px) {
    flex-direction: column;

    & > p {
      color: ${THEME.ORANGE};
      font-size: 2rem;
    }
  }

  @media screen and (max-width: 820px) {
    flex-direction: row;
  }
`;

export const SessionInfoBox = styled.p<{ isMobile: boolean }>`
  width: 90%;
  margin: 0 auto;
  word-break: keep-all;
  white-space: pre-wrap;
  font-size: 1.5rem;
  line-height: 2.5rem;
  font-weight: 600;
  margin-bottom: 5rem;
  @media screen and (min-width: 820px){
      height: 120px;
  }
`;

export const ProjectExampleWrapper = styled.div`
  width: 90%;
  margin: 0 auto;
  margin-bottom: 3rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  @media screen and (max-width: 955px) {
    flex-direction: column;
  }

  @media screen and (max-width: 820px) {
    flex-direction: row;
  }

  img {
    width: 100%;
    max-width: 100%;
    height: auto;
    aspect-ratio: 16/9;
    object-fit: cover;
  }
`;

export const ProjectTextBox = styled.p`
  font-weight: 600;
  max-width: 30.3rem;
  height: 4rem;
  margin: 0 auto;
  background-color: ${THEME.BLACK_200};
  color: ${THEME.WHITE};
  font-size: 2rem;
  line-height: 4rem;
  text-align: center;
  padding: 0px 5rem;
`;

export const SlideWrapper = styled.p`
  width: 90%;
  margin: 0 auto;
`;

export const ProjectUpdateText = styled.p`
  width: 100%;
  margin: 0 auto;
  font-size: 2.5rem;
  text-align: center;
  font-weight: 700;

  & > span {
    color: ${THEME.ORANGE};
  }
`;