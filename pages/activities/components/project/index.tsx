import React from "react";
import * as A from "styles/activities/shared";
import SessionSlider from "components/sessionSlider/index";

import leanstartup1 from "public/images/activities/project/leanstartup-1.jpg";
import leanstartup2 from "public/images/activities/project/leanstartup-2.jpg";
import leanstartup3 from "public/images/activities/project/leanstartup-3.jpg";
import leanstartup4 from "public/images/activities/project/leanstartup-4.jpg";
import leanstartup5 from "public/images/activities/project/leanstartup-5.jpg";
import hackathon1 from "public/images/activities/project/hackathon-1.jpg";
import hackathon2 from "public/images/activities/project/hackathon-2.jpg";
import productday1 from "public/images/activities/project/productday-1.jpg";
import productday2 from "public/images/activities/project/productday-2.jpg";
import productday3 from "public/images/activities/project/productday-3.jpg";
import productday4 from "public/images/activities/project/productday-4.jpg";
import productday5 from "public/images/activities/project/productday-5.jpg";
import productday6 from "public/images/activities/project/productday-6.jpg";
import dongul1 from "public/images/activities/project/dongul-1.jpg";
import dongul2 from "public/images/activities/project/dongul-2.jpg";
import dongul3 from "public/images/activities/project/dongul-3.jpg";
import dongul4 from "public/images/activities/project/dongul-4.jpg";
import dongul5 from "public/images/activities/project/dongul-5.jpg";
import dongul6 from "public/images/activities/project/dongul-6.jpg";
import dongul7 from "public/images/activities/project/dongul-7.jpg";
import dongul8 from "public/images/activities/project/dongul-8.jpg";

/**
 * 프로젝트 탭.
 *
 * 네 개 프로젝트가 시간 순서대로 이어진다. 이전에는 오렌지 제목 + 오렌지 시기 +
 * 세로 구분선이었는데, 시기는 부가 정보이므로 제목 옆으로 옮기고 색을 걷는다.
 * 내용은 그대로 두고 구조만 공통 레이아웃으로 바꾼다.
 *
 * 시기는 1학기 · 2학기 두 시점을 함께 적는다. 같은 활동이 학기마다 반복되므로
 * 한쪽만 적으면 지원 시점에 따라 틀린 정보가 된다.
 */

const pick = (arr: any[], label: string) =>
  arr.map((src, i) => ({ src: src.src, alt: `${label} ${i + 1}` }));

const PROJECTS = [
  {
    title: "돈굴돈굴 프로젝트",
    when: "3월 · 9월",
    body: "단돈 10만 원의 자본으로 3주간 최대의 수익을 창출하며, 비즈니스의 본질과 자본의 흐름을 몸소 체득하는 실전 프로젝트입니다.",
    images: pick(
      [dongul1, dongul2, dongul3, dongul4, dongul5, dongul6, dongul7, dongul8],
      "돈굴돈굴 프로젝트",
    ),
  },
  {
    title: "린스타트업 세션",
    when: "4월 · 10월",
    body: "린스타트업 방법론을 배우고 실전에 적용하는 시간입니다. MVP를 빠르게 개발하고, 사용자의 피드백을 수집하여 서비스를 지속적으로 개선해 나가는 경험을 쌓습니다.",
    images: pick(
      [leanstartup1, leanstartup2, leanstartup3, leanstartup4, leanstartup5],
      "린스타트업 세션",
    ),
  },
  {
    title: "아이디어 해커톤",
    when: "5월 · 10월",
    body: "꿈꿔왔던 아이템을 개발 세션을 통해 배운 도구들로 직접 만들어봅니다. 제한된 시간 안에 아이디어를 선정하고 배포하는 것을 목표로 하며, 창업가로서의 협업 경험을 쌓습니다.",
    images: pick([hackathon1, hackathon2], "무박해커톤"),
  },
  {
    title: "프로덕트 데이",
    when: "5월 · 11월",
    body: "4주동안 새로운 팀원들과 소통하며 단순한 서비스 구현을 넘어 실제 프로덕트 완성과 운영에 집중합니다.",
    images: pick(
      [productday1, productday2, productday3, productday4, productday5, productday6],
      "프로덕트 데이",
    ),
  },
];

export default function Project() {
  return (
    <A.Section className="mount">
      <A.Intro>
        <h2>배운 것을 바로 씁니다</h2>
        <p>한 학기 동안 네 번, 실제로 만들고 내놓습니다.</p>
      </A.Intro>

      <A.List>
        {PROJECTS.map((p, i) => (
          <A.Item key={p.title} $flip={i % 2 === 1}>
            <A.Copy>
              <A.Title>
                {p.title}
                <small>{p.when}</small>
              </A.Title>
              <A.Body>{p.body}</A.Body>
            </A.Copy>
            <A.MediaSlider>
              <SessionSlider images={p.images} />
            </A.MediaSlider>
          </A.Item>
        ))}
      </A.List>
    </A.Section>
  );
}
