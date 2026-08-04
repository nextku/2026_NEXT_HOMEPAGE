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
  box-sizing: border-box;
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
  /*
   * Keep the 720:430 artwork inside both viewport axes. The vh term is the
   * available height (minus the backdrop padding) converted to that ratio.
   */
  width: min(
    92vw,
    calc(100vw - 4rem),
    calc(167.4419vh - 6.6977rem),
    720px
  );
  aspect-ratio: 720 / 430;
  flex: 0 0 auto;
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

  &,
  & * {
    box-sizing: border-box;
  }

  @supports (height: 100dvh) {
    width: min(
      92vw,
      calc(100vw - 4rem),
      calc(167.4419dvh - 6.6977rem),
      720px
    );
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    /* 고정 px 좌표라 카드 크기가 바뀌어도 안 따라가고, 12개가 너무 또렷해
       배경이 산만했다. 개수를 줄이고 농도를 크게 낮춘다. */
    background: rgba(255, 255, 255, 0.18);
    box-shadow:
      162px 8px rgba(255, 255, 255, 0.14),
      410px 22px rgba(255, 255, 255, 0.1),
      635px 34px rgba(255, 255, 255, 0.12);
  }

  &::before {
    top: 24px;
    left: 18px;
  }
  &::after {
    bottom: 54px;
    left: 96px;
    opacity: 0.35;
  }

  /* 모바일: 720:430 고정 비율을 풀고 내용 높이에 맞춘다.
     비율을 유지한 채 폭만 줄이면 글자와 여백이 통째로 축소돼
     '데스크톱 화면을 작게 넣은' 느낌이 된다. */
  @media (max-width: 640px) {
    width: min(100%, calc(100vw - 2.4rem));
    aspect-ratio: auto;
    border-radius: 18px;
  }
`;

export const RecruitPopupCanvas = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  container-type: inline-size;

  /* 모바일에서는 로켓을 절대배치에서 빼내 본문 위로 올린다.
     같은 요소를 재배치하는 것이 '작게 줄이는' 것과의 차이다. */
  @media (max-width: 640px) {
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
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
  /* 워드마크가 글자 'NEXT' 보다 넓어 헤드라인이 3줄로 늘어났고,
     카드 높이가 720:430 으로 고정이라 늘어난 줄이 아래 여백을 먹었다.
     본문 폭을 넓히고 글자를 조금 줄여 2줄로 되돌린다.

     위아래 여백은 고정값으로 주지 않는다. 문구가 한 줄만 늘어도 다시 어긋난다.
     내용 덩어리를 세로 중앙에 두면 위아래가 항상 같아진다. */
  width: 72%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* flex 자식은 기본으로 가로로 늘어난다. 버튼이 본문 폭을 통째로
     차지하지 않도록 내용 크기만큼만 잡는다. */
  align-items: flex-start;
  padding: 6cqw 0 6cqw 7.78cqw;

  /* 모바일: 폭을 다 쓰고 크기는 cqw 가 아니라 px 로 고정한다.
     cqw 를 그대로 두면 카드가 좁아질 때 글자까지 같이 작아진다. */
  @media (max-width: 640px) {
    width: 100%;
    height: auto;
    display: block;
    padding: 20px 20px 24px;
  }

  & h2 {
    margin: 2.5cqw 0 3.89cqw;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
      "Malgun Gothic", sans-serif;
    font-size: 5.2cqw;
    font-weight: 700;
    line-height: 1.34;
    letter-spacing: -0.04em;
    word-break: keep-all;
  }

  & h2 strong {
    color: ${THEME.ORANGE};
  }

  @media (max-width: 640px) {
    & h2 {
      margin: 10px 0 16px;
      font-size: clamp(21px, 6.2vw, 27px);
      line-height: 1.34;
    }
  }
`;

export const RecruitPopupEyebrow = styled.p`
  /* 이전: 오렌지 + 자간 0.16em + 1.88cqw(390px 폰에서 6.7px).
     작고 자간 넓은 컬러 라벨은 어디서나 보이는 흔한 패턴이라 눈에 띄게 인위적이다.
     색을 빼고 자간을 되돌리고 읽히는 크기로 고정한다. */
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: clamp(13px, 1.6cqw, 16px);
  font-weight: 500;
  letter-spacing: -0.02em;

  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

/**
 * 팝업 헤드라인 안에 들어가는 워드마크.
 *
 * 기존에는 "NEXT" 를 오렌지 텍스트로만 썼는데, 실제 로고를 넣으면 X 자리의
 * 로켓까지 살아나 브랜드가 정확해진다.
 *
 * 크기를 px 로 고정하면 데스크톱(cqw)과 모바일(clamp)에서 글자와 어긋난다.
 * em 으로 잡아 주변 글자 크기를 그대로 따라가게 한다.
 */
export const RecruitPopupWordmark = styled.img`
  display: inline-block;
  /* 워드마크가 흰색이라 주변 한글과 색이 같다. 색으로 강조할 수 없으니
     한글 글자 높이보다 확실히 크게 잡아 '마크'로 읽히게 한다. */
  height: 0.95em;
  width: auto;
  vertical-align: baseline;
  position: relative;
  top: 0.115em;
  margin: 0 0.12em 0 0.06em;
