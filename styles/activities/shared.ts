import styled, { css } from "styled-components";
import { squircle, lift, liftHover } from "styles/surface";

/**
 * ACTIVITIES 탭 공통 레이아웃
 *
 * 다섯 탭이 각자 다른 문법을 쓰고 있었다. 정렬(왼쪽/가운데), 제목 색(검정/오렌지),
 * 구분 방식(세로선/여백), 모서리(각짐/라운드)가 탭마다 달라 같은 페이지로 읽히지 않았다.
 *
 * Why NEXT 를 기준으로 맞춘다.
 * - 왼쪽 정렬. 가운데 정렬은 한 줄짜리 문구에만 어울리고 목록에는 축이 사라진다.
 * - 제목은 검정. 오렌지 제목은 색으로 위계를 만드는 방식이라 어디서나 보이는 패턴이고,
 *   페이지에 오렌지가 여러 개면 무엇이 중요한지 오히려 흐려진다. 크기와 굵기로 나눈다.
 * - 세로 구분선을 긋지 않는다. 간격이 그 역할을 한다.
 * - 이미지는 전부 같은 모서리와 그림자를 쓴다.
 */

export const Section = styled.section`
  width: 100%;
  max-width: 132rem;
  margin: 0 auto;
  padding: clamp(3.2rem, 6vw, 7.2rem) clamp(2rem, 5vw, 6rem)
    clamp(6rem, 10vw, 12rem);
`;

/**
 * 연혁 전용 섹션.
 *
 * 연혁은 연도 열 때문에 왼쪽에 여백이 필요 없고, 목록이 길어 폭을 좁혀야
 * 한 줄이 너무 길어지지 않는다. 제목과 목록이 같은 축에서 시작하도록
 * 섹션 자체를 좁혀 가운데에 둔다. 다른 탭은 영향받지 않는다.
 */
export const SectionTimeline = styled(Section)`
  max-width: 104rem;
`;

/**
 * 옆에 이미지가 없는 글 전용 섹션.
 * 글 덩어리를 화면 가운데에 두어 좌우 여백이 같아지게 한다.
 */
export const SectionNarrow = styled(Section)`
  max-width: 86rem;
`;

/** 탭 맨 위에 오는 제목과 한 줄 설명. 모든 탭이 같은 형태로 시작한다. */
export const Intro = styled.div`
  max-width: 52rem;
  margin-bottom: clamp(4rem, 6vw, 7rem);

  & h2 {
    margin: 0 0 1.2rem;
    font-size: clamp(2.4rem, 3.4vw, 3.6rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.25;
    color: #17150f;
    text-wrap: balance;
  }
  & p {
    margin: 0;
    font-size: clamp(1.5rem, 1.6vw, 1.7rem);
    line-height: 1.75;
    letter-spacing: -0.025em;
    color: #7d766c;
    word-break: keep-all;
  }
  & a {
    color: #17150f;
    font-weight: 600;
    box-shadow: inset 0 -1px 0 #cfc8bc;
    overflow-wrap: anywhere;
  }
  @media (any-hover: hover) {
    & a:hover {
      box-shadow: inset 0 -1px 0 #f7941e;
    }
  }
`;


/** 항목 목록. 세로 간격만으로 나눈다. */
export const List = styled.div`
  display: grid;
  gap: clamp(4.8rem, 7vw, 8rem);
  /* 92rem 은 넓은 화면에서 왼쪽에 치우쳐 보였다. 폭을 넓히고 가운데 정렬한다. */
  max-width: 118rem;
  margin-inline: auto;
  width: 100%;
  /* grid 자식도 같은 이유로 폭이 밀린다 */
  > * {
    min-width: 0;
  }
`;

/** 나란히 두는 항목들(세션 2개, 프로젝트 2개). 좁으면 자동으로 쌓인다. */
export const Row = styled.div`
  display: grid;
  gap: clamp(3.2rem, 5vw, 5.6rem);

  > * {
    min-width: 0;
  }

  @media (min-width: 56rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
`;

/**
 * 항목 하나.
 *
 * Why NEXT 와 같은 문법 — 넓은 화면에서 이미지와 글을 좌우로 나누고,
 * 순서대로 좌우를 바꿔 읽는 리듬을 만든다. 좁아지면 글이 위, 이미지가 아래로 쌓인다.
 */
