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
  width: min(92vw, calc(100vw - 4rem), calc(167.4419vh - 6.6977rem), 720px);
  aspect-ratio: 720 / 430;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 28px;
  color: ${THEME.WHITE};
  background:
    radial-gradient(
      circle at 84% 22%,
      rgba(255, 106, 0, 0.25),
      transparent 32%
    ),
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
    width: min(92vw, calc(100vw - 4rem), calc(167.4419dvh - 6.6977rem), 720px);
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
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Apple SD Gothic Neo",
      "Malgun Gothic",
      sans-serif;
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

  /* 유리 질감.
     오렌지를 살짝 뚫어 뒤 카드가 배어 나오게 하고, 위에서 빛이 떨어진 것처럼
     흰 그라디언트를 얹는다. 색을 통째로 반투명하게만 두면 CTA 가 흐려지므로
     불투명도는 0.88 까지만 내리고 나머지는 하이라이트로 만든다. */
  background:
    linear-gradient(
      152deg,
      rgba(255, 255, 255, 0.42) 0%,
      rgba(255, 255, 255, 0.08) 38%,
      rgba(255, 255, 255, 0) 62%
    ),
    rgba(247, 148, 30, 0.88);
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  /* 테두리 대신 안쪽 링. border 를 새로 주면 버튼 크기가 1px 씩 밀린다.
     위는 밝게, 아래는 어둡게 해서 두께가 있는 유리처럼 보이게 한다. */
  /*
     그림자에 오렌지를 섞지 않는다. 버튼 색이 주변으로 번지면 발광하는 것처럼
     보이고, 그 인상이 곧 '만들어낸 티' 로 읽힌다. 실제 물체의 그림자는 그
     물체의 색이 아니라 바닥의 어두움이다. 검정으로 아래에 떨어뜨리고,
     두께는 안쪽 링이 만든다.
  */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    inset 0 0 0 1px rgba(255, 255, 255, 0.18),
    inset 0 -1px 0 rgba(0, 0, 0, 0.18),
    0 0.28cqw 0.7cqw rgba(0, 0, 0, 0.38),
    0 1.1cqw 2.4cqw rgba(0, 0, 0, 0.34);
  font-size: 2.15cqw;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s,
    filter 0.2s,
    box-shadow 0.2s;

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
    /* 떠오른 만큼 아래 빛도 넓어져야 들린 것처럼 보인다. */
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.66),
      inset 0 0 0 1px rgba(255, 255, 255, 0.24),
      inset 0 -1px 0 rgba(0, 0, 0, 0.18),
      0 0.42cqw 1cqw rgba(0, 0, 0, 0.4),
      0 1.8cqw 3.4cqw rgba(0, 0, 0, 0.38);
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
    /* cqw 그림자는 모바일에서 컨테이너 폭을 따라 과하게 번진다. px 로 고정한다. */
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.55),
      inset 0 0 0 1px rgba(255, 255, 255, 0.18),
      inset 0 -1px 0 rgba(0, 0, 0, 0.18),
      0 2px 5px rgba(0, 0, 0, 0.38),
      0 8px 20px rgba(0, 0, 0, 0.34);

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

/**
 * 홈 전체를 감싸는 껍데기.
 *
 * 본문은 마운트 뒤에야 그려지므로 그 전에는 푸터만 남는다. 세로 flex 로 두고
 * 아래로 밀어 두면 그 사이에도 검은 화면 아래에 푸터가 있는 모습이 되어,
 * 흰 바탕에 푸터만 떠 있는 상태를 피한다. 본문이 그려지면 100vh 를 넘기므로
 * 정렬은 저절로 무의미해진다.
 */
export const PageShell = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 100dvh;
  background-color: #000;
