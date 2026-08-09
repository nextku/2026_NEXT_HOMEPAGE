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
  /** 접수 확인 메일에 이름을 걸 사람. 기수가 바뀌면 여기만 고친다. */
  leader: "이성민",
} as const;

/** 지금이 모집 기간 안인지. 서버와 클라이언트의 시각이 달라 hydration 이 어긋나므로 호출 시점에 계산한다. */
export function isRecruiting(now: Date = new Date()) {
  return now >= RECRUIT.start && now <= RECRUIT.end;
}

/**
 * 선발 일정.
 *
 * 지원 페이지의 타임라인과 접수 확인 메일이 같은 값을 봐야 한다. 각자 들고
 * 있으면 기수가 바뀔 때 한쪽만 고치게 되고, 지원자는 서로 다른 날짜를 받는다.
 */
export type RecruitStage = {
  label: string;
  display: string;
  start: Date;
  end?: Date;
};

export const RECRUIT_STAGES: RecruitStage[] = [
  {
    label: "서류 접수",
    display: "8/3(월) — 8/15(토)",
    start: new Date("2026-08-03T00:00:00"),
    end: new Date("2026-08-15T00:00:00"),
  },
  {
    label: "1차 합격자 발표",
    display: "8/19(수)",
    start: new Date("2026-08-19T00:00:00"),
  },
  {
    label: "면접",
    display: "8/22(토) — 8/23(일)",
    start: new Date("2026-08-22T00:00:00"),
    end: new Date("2026-08-23T00:00:00"),
  },
  {
    label: "최종 합격자 발표",
    display: "8/26(수)",
    start: new Date("2026-08-26T00:00:00"),
  },
  {
    label: "오리엔테이션",
    display: "8/29(토)",
    start: new Date("2026-08-29T00:00:00"),
  },
];
