import styled from "styled-components";

/**
 * 기수별 멤버 그리드
 *
 * 이전에는 사진 아래에 연회색(#EBEBEB) 띠를 깔아 이름과 학과를 얹었다.
 * 흰 배경 위 연회색은 경계가 흐릿해 카드가 미완성 플레이스홀더처럼 보이고,
 * 사진마다 색감이 제각각인 상황에서 회색 띠가 그 산만함을 오히려 키운다.
 *
 * 띠를 걷고 사진만 남긴다. 사진이 곧 카드고, 글자는 페이지 배경 위에 놓는다.
 * 입체감은 배경이나 그라디언트가 아니라 커서를 올렸을 때 실제로 들리는 것으로 만든다.
 */

/** 기수 한 개 분량 전체. 그룹 제목과 격자를 함께 담는다. */
export const Section = styled.div`
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  max-width: 128rem;
  padding: 2.4rem clamp(2rem, 6vw, 8rem) 8rem;
`;

/**
 * 그룹 제목.
 * 구분선을 길게 긋지 않는다. 제목 자체가 경계가 되고, 위쪽 여백이 그룹을 나눈다.
 */
export const GroupHead = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.9rem;
  margin: 4.8rem 0 2rem;

  &:first-child {
    margin-top: 0.6rem;
  }

  & h3 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: #17150f;
  }
  & span {
    font-size: 1.35rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: #a09a91;
    font-variant-numeric: tabular-nums;
  }
`;

export const Container = styled.div<{ isMobile?: boolean }>`
  width: 100%;

  /* flex-wrap 은 마지막 줄이 가운데로 몰려 격자가 무너진다. grid 로 고정한다.
     auto-fill 은 화면이 넓어지면 6개까지 들어가므로 열 수를 단계별로 못 박아
     한 줄 최대 5개로 제한한다. */
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(2.4rem, 3vw, 4rem) clamp(1.6rem, 2vw, 2.4rem);
  align-items: start;

  @media (min-width: 34rem) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (min-width: 52rem) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (min-width: 68rem) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`;

export const MemberImgBox = styled.div`
  position: relative;
  width: 100%;
  /* 인물 사진에 맞는 세로 비율. 정사각형은 얼굴이 잘리기 쉽다. */
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 10px;
  background: #efece7;
  transition: box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1);

  /* 밝은 사진이 흰 배경에 녹아버리지 않게 아주 옅은 안쪽 경계만 둔다 */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px rgba(23, 21, 15, 0.08);
    pointer-events: none;
  }

  & img {
    transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
  }
`;

export const MemberWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);

  @media (any-hover: hover) {
    &:hover {
      transform: translateY(-4px);
    }
    /* 액자는 그대로 두고 그 안의 사진만 확대된다. 프레임까지 커지면 격자가 흔들린다. */
    &:hover ${MemberImgBox} img {
      transform: scale(1.045);
    }
    &:hover ${MemberImgBox} {
      box-shadow:
        0 2px 4px rgba(23, 21, 15, 0.06),
        0 12px 28px rgba(23, 21, 15, 0.12);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
    &:hover ${MemberImgBox} img {
      transform: none;
    }
  }
`;

export const MemberTextBox = styled.div`
  padding: 1.2rem 0.2rem 0;
  background: transparent;
`;

export const MemberName = styled.p`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin: 0 0 0.3rem;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.35;
  color: #17150f;
`;

export const MemberInfo = styled.p`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.02em;
  color: #7d766c;
  word-break: keep-all;
`;

/**
 * 운영진 배지.
 * 어두운 알약에 오렌지 글자는 이름보다 먼저 눈에 들어와 위계를 뒤집었다.
 * 이름이 주인공이므로 배지는 글자 옆에 조용히 붙는 라벨로 낮춘다.
 */
export const ManagementTeamBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 1.9rem;
  padding: 0 0.6rem;
  border-radius: 4px;
  background: rgba(247, 148, 30, 0.14);
  color: #95500a;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
`;