export const Item = styled.article<{ $flip?: boolean }>`
  display: flex;
  flex-direction: column;
  /* flex/grid 자식은 기본이 min-width: auto 라 내용이 넓으면 컨테이너를 밀어낸다.
     slick 은 트랙 폭을 부모 기준으로 재계산하므로 이게 없으면 폭이 폭주한다. */
  min-width: 0;

  @media (min-width: 60rem) {
    display: grid;
    grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
    align-items: center;
    gap: clamp(3.2rem, 5vw, 6.4rem);

    ${({ $flip }) =>
      $flip &&
      css`
        direction: rtl;
        > * {
          direction: ltr;
        }
      `}
  }
`;

/** 이미지 옆에 오는 글 묶음. 좁은 화면에서는 이미지 위로 온다. */
export const Copy = styled.div`
  /* 좁은 화면: 글이 먼저, 이미지가 아래. 넓은 화면: grid 가 자리를 정한다. */
  order: -1;
  margin-bottom: 1.8rem;
  min-width: 0;

  @media (min-width: 60rem) {
    order: 0;
    margin-bottom: 0;
    /* 글 묶음이 셀 하나를 통째로 쓴다. 이게 없으면 제목만 옆에 붙고
       본문이 아래로 흘러내린다. */
    grid-column: auto;
    align-self: center;
  }
`;

export const Media = styled.div<{ $ratio?: string }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${({ $ratio }) => $ratio ?? "16 / 10"};
  overflow: hidden;
  background: #f4f1ea;
  ${squircle(20)}
  ${lift}
  transition: box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (any-hover: hover) {
    ${Item}:hover & {
      ${liftHover}
    }
  }
`;

/**
 * 슬라이더를 담는 표면.
 *
 * Media 는 next/image 의 fill 을 전제로 aspect-ratio + absolute 자식 구조다.
 * 슬라이더(react-slick)는 일반 흐름 요소라 그 안에 넣으면 높이를 못 잡고 빈 칸이 된다.
 * 모서리와 그림자는 같게 쓰되 높이는 내용이 정하게 둔다.
 */
export const MediaSlider = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  background: #f4f1ea;
  ${squircle(20)}
  ${lift}
  transition: box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);

  @media (any-hover: hover) {
    ${Item}:hover & {
      ${liftHover}
    }
  }

  & img {
    display: block;
    width: 100%;
    height: auto;
  }

  /* slick 은 .slick-list 에 기본 여백이 있어 카드 아래가 비어 보인다. */
  .slick-slider,
  .slick-list,
  .slick-track {
    margin: 0;
    line-height: 0;
  }
  .slick-dots {
    margin: 0;
    padding: 0;
  }
`;

/**
 * 단독으로 놓이는 큰 이미지(커리큘럼 인포그래픽).
 *
 * 옆에 글이 없으므로 2단 격자에 넣을 이유가 없다. 격자에 넣으면 한 칸에 갇혀
 * 글자 많은 인포그래픽이 읽을 수 없게 작아진다. 가운데에 크게 둔다.
 */
export const MediaSolo = styled(Media)`
  max-width: 86rem;
  margin-inline: auto;
`;

/** 제목 줄. 이름과 시간·시기를 한 줄에 두되 무게를 나눈다. */
export const Title = styled.h3`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin: 0 0 0.9rem;
  font-size: clamp(1.9rem, 2.2vw, 2.3rem);
  font-weight: 750;
  letter-spacing: -0.035em;
  color: #17150f;

  /* 기간·요일 같은 부가 정보. 제목보다 작고 연하게. */
  & small {
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: #8d877f;
    font-variant-numeric: tabular-nums;
  }
`;

export const Body = styled.p`
  margin: 0;
  font-size: clamp(1.45rem, 1.5vw, 1.6rem);
  line-height: 1.8;
  letter-spacing: -0.025em;
  color: #7d766c;
  word-break: keep-all;
  max-width: 38ch;

  & b {
    color: #17150f;
    font-weight: 700;
  }
`;


/* ------------------------------------------------------------------ */
/* VC 로고 마퀴                                                         */
/* ------------------------------------------------------------------ */

