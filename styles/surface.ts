import { css } from "styled-components";

/**
 * 이미지 카드 공통 표면
 *
 * 라운드와 그림자를 컴포넌트마다 따로 쓰면 값이 조금씩 달라지고, 새 카드를
 * 만들 때 빠뜨린다. 실제로 Why NEXT 에만 squircle 이 들어가고 커리큘럼은 빠졌다.
 * 한곳에서 정의하고 가져다 쓴다.
 *
 * squircle 은 직선에서 원호로 꺾이지 않고 곡률이 이어지는 애플식 모서리다.
 * corner-shape 를 지원하지 않는 브라우저에서는 일반 라운드로 남는다.
 * corner-shape 는 border-radius 가 0 이면 아무 효과가 없으므로 항상 함께 준다.
 * 또 squircle 은 같은 반경이어도 시각적으로 덜 뭉툭해서 값을 조금 키운다.
 */
export const squircle = (radius: number) => css`
  border-radius: ${radius}px;

  @supports (corner-shape: squircle) {
    corner-shape: squircle;
    border-radius: ${Math.round(radius * 1.4)}px;
  }
`;

/**
 * 얕은 입체감.
 *
 * 흰 배경 위의 흰 포스터는 경계가 사라져 종이가 떠 있는 느낌이 없다.
 * 두 겹으로 나눈다 — 짧고 진한 그림자가 물체의 두께를, 길고 옅은 그림자가
 * 바닥과의 거리를 만든다. 한 겹으로 뭉치면 번진 얼룩처럼 보인다.
 */
export const lift = css`
  /*
   * 밝은 포스터는 옅은 그림자로 충분하지만, 검정 포스터는 그림자가 배경에 묻혀
   * 카드가 배경에 눌러붙어 보인다. 어두운 면에도 통하도록 값을 올리고,
   */
  box-shadow:
    0 2px 4px rgba(23, 21, 15, 0.08),
    0 12px 32px rgba(23, 21, 15, 0.16);
`;

/** 커서를 올렸을 때. 실제로 조금 더 들린다. */
export const liftHover = css`
  box-shadow:
    0 4px 8px rgba(23, 21, 15, 0.1),
    0 22px 52px rgba(23, 21, 15, 0.24);
`;

/** 어두운 배경에서는 그림자가 안 보인다. 아주 옅은 테두리로 경계를 만든다. */
export const liftOnDark = css`
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06),
    0 12px 32px rgba(0, 0, 0, 0.45);
`;
