/**
 * 잠시 내려둔 화면 요소의 스위치.
 *
 * 코드를 지우면 다시 올릴 때 예전 커밋을 뒤져야 한다. 여기서 false 로 두고
 * 다시 보여줄 때 true 로 바꾸면 원래 화면으로 돌아온다.
 */
export const VISIBILITY = {
  /** People 페이지의 14기 탭 */
  FOURTEENTH_ROSTER: false,
  /** 인사말 서명의 대표·부대표 이름 줄, 홈 footer 의 대표·부대표 연락처 */
  LEAD_TITLES: false,
} as const;