`;

/**
 * 본문이 그려지기 전에 잠깐 보이는 자리.
 *
 * 두 가지 일을 한다. 사용자에게는 검은 화면 대신 학회 이름이 보이고,
 * 자바스크립트를 실행하지 않는 크롤러에게는 이 페이지가 무엇인지 알려준다.
 * 아래 본문(Section1)에 있는 문장과 같은 내용이라 서로 어긋나지 않는다.
 *
 * 구글 OAuth 심사가 "홈페이지에 앱의 목적 설명이 없다" 로 본 것이 이 지점이다.
 * 설명은 있었지만 마운트 뒤에야 그려져서 HTML 에는 없었다.
 */
export const Booting = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(3rem, 8vw, 10rem) clamp(2.4rem, 8vw, 10rem);
  color: #fff;

  & h1 {
    margin: 0 0 1.4rem;
    font-size: clamp(2rem, 3vw, 2.8rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.3;
  }
  & p {
    margin: 0 0 0.8rem;
    max-width: 46ch;
    font-size: clamp(1.5rem, 1.7vw, 1.7rem);
    line-height: 1.75;
    letter-spacing: -0.025em;
    color: rgba(255, 255, 255, 0.62);
    word-break: keep-all;
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
  /*
   * 100vh - 112px 에 margin-top: 112px 조합이라 모바일에서 헤더 높이(약 60px)와
   * 어긋나 위아래 여백이 맞지 않았다. 화면 전체를 쓰고 내용은 가운데에 둔다.
   * iOS 는 100vh 가 주소창을 포함해 잘리므로 dvh 를 함께 쓴다.
   */
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  margin-top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
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
  /* 본문 강조는 색이 아니라 굵기로. 오렌지는 누를 수 있는 것에만 남긴다. */
  & div:last-child p b {
    color: #ffffff;
    font-weight: 700;
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
  /*
   * #1b1b1b 은 검정(#000)과 차이가 작아 '띠를 깔다 만' 것처럼 보였다.
   * 배경을 걷고 간격으로만 나눈다.
   */
  width: 100%;
  background-color: transparent;
  padding: clamp(6rem, 10vw, 11rem) clamp(2.4rem, 8vw, 10rem);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  color: white;
`;
export const TextWrapper = styled.div<{ isMobile: boolean }>`
  /*
   * 섹션 제목이 오렌지 + 가운데 정렬이라 홈만 다른 문법을 쓰고 있었다.
   * 다른 페이지는 이미 흰/검정 + 왼쪽 정렬이라 홈에 들어오면 톤이 튄다.
   * 색으로 만든 위계를 크기와 굵기로 옮긴다.
   */
  width: 100%;
  max-width: 132rem;
  margin: 0 auto;
  word-break: keep-all;
  color: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;

  & > span {
    font-size: clamp(2.6rem, 4vw, 4.2rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.2;
  }
  & span b {
    color: #ffffff;
    font-weight: inherit;
  }
  & p {
    font-size: clamp(1.6rem, 1.8vw, 1.9rem);
    line-height: 1.75;
    letter-spacing: -0.025em;
    color: rgba(255, 255, 255, 0.62);
    margin-top: 1.4rem;
  }
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
  /*
   * width: 125% 라 부모보다 넓어져 화면 밖으로 55px 삐져나오고 가로 스크롤이 생겼다.
   * 세 항목을 고른 격자로 두면 폭을 넘길 이유가 없다.
   */
  width: 100%;
  max-width: 116rem;
  margin: 0 auto;
  padding: clamp(3.2rem, 5vw, 6rem) 0;
  position: relative;

  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(2rem, 3vw, 4rem);
  align-items: start;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    justify-items: center;
  }
`;
/**
 * '창업' 마무리 블록.
 * LottieWrapper 를 그대로 재사용하면 세 항목용으로 잡은 최소 높이가 걸려
 * 로켓 아래에 큰 빈 공간이 생긴다. 이 블록만 높이를 내용에 맡긴다.
 */
