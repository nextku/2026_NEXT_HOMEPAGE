import React from "react";
import Image from "next/image";
import * as A from "styles/activities/shared";

import SessionDev from "public/images/activities/session/session-development.png";
import SessionStartup from "public/images/next13/session-startup.png";

/**
 * 세션 탭.
 *
 * 이전에는 오렌지 제목 + 가운데 세로 구분선 + 각진 이미지였다.
 * 다른 탭과 문법이 달라 같은 페이지로 읽히지 않아 공통 레이아웃으로 옮긴다.
 * 내용은 그대로 두고 구조만 바꾼다.
 */

const SESSIONS = [
  {
    img: SessionDev,
    alt: "개발 세션",
    title: "개발 세션",
    when: "매주 수요일 19:30 – 21:30",
    body: "HTML, CSS, Javascript, React, NEXT.js, Firebase 등 실전 창업과정에 적용 가능한 다양한 기술스택을 공부하며 과제를 수행합니다.",
  },
  {
    img: SessionStartup,
    alt: "창업 세션",
    title: "창업 세션",
    when: "매주 토요일 14:00 – 18:00",
    body: "서비스 기획 단계에서 필요한 창업적 마인드를 배운 후 프로젝트와 네트워킹을 통해 실전을 경험하며 창업가로 성장합니다.",
  },
];

export default function Session() {
  return (
    <A.Section className="mount">
      <A.Intro>
        <h2>매주 모여서 배웁니다</h2>
        <p>개발과 창업, 두 축을 나란히 가져갑니다.</p>
      </A.Intro>

      <A.List>
        {SESSIONS.map((s, i) => (
          <A.Item key={s.title} $flip={i % 2 === 1}>
            <A.Copy>
              <A.Title>
                {s.title}
                <small>{s.when}</small>
              </A.Title>
              <A.Body>{s.body}</A.Body>
            </A.Copy>
            <A.Media>
              <Image
                src={s.img}
                alt={s.alt}
                fill
                sizes="(max-width: 60rem) 100vw, 620px"
                style={{ objectFit: "cover" }}
              />
            </A.Media>
          </A.Item>
        ))}
      </A.List>
    </A.Section>
  );
}
