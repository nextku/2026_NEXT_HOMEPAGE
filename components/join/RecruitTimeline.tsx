import React from "react";
import * as S from "styles/components/recruitTimeline/style";

/**
 * 리크루팅 일정 타임라인.
 *
 * 원래는 "서류접수 : 8/3(월) - 8/15(토)" 같은 네 줄짜리 텍스트였다.
 * 지원자가 이 화면에서 가장 알고 싶은 것은 날짜 목록이 아니라
 * "지금 어느 단계이고, 나는 언제까지 뭘 해야 하는가" 다.
 *
 * 페이지가 이미 1초마다 현재 시각을 계산하고 있으므로 그 값을 받아
 * 지난 단계 / 진행 중인 단계 / 남은 단계를 구분해 보여준다.
 */

import type { RecruitStage as Stage } from "constants/recruit";
export type { RecruitStage as Stage } from "constants/recruit";

type Props = {
  stages: Stage[];
  now: Date;
};

const DAY = 24 * 60 * 60 * 1000;

/** 자정 기준으로 남은 일수를 센다. 시분초까지 넣으면 D-day 가 하루씩 어긋난다. */
function daysUntil(target: Date, now: Date) {
  const a = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a.getTime() - b.getTime()) / DAY);
}

export default function RecruitTimeline({ stages, now }: Props) {
  return (
    <S.Timeline>
      {stages.map((stage) => {
        const endsAt = stage.end ?? stage.start;
        // 종료일은 그날 하루를 온전히 포함시킨다.
        const closesAt = new Date(
          endsAt.getFullYear(),
          endsAt.getMonth(),
          endsAt.getDate(),
          23,
          59,
          59,
        );

        const done = now > closesAt;
        const active = !done && now >= stage.start;
        const left = daysUntil(closesAt, now);

        let note = "";
        if (active) note = left <= 0 ? "오늘 마감" : `마감까지 ${left}일`;

        return (
          <S.Row key={stage.label} $done={done} $active={active}>
            <S.Marker aria-hidden="true" />
            <S.Label>{stage.label}</S.Label>
            <S.Date>{stage.display}</S.Date>
            {active && <S.Badge>진행 중{note && ` · ${note}`}</S.Badge>}
            {done && <S.DoneMark>마감</S.DoneMark>}
          </S.Row>
        );
      })}
    </S.Timeline>
  );
}