`;

export const RecruitPopupPeriod = styled.p`
  display: flex;
  align-items: center;
  gap: 1.67cqw;
  margin: 0 0 4.44cqw;
  color: rgba(255, 255, 255, 0.82);
  font-size: 2.22cqw;

  /* 반투명 오렌지 알약 배지였다. 정보 가치는 없는데 시선만 끌고,
     어디서나 보이는 패턴이라 인위적으로 읽힌다.
     배경을 걷고 라벨은 연하게, 날짜를 주인공으로 둔다. */
  & span {
    padding: 0;
    border-radius: 0;
    background: none;
    color: rgba(255, 255, 255, 0.45);
    font-size: inherit;
    font-weight: 500;
  }

  @media (max-width: 640px) {
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
    font-size: 14px;

    & span {
      padding: 0;
      font-size: inherit;
    }
  }
`;

export const RecruitPopupButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 라벨 15.5px 에 화살표 22px 이라 화살표가 주인공처럼 보였고,
     min-width 가 내용보다 넓어 안쪽이 헐렁했다. 내용에 맞춰 조인다. */
  gap: 1.1cqw;
  padding: 2.15cqw 3.7cqw;
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

  & svg {
    /* 텍스트 글리프 → 는 굵은 한글 옆에서 얇고 어색하다.
       획 두께를 글자에 맞출 수 있는 SVG 로 그린다. */
    width: 1.05em;
    height: 1.05em;
    flex: 0 0 auto;
    transition: transform 0.2s;
  }
  &:hover {
    filter: brightness(1.08);
    transform: translateY(-2px);
  }
  &:hover svg {
    transform: translateX(4px);
  }
  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 3px;
  }

  @media (max-width: 640px) {
    width: 100%;
    min-width: 0;
    min-height: 48px; /* 손가락은 커서보다 무디다 */
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 16px;
    gap: 8px;

    & svg {
      width: 18px;
      height: 18px;
    }
  }
`;

export const RecruitPopupRocket = styled.div`
  position: absolute;
  z-index: 1;
  right: 6.25%;
  bottom: 9.8%;
  width: 20.1%;
  height: 58%;
  filter: drop-shadow(0 2.5cqw 3.06cqw rgba(255, 106, 0, 0.28));
  animation: ${rocketFloat} 3.2s ease-in-out infinite;

  & > span {
    position: relative !important;
    display: block !important;
    width: 100% !important;
    height: 100% !important;
  }

  & img {
    object-fit: contain;
  }

  /* 모바일: 절대배치를 풀고 본문 위 정중앙으로 올린다 */
  @media (max-width: 640px) {
    position: static;
    order: -1;
    width: 96px;
    height: 116px;
    margin: 22px auto 0;
    filter: drop-shadow(0 12px 20px rgba(255, 106, 0, 0.3));
  }
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
  /* 워드마크 박스를 로고 실제 비율(4.43:1)로 잡으면서 세로가 납작해졌다.
     5rem 그대로 두면 세 요소가 뿔뿔이 떨어져 보인다. */
  margin-bottom: 3.8rem;
  & img {
    min-width: 300px;
    width: 40%;
  }
  display: flex;
  justify-content: center;
`;
export const MainTextLionWrapper = styled.div`
  margin-top: 2.4rem;
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
  /* 흰색 50% 삼각형이 Session/Project/Demoday 라벨 위를 덮어 글씨가 안 읽혔다.
     브랜드 오렌지의 아주 옅은 농도로 낮추고 콘텐츠 뒤로 보낸다. */
  background: linear-gradient(rgba(247, 148, 30, 0), rgba(247, 148, 30, 0.12));
  position: absolute;
  left: 0;
  top: 0;
  z-index: 0;
  pointer-events: none;
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
  position: relative;
  z-index: 1; /* ArrowBG 위로 */

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

export const FooterContacts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const FooterCopyright = styled.p`
  align-self: flex-end;
  margin-top: 1rem !important;
  font-size: 1.2rem !important;
  opacity: 0.9;
`;

/* ------------------------------------------------------------------ */
/* 히어로 워드마크 — 입자로 그리는 NEXT                                  */
/* 기존 MainContainerLogo 자리를 대체한다. 나머지 섹션은 그대로 둔다.      */
/* ------------------------------------------------------------------ */

export const ParticleMark = styled.div`
  /* 로고 원본이 7789 x 1757 이라 정확히 그 비율로 박스를 잡는다.
     비율이 안 맞으면 캔버스 안에 위아래 빈 공간이 생겨
     'Accelerate Your Potential' 과 '고려대학교' 사이가 벌어진다. */
  width: 61%;
  aspect-ratio: 7789 / 1757;
  position: relative;
  cursor: crosshair;
  touch-action: pan-y; /* 세로 스크롤은 살리고 가로 제스처만 캔버스가 받는다 */

  /* aspect-ratio 는 내용물의 자동 최소 높이를 이기지 못한다.
     캔버스가 흐름 안에 있으면 자기 높이(168px)로 박스를 밀어올려
     비율이 무시되고 위아래 빈 공간이 생긴다. 흐름에서 빼낸다. */
  & > div {
    position: absolute;
    inset: 0;
  }

  & canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* 좁은 화면에서는 폭을 더 넓혀 글자가 작아지지 않게 한다 */
  @media (max-width: 820px) {
    width: 80%;
  }
`;

/* 화면에는 안 보이지만 스크린리더와 검색엔진에는 읽히는 실제 제목.
   캔버스에는 텍스트가 없으므로 이게 없으면 페이지에 h1 이 사라진다. */
export const VisuallyHidden = styled.h1`
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
