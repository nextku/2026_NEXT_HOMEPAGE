import styled, { css, keyframes } from "styled-components";
import { THEME } from "styles/theme";
export const color = keyframes`
0%{
  filter: grayscale(1)
}
100%{
  filter: grayscale(0)
}
`;
export const fadeIn = keyframes`
0%{
  opacity: 0;
}
100%{
  opacity: 1;
}
`;

const popupIn = keyframes`
0% {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}
100% {
  opacity: 1;
  transform: translateY(0) scale(1);
}
`;

const rocketFloat = keyframes`
0%, 100% { transform: translateY(0) rotate(7deg); }
50% { transform: translateY(-12px) rotate(4deg); }
`;

export const RecruitPopupBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
`;

export const RecruitPopup = styled.div`
  position: relative;
  width: min(92vw, 720px);
  aspect-ratio: 720 / 430;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 28px;
  color: ${THEME.WHITE};
  background:
    radial-gradient(circle at 84% 22%, rgba(255, 106, 0, 0.25), transparent 32%),
    linear-gradient(145deg, #202020 0%, #090909 58%, #000 100%);
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.55),
    0 0 45px rgba(255, 106, 0, 0.08);
  animation: ${popupIn} 0.45s ease-out both;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #fff;
    box-shadow:
      74px 42px rgba(255, 255, 255, 0.65),
      162px 8px rgba(255, 255, 255, 0.4),
      282px 74px rgba(255, 255, 255, 0.6),
      410px 22px rgba(255, 255, 255, 0.35),
      545px 92px rgba(255, 255, 255, 0.55),
      635px 34px rgba(255, 255, 255, 0.4);
  }

  &::before {
    top: 24px;
    left: 18px;
  }
  &::after {
    bottom: 54px;
    left: 96px;
    opacity: 0.45;
  }

  @media (max-width: 600px) {
    border-radius: 16px;
  }
`;

export const RecruitPopupCanvas = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  container-type: inline-size;
`;

export const RecruitPopupGlow = styled.div`
  position: absolute;
  right: -12.5%;
  bottom: -37.2%;
  width: 59.7%;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
  border: 1px solid rgba(255, 106, 0, 0.28);
  border-radius: 50%;
  box-shadow: inset 0 0 11.11cqw rgba(255, 106, 0, 0.13);

`;

export const RecruitPopupClose = styled.button`
  position: absolute;
  top: 4.65%;
  right: 2.78%;
  z-index: 3;
  width: 5.56%;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 50%;
  color: #fff;
  background: rgba(0, 0, 0, 0.25);
  font-size: 3.61cqw;
  line-height: 1;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: rotate(8deg);
  }
  &:focus-visible {
    outline: 2px solid ${THEME.ORANGE};
    outline-offset: 3px;
  }

`;

export const RecruitPopupContent = styled.div`
  position: relative;
  z-index: 2;
  width: 67%;
  padding: 8.89cqw 0 7.22cqw 7.78cqw;

  & h2 {
    margin: 2.5cqw 0 3.89cqw;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
      "Malgun Gothic", sans-serif;
    font-size: 5.83cqw;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.04em;
    word-break: keep-all;
  }

  & h2 strong {
    color: ${THEME.ORANGE};
  }

`;

export const RecruitPopupEyebrow = styled.p`
  margin: 0;
  color: ${THEME.ORANGE};
  font-size: 1.88cqw;
  font-weight: 800;
  letter-spacing: 0.16em;

`;

export const RecruitPopupPeriod = styled.p`
  display: flex;
  align-items: center;
  gap: 1.67cqw;
  margin: 0 0 4.44cqw;
  color: rgba(255, 255, 255, 0.82);
  font-size: 2.22cqw;

  & span {
    padding: 0.69cqw 1.39cqw;
    border-radius: 999px;
    color: #fff;
    background: rgba(255, 106, 0, 0.18);
    font-size: 1.67cqw;
    font-weight: 700;
  }

`;

