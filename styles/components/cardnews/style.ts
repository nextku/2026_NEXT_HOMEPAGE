import styled from "styled-components";

/**
 * 알럼나이 카드뉴스
 *
 * 이전에는 연회색(#F2F2F2) 둥근 상자 안에 오렌지 채움 배지(기수)와
 * 오렌지 테두리 배지(이름)를 나란히 얹고, 그 아래 썸네일과 제목을 넣었다.
 *
 * 문제는 세 가지였다.
 * 1. 같은 페이지의 기수 탭과 카드 문법이 완전히 달라 따로 놀았다.
 * 2. 배지 두 개가 사진보다 위에서 먼저 시선을 가로챘다. 정작 주인공은 사진과 문장이다.
 * 3. 상자도 둥글고 안의 이미지도 둥글어 라운드가 이중으로 겹쳤다.
 *
 * 상자를 걷고 기수 탭과 같은 문법으로 맞춘다.
 * 카드는 인스타그램 게시물로 나가는 링크이므로, 그 사실을 커서를 올렸을 때 드러낸다.
 */

export const Container2 = styled.div<{ isMobile?: boolean }>`
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  max-width: 128rem;
  padding: 3rem clamp(2rem, 6vw, 8rem) 8rem;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
  gap: clamp(3.2rem, 4vw, 4.8rem) clamp(2rem, 2.5vw, 3.2rem);
  align-items: start;
`;

export const ThumbnailImgDiv = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
  background: #efece7;
  padding: 0;
  transition: box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px rgba(23, 21, 15, 0.08);
    pointer-events: none;
  }

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0;
    transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
  }
`;

/** 이 카드가 인스타그램으로 나간다는 표시. 평소에는 숨어 있다가 커서를 올리면 나타난다. */
export const InstaHint = styled.span`
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  background: rgba(23, 21, 15, 0.82);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: nowrap;

  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.22s ease,
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);

  & svg {
    width: 1.4rem;
    height: 1.4rem;
    flex: 0 0 auto;
  }

  /* 커서가 없는 기기에서는 hover 가 없으므로 항상 보여준다 */
  @media (any-hover: none) {
    opacity: 1;
    transform: none;
  }
`;

export const CardDiv = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background: transparent;
  padding: 0;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);

  @media (any-hover: hover) {
    &:hover {
      transform: translateY(-4px);
    }
    &:hover ${ThumbnailImgDiv} img {
      transform: scale(1.05);
    }
    &:hover ${ThumbnailImgDiv} {
      box-shadow:
        0 2px 4px rgba(23, 21, 15, 0.06),
        0 14px 32px rgba(23, 21, 15, 0.14);
    }
    &:hover ${InstaHint} {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:focus-visible {
    outline: 2px solid #f7941e;
    outline-offset: 4px;
    border-radius: 12px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
    &:hover ${ThumbnailImgDiv} img {
      transform: none;
    }
  }
`;

/** 기수와 이름. 배지 두 개로 나누지 않고 한 줄로 조용히 둔다. */
export const CardMeta = styled.p`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 1.4rem 0 0.5rem;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #7d766c;

  & b {
    color: #17150f;
    font-weight: 700;
  }
  & span {
    color: #cfc8bc;
  }
`;

export const CommentDiv = styled.div`
  width: 100%;
  margin: 0;
  color: #17150f;
  text-align: left;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: -0.03em;
  word-break: keep-all;
`;

/* 이전 구조에서 쓰이던 것들. 마크업이 정리될 때까지 남겨둔다. */
export const CardTopDiv = styled.div`
  display: none;
`;
export const GenerationDiv = styled.div`
  display: none;
`;
export const OccupationDiv = styled.div`
  display: none;
`;
export const LinkToUrl = styled.a`
  padding: 0;
  margin: 0;
  cursor: pointer;
`;
export const LogoImgDiv = styled.div`
  width: 84px;
  & img {
    width: 100%;
  }
`;