export const FinaleWrapper = styled.div`
  width: 100%;
  max-width: 116rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;

  & > div:first-child {
    width: auto;
    min-height: 0;
  }
  & > div:first-child svg,
  & > div:first-child canvas {
    max-height: clamp(14rem, 18vw, 20rem);
    width: auto;
  }

  & p {
    margin-top: 1.2rem;
    font-size: clamp(1.45rem, 1.6vw, 1.6rem);
    letter-spacing: -0.025em;
    color: rgba(255, 255, 255, 0.62);
  }
  & h2 {
    margin-top: 0.6rem;
    font-size: clamp(2.4rem, 3.4vw, 3.4rem) !important;
    font-weight: 800;
    letter-spacing: -0.035em;
    color: #ffffff;
  }
`;

export const ArrowBG = styled.div<{ isMobile: boolean }>`
  /*
   * 부모(LottieContainer)가 max-width: 116rem 으로 좁아지면서 삼각형이
   * 그 폭에 갇혀 좌우가 잘렸다. 화면 폭 전체로 펴서 꼭짓점이 살아 있게 한다.
   */
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  /* 화면 폭을 의도적으로 쓰지만 스크롤바만큼 넘치지 않게 실제 폭을 쓴다 */
  width: 100%;
  max-width: 100vw;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(rgba(247, 148, 30, 0), rgba(247, 148, 30, 0.1));
  clip-path: polygon(0 0, 100% 0, 100% 50%, 50% 100%, 0 50%);

  /*
   * 모바일에서는 세 항목이 세로로 쌓여 섹션이 길어지는데, 삼각형이 그 높이를
   * 그대로 따라가며 아래쪽에 검정 구간을 크게 만든다. 좁은 화면에서는 뺀다.
   */
  @media (max-width: 820px) {
    display: none;
  }
`;

export const LottieWrapper = styled.div<{ isMobile: boolean }>`
  /*
   * 로티마다 원본 여백이 달라 그대로 두면 아래 라벨이 계단처럼 어긋난다.
   * 그림 영역 높이를 고정해 세 항목의 제목이 같은 선에서 시작하게 한다.
   */
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;

  /*
   * 로티마다 감싸는 DOM 구조가 달라 특정 자식을 지정하면 어떤 건 뭉개진다.
   * 높이를 강제하지 않고 최소 높이만 확보해 라벨 줄을 맞춘다.
   */
  & > div:first-child {
    width: 100%;
    min-height: clamp(16rem, 20vw, 22rem);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  & > div:first-child svg,
  & > div:first-child canvas {
    max-height: clamp(16rem, 20vw, 22rem);
    width: auto;
  }

  & h2 {
    margin-top: 1.6rem;
    font-size: clamp(1.7rem, 2vw, 2rem);
    font-weight: 750;
    letter-spacing: -0.03em;
    color: #ffffff;
  }
  & p {
    margin-top: 0.8rem;
    font-size: clamp(1.45rem, 1.6vw, 1.6rem);
    line-height: 1.6;
    letter-spacing: -0.025em;
    color: rgba(255, 255, 255, 0.62);
  }
`;

export const MoreBtn = styled.div<{ isMobile: boolean }>`
  /* '>>' 는 텍스트 기호라 폰트마다 모양이 달라진다. 화살표는 SVG 로 그린다. */
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  min-height: 4.4rem;
  padding: 0 0.2rem;
  cursor: pointer;
  color: ${THEME.WHITE};
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: -0.025em;

  & span:first-child {
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.32);
    transition: box-shadow 0.18s ease;
  }
  & svg {
    width: 1.6rem;
    height: 1.6rem;
    transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (any-hover: hover) {
    &:hover span:first-child {
      box-shadow: inset 0 -1px 0 ${THEME.ORANGE};
    }
    &:hover svg {
      transform: translateX(4px);
    }
  }
`;

