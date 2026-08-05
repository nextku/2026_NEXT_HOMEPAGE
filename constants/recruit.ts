/**
 * 모집 일정.
 *
 * 홈 팝업과 지원 페이지가 각자 날짜를 들고 있으면 기수가 바뀔 때 한쪽만 고치게 된다.
 * 한곳에서 정의하고 양쪽이 가져다 쓴다.
 */
export const RECRUIT = {
  generation: 15,
  start: new Date("2026-08-03T00:00:00"),
  end: new Date("2026-08-15T23:59:59"),
  /** 화면에 보여줄 기간 문자열 */
  display: "2026. 08. 03 — 08. 15",
} as const;

/** 지금이 모집 기간 안인지. 서버와 클라이언트의 시각이 달라 hydration 이 어긋나므로 호출 시점에 계산한다. */
export function isRecruiting(now: Date = new Date()) {
  return now >= RECRUIT.start && now <= RECRUIT.end;
}