/**
 * 데모데이 심사에 참여한 투자사들.
 *
 * 격자로 늘어놓으면 마지막 줄이 어색하게 남고 개수가 바뀔 때마다 깨진다.
 * 한 줄로 흐르게 두면 개수와 무관하고, 멈춰 있는 목록보다 "계속 이어진다" 는
 * 인상을 준다. 목록을 두 번 그리고 정확히 절반만 이동시켜 이음새를 없앤다.
 */
export const VcBand = styled.div`
  margin-top: clamp(4rem, 6vw, 6.4rem);
  padding-top: clamp(2.8rem, 4vw, 4rem);
  border-top: 1px solid #e7e2d8;
`;


export const VcTrack = styled.div`
  display: flex;
  width: max-content;
  align-items: center;
  gap: clamp(4rem, 6vw, 7.2rem);
  animation: nextVcMarquee 34s linear infinite;

  @keyframes nextVcMarquee {
    from {
      transform: translate3d(0, 0, 0);
    }
    to {
      transform: translate3d(-50%, 0, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const VcMarquee = styled.div`
  position: relative;
  overflow: hidden;

  /* 양 끝을 배경색으로 페이드시켜 잘린 느낌을 없앤다 */
  --fade: 3rem;
  @media (min-width: 48rem) {
    --fade: 8rem;
  }
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    #000 var(--fade),
    #000 calc(100% - var(--fade)),
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0,
    #000 var(--fade),
    #000 calc(100% - var(--fade)),
    transparent 100%
  );

  /* 포인터가 있는 환경에서만 멈춘다. 터치에서는 hover 가 고착돼 멈춘 채 남는다. */
  @media (any-hover: hover) {
    &:hover ${VcTrack} {
      animation-play-state: paused;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

export const VcLogo = styled.div<{ $scale?: number }>`
  position: relative;
  flex: 0 0 auto;
  width: clamp(8rem, 12vw, 11rem);
  aspect-ratio: 5 / 2;

  & img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    /*
     * 로고 파일마다 원본 비율이 1.0 부터 4.8 까지 제각각이고 파일 안에 여백이
     * 들어 있는 것도 있다. contain 으로 맞추면 정사각형에 가까운 로고(ZUZU 2.0,
     * Strong Ventures 1.0)가 높이에 갇혀 작게 보인다. 파일별로 배율을 보정한다.
     */
    transform: scale(${({ $scale }) => $scale ?? 1});
  }
`;

/* ------------------------------------------------------------------ */
/* ABOUT 전용                                                          */
/* ------------------------------------------------------------------ */

/**
 * 인사말처럼 긴 글이 이어지는 본문.
 *
 * 이전에는 <br> 로 줄을 강제해서 화면 폭이 달라지면 줄바꿈이 어긋났다.
 * 폭을 글자 수로 제한하고 줄바꿈은 브라우저에 맡긴다.
 */
export const Prose = styled.div`
  /* 옆에 아무것도 없을 때는 넓게 둔다. 좁으면 오른쪽이 통째로 비어 보인다. */
  max-width: 68ch;

  & p {
    margin: 0 0 1.6rem;
    font-size: clamp(1.55rem, 1.6vw, 1.7rem);
    line-height: 1.85;
    letter-spacing: -0.025em;
    color: #57524a;
    word-break: keep-all;
  }
  & p:last-child {
    margin-bottom: 0;
  }
  /* 강조는 색이 아니라 굵기로. 오렌지는 페이지에서 아껴 쓴다. */
  & b {
    color: #17150f;
    font-weight: 700;
  }
  /*
   * 마지막 문단은 맺음말이라 크게 띄운다. 같은 크기로 이어지면 글이 그냥
   * 끝나버리고, 화면 오른쪽이 빈 채로 남는다.
   */
  & p:last-of-type {
    margin-top: 3.2rem;
    font-size: clamp(2rem, 2.6vw, 2.6rem);
    line-height: 1.5;
    letter-spacing: -0.035em;
    font-weight: 700;
    color: #17150f;
    max-width: 22ch;
  }
  & p:last-of-type b {
    color: #95500a;
  }

  /* 문장 안의 워드마크는 글자 높이에 맞춘다 */
  & img {
    display: inline-block;
    height: 0.86em;
    width: auto;
    vertical-align: baseline;
    position: relative;
    top: 0.06em;
    margin: 0 0.12em;
  }
`;

/** 글 끝 서명. */
export const Signature = styled.div`
  margin-top: clamp(3.2rem, 5vw, 4.8rem);
  padding-top: clamp(2rem, 3vw, 2.8rem);
  border-top: 1px solid #e7e2d8;
  font-size: 1.5rem;
  letter-spacing: -0.025em;
  color: #8d877f;

  & strong {
    display: block;
    margin-bottom: 0.5rem;
    color: #17150f;
    font-weight: 700;
    font-size: 1.6rem;
  }
`;

/**
 * 연혁 목록.
 *
 * 이전에는 화면 밖까지 나가는 세로선 하나에 연도가 오렌지였다.
 * 선을 걷고 연도는 왼쪽 열에 고정해, 눈이 연도를 따라 내려가게 한다.
 */
export const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: clamp(3.2rem, 5vw, 5.6rem);
  max-width: 92rem;

  /*
   * 연도 열 오른쪽에 얇은 선을 두고, 스크롤한 만큼 오렌지가 차오르게 한다.
   * 장식이 아니라 '지금 어디쯤 읽고 있는가' 를 나타내는 표시다.
   * 좁은 화면에서는 연도가 위로 올라가므로 선을 두지 않는다.
   */
  @media (min-width: 48rem) {
    position: relative;
    padding-left: 0;

    &::before {
      content: "";
      position: absolute;
      left: 10.4rem;
      top: 0.6rem;
      bottom: 0.6rem;
      width: 2px;
      background: #e7e2d8;
    }

    &::after {
      content: "";
      position: absolute;
      left: 10.4rem;
      top: 0.6rem;
      bottom: 0.6rem;
      width: 2px;
      background: #f7941e;
      transform-origin: top center;
      transform: scaleY(0);
    }

    @supports (animation-timeline: view()) {
      &::after {
        animation: nextEraProgress linear both;
        animation-timeline: view();
        /*
         * cover 는 요소가 화면을 완전히 벗어날 때를 100% 로 잡는다. 연혁은 화면보다
         * 훨씬 길어서 페이지 끝까지 내려도 그 지점에 닿지 않아 선이 덜 찬 채로 남는다.
         * entry 로 끝내면 마지막 항목에 닿기 전에 선이 다 차버린다.
         * 처음 보일 때부터 위로 완전히 사라질 때까지로 잡아야 끝까지 내려간다.
         */
        animation-range: cover 20% contain 100%;
      }

      @keyframes nextEraProgress {
        from {
          transform: scaleY(0);
        }
        to {
          transform: scaleY(1);
        }
      }
    }
  }
`;

export const Era = styled.li`
  display: grid;
  gap: 1rem 3.2rem;

  @media (min-width: 48rem) {
    grid-template-columns: 12rem minmax(0, 1fr);
    align-items: start;
  }
`;

export const EraYear = styled.div`
  font-size: clamp(1.8rem, 2.4vw, 2.2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #17150f;
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
`;

export const EraTitle = styled.h3`
  margin: 0 0 1.2rem;
  font-size: clamp(1.6rem, 1.8vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #17150f;
  word-break: keep-all;
`;

export const EraList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.7rem;

  & li {
    position: relative;
    padding-left: 1.4rem;
    font-size: clamp(1.45rem, 1.5vw, 1.55rem);
    line-height: 1.75;
    letter-spacing: -0.025em;
    color: #7d766c;
    word-break: keep-all;
  }
  /* 점 하나로만 표시한다. 선이나 배지를 쓰면 목록이 무거워진다. */
  & li::before {
    content: "";
    position: absolute;
    left: 0.2rem;
    top: 0.85em;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #cfc8bc;
  }
`;

/**
 * 로고 격자.
 *
 * 파일마다 원본 비율과 여백이 제각각이라 그냥 늘어놓으면 크기가 요동친다.
 * 같은 크기의 칸을 주고 그 안에서 맞춘다.
 */
export const LogoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(2.8rem, 4vw, 4.8rem) clamp(2.4rem, 3.5vw, 4rem);
  align-items: center;

  @media (min-width: 36rem) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (min-width: 56rem) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (min-width: 76rem) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`;

export const LogoCell = styled.div`
  /*
   * 배경을 깔면 흰 바탕이 박힌 로고 파일이 '박스 안의 박스' 가 된다.
   * 칸은 크기만 잡고 배경은 두지 않는다. 정렬은 격자가 한다.
   */
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;

  & img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;