export const RecruitPopupButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1.39cqw;
  min-width: 26.39cqw;
  padding: 1.67cqw 2.5cqw;
  border: 0;
  border-radius: 1.67cqw;
  color: #111;
  background: ${THEME.ORANGE};
  font-size: 2.15cqw;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s,
    filter 0.2s;

  & span {
    font-size: 3.06cqw;
    transition: transform 0.2s;
  }
  &:hover {
    filter: brightness(1.08);
    transform: translateY(-2px);
  }
  &:hover span {
    transform: translateX(4px);
  }
  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 3px;
  }

`;

export const RecruitPopupRocket = styled.div`
  position: absolute;
  z-index: 1;
  right: 6.25%;
  bottom: 9.8%;
  width: 20.1%;
  filter: drop-shadow(0 2.5cqw 3.06cqw rgba(255, 106, 0, 0.28));
  animation: ${rocketFloat} 3.2s ease-in-out infinite;

`;

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: center;
  background-color: #000;
`;

export const MainContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 112px);
  margin-top: 112px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;
export const MainContainerBG = styled.img<{ isMobile: boolean }>`
  width: 100%;
  height: 100%;
  opacity: 0.7;
  object-fit: cover;
  filter: grayscale(1);
  animation: ${color} 3s 0.5s forwards;

  ${(props) =>
    props.isMobile &&
    css`
      object-fit: contain;
    `}
`;
export const MainContainerLogo = styled.div`
  width: 56%;
  & img {
    width: 100%;
  }
`;
export const MainWrapper = styled.div<{ isMobile: boolean }>`
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${(props) => (props.isMobile ? "80%" : "60%")};
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  animation: ${fadeIn} 2s 1s forwards;
`;
export const MainTextWrapper = styled.div`
  width: 100%;
  margin-bottom: 5rem;
  & img {
    min-width: 300px;
    width: 40%;
  }
  display: flex;
  justify-content: center;
`;
export const MainTextLionWrapper = styled.div`
  margin-top: 2rem;
  display: flex;
  color: white;
  font-weight: 700;
  gap: 16px;
  h2 {
    font-size: 3rem;
  }
  img {
    width: 200px;
  }
`;
export const HomeTwoTextWrapper = styled.span`
  & img {
    width: 380px;
  }
`;
export const Section1 = styled.div<{ isMobile: boolean }>`
  width: 100%;
  padding: 20rem 10%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  overflow-x: hidden;
  & div {
    width: 45%;
    color: white;
  }

  & div:last-child p {
    font-size: 2.2rem;
    margin-top: 1rem;
    line-height: 150%;
  }
  & div:last-child p:first-child {
    font-size: 3.6rem;
    font-weight: 700;
    margin-top: 1rem;
    margin-bottom: 2rem;
  }
  & div:last-child p b {
    color: ${THEME.ORANGE};
    /* font-weight: 700; */
  }
  ${(props) =>
    props.isMobile &&
    css`
      padding: 10rem 8%;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      & div {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      & div:last-child p {
        font-size: 1.8rem;
      }
      & div:last-child p:first-child {
        font-size: 3.2rem;
      }
    `}
`;
export const Section2 = styled.div`
  width: 100%;
  background-color: ${THEME.LIGHT_BLACK};
  padding: 10rem 10%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  color: white;
`;
export const TextWrapper = styled.div<{ isMobile: boolean }>`
  width: 100%;
  font-size: 2.4rem;
  word-break: keep-all;
  color: #fff;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  & p {
    line-height: 150%;
  }
  // & img {
  //     width: 47%;
  //     margin-top: 4rem;
  // }
  & > span {
    font-size: 3.6rem;
    font-weight: 600;
  }
  & span b {
    color: ${THEME.ORANGE};
  }
  ${(props) =>
    props.isMobile &&
    css`
      font-size: 1.8rem;
      & img {
        // width: 100%;
      }
      & p {
        width: 100%;
      }
    `}
`;

interface NextInlineLogoProps {
  width?: string;
  marginLeft?: string;
  marginRight?: string;
}

export const NextInlineLogo = styled.img<NextInlineLogoProps>`
  position: relative;
  top: -3px;
  width: ${({ width }) => width ?? "120px"};
  display: inline-block;
  margin-left: ${({ marginLeft }) => marginLeft ?? "10px"};
  margin-right: ${({ marginRight }) => marginRight ?? "3px"};
`;

interface NextInlineLogoProps2 {
  width?: string;
  marginLeft?: string;
  marginRight?: string;
}

export const NextInlineLogo2 = styled.img<NextInlineLogoProps2>`
  position: relative;
  top: -3px;
  width: ${({ width }) => width ?? "120px"};
  display: inline-block;
  margin-left: ${({ marginLeft }) => marginLeft ?? "10px"};
  margin-right: ${({ marginRight }) => marginRight ?? "3px"};

  @media (max-width: 820px) {
    width: 80px;
  }
`;

export const LottieContainer = styled.div<{ isMobile: boolean }>`
  width: 125%;
  display: flex;
  justify-content: space-between;
  padding: 6rem 10%;
  position: relative;
  /* background: radial-gradient(
    circle farthest-side at 50% 100%,
    rgba(255, 255, 255, 0.5),
    rgba(255, 255, 255, 0)
  ); */
  /* background: linear-gradient(); */
  ${(props) =>
    props.isMobile &&
    css`
      flex-direction: column;
      align-items: center;
    `}
`;
export const ArrowBG = styled.div<{ isMobile: boolean }>`
  width: 100%;
  height: 140%;
  background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.5));
  position: absolute;
  left: 0;
  top: 0;
  clip-path: polygon(0 0, 100% 0, 100% 50%, 50% 100%, 0 50%);
  ${(props) =>
    props.isMobile &&
    css`
      height: 110%;
    `}
`;

export const LottieWrapper = styled.div<{ isMobile: boolean }>`
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  & h2 {
    font-weight: 700;
  }
  & p {
    font-size: 1.8rem;
    line-height: 150%;
    margin: 1rem;
  }
  ${(props) =>
    props.isMobile &&
    css`
      width: 80%;
      margin-bottom: 6rem;
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
  color: ${THEME.WHITE};
  transition: 0.5s;
  ${(props) =>
    !props.isMobile &&
    css`
      &:hover {
        /* background-color: ${THEME.LIGHT_ORANGE}; */
        border-bottom: 1px solid ${THEME.WHITE};
      }
    `}
`;

export const PartnerContainer = styled.div<{ isMobile: boolean }>`
  width: 100%;
  padding: 5rem;
  background: white;
  border-radius: 5rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  & div {
    width: 20%;
    margin: 2rem;
  }
  & div img {
    width: 100%;
    min-height: 140px;
    object-fit: contain;
  }
  ${(props) =>
    props.isMobile &&
    css`
      padding: 2rem;
      & div {
        width: 40%;
        margin: 1rem;
      }
    `}
`;

export const Footer = styled.footer<{ isMobile: boolean }>`
  width: 100%;
  background: #000;
  color: #fff;
  padding: 4rem 10% 3rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
  & h3 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }
  & p {
    margin: 0;
    font-size: 1.4rem;
    line-height: 1.8;
    font-weight: 500;
  }
  ${(props) =>
    props.isMobile &&
    css`
      padding: 3rem 8%;
      & h3 {
        font-size: 1.6rem;
      }
      & p {
        font-size: 1.2rem;
      }
    `}
`;

export const FooterCopyright = styled.p`
  align-self: flex-end;
  margin-top: 1rem !important;
  font-size: 1.2rem !important;
  opacity: 0.9;
`;