export const PartnerContainer = styled.div<{ isMobile: boolean }>`
  /*
   * 이전에는 로고를 20% 폭 flex 로 늘어놓아 원본 비율에 따라 크기가 요동쳤고
   * 마지막 줄이 어색하게 남았다. 같은 크기의 칸을 주고 그 안에서 맞춘다.
   */
  width: 100%;
  max-width: 116rem;
  margin: 0 auto;
  padding: clamp(3.2rem, 5vw, 5.6rem) clamp(2.4rem, 4vw, 4.8rem);
  background: #fff;
  border-radius: 24px;
  @supports (corner-shape: squircle) {
    corner-shape: squircle;
    border-radius: 34px;
  }

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(2.4rem, 3.5vw, 4rem) clamp(2rem, 3vw, 3.2rem);
  align-items: center;
  justify-items: center;

  @media (min-width: 36rem) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (min-width: 56rem) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (min-width: 76rem) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  & div {
    width: 100%;
    max-width: 15rem;
    margin: 0;
    aspect-ratio: 3 / 2;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  & div img {
    width: 100%;
    height: 100%;
    min-height: 0;
    object-fit: contain;
  }
`;

/**
 * 푸터
 *
 * 문구는 기존 다섯 줄 그대로 두고 구조만 바꾼다.
 * 위쪽은 학회 정보와 연락처를 두 단으로, 아래쪽은 얇은 선으로 나눠
 * 저작권과 소셜을 양 끝에 붙인다. 모바일에서는 한 단으로 쌓인다.
 */
export const Footer = styled.footer<{ isMobile?: boolean }>`
  width: 100%;
  background: #000;
  color: #fff;
  padding: clamp(4rem, 6vw, 6.4rem) clamp(2.4rem, 8vw, 10rem)
    max(clamp(3rem, 4vw, 4rem), env(safe-area-inset-bottom));

  & h3 {
    margin: 0;
    font-size: clamp(1.7rem, 2vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.03em;
  }
  & p {
    margin: 0;
    font-size: 1.5rem;
    line-height: 1.7;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.62);
  }
  & a {
    color: inherit;
    /* 긴 이메일이 좁은 화면에서 컨테이너를 뚫지 않게 */
    overflow-wrap: anywhere;
  }
  @media (any-hover: hover) {
    & a:hover {
      color: #ffffff;
    }
  }
`;

export const FooterTop = styled.div`
  display: grid;
  gap: clamp(2.4rem, 4vw, 4rem);
  padding-bottom: clamp(2.8rem, 4vw, 4rem);

  /* 넓어지면 학회 정보와 연락처를 좌우로 나눈다 */
  @media (min-width: 48rem) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
  }
`;
export const FooterContacts = styled.div`
  display: grid;
  gap: 0.4rem;

  & p {
    /* 번호가 세로로 겹칠 때 자릿수가 흔들리지 않게 */
    font-variant-numeric: tabular-nums;
  }

  @media (min-width: 48rem) {
    justify-items: end;
    text-align: right;
  }
`;

export const FooterBottom = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  padding-top: clamp(2rem, 3vw, 2.8rem);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
`;

export const FooterSocials = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;

  & a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* 손가락으로 누를 수 있는 최소 크기 */
    width: 4.4rem;
    height: 4.4rem;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.62);
    transition:
      background 0.16s ease,
      color 0.16s ease;
  }
  & a svg {
    width: 2rem;
    height: 2rem;
  }
  @media (any-hover: hover) {
    & a:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
  }
  & a:focus-visible {
    outline: 2px solid ${THEME.ORANGE};
    outline-offset: 2px;
  }
`;

export const FooterCopyright = styled.p`
  margin: 0 !important;
  font-size: 1.3rem !important;
  color: rgba(255, 255, 255, 0.4) !important;
  font-variant-numeric: tabular-nums;
`;

/** 저작권 표기와 약관 링크를 한 덩어리로 묶는다. 좁아지면 아래로 접힌다. */
export const FooterMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem 1.6rem;
`;

export const FooterLegal = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.4rem;

  & a {
    font-size: 1.3rem;
    font-weight: 500;
    letter-spacing: -0.025em;
    color: rgba(255, 255, 255, 0.4);
    transition: color 0.16s ease;
  }
  /* 두 링크 사이 구분은 점 하나로 충분하다 */
  & a + a::before {
    content: "";
    display: inline-block;
    width: 2px;
    height: 2px;
    margin-right: 1.4rem;
    vertical-align: 0.4em;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.24);
  }
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
