import React from "react";
import * as A from "styles/activities/shared";
import { ABOUT_HISTORY } from "constants/about";

/**
 * 연혁.
 *
 * 이전에는 연도가 오렌지였고 화면 밖까지 이어지는 세로선이 왼쪽에 있었다.
 * 선을 걷고 연도를 왼쪽 열에 고정해 눈이 연도를 따라 내려가게 한다.
 * 데이터(constants/about.ts)는 그대로 쓴다.
 */

export default function History() {
  return (
    <A.SectionTimeline className="mount">
      <A.Intro>
        <h2>2014년부터 지금까지</h2>
        <p>
          멋쟁이사자처럼 고려대 지부에서 시작해 소프트웨어 창업학회가 됐습니다.
        </p>
      </A.Intro>

      <A.Timeline>
        {ABOUT_HISTORY.map((era) => (
          <A.Era key={era.YEAR}>
            <A.EraYear>{era.YEAR}</A.EraYear>
            <div>
              <A.EraTitle>{era.TITLE}</A.EraTitle>
              <A.EraList>
                {era.CONTENT.map(([text], i) => (
                  <li key={i}>{text}</li>
                ))}
              </A.EraList>
            </div>
          </A.Era>
        ))}
      </A.Timeline>
    </A.SectionTimeline>
  );
}
