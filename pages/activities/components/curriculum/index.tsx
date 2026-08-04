import React from "react";
import Image from "next/image";
import * as A from "styles/activities/shared";
import CurriculumImg from "public/images/activities/curriculum/2026curriculum-vertical.webp";

/**
 * 커리큘럼 탭.
 *
 * 이전에는 오렌지 소제목 + 본문이 이미지 위에 따로 놓여 다른 탭과 형태가 달랐다.
 * 다른 탭과 같은 인트로 구조로 맞추고, 이미지는 공통 표면(모서리·그림자)을 쓴다.
 * 문구는 그대로 둔다.
 */

export default function Curriculum() {
  return (
    <A.Section className="mount">
      <A.Intro>
        <h2>개발 · 창업 경험이 전혀 없더라도</h2>
        <p>
          1년 간의 활동을 통해 기본적인 개발 능력을 갖춘 창업자로 성장합니다.
        </p>
      </A.Intro>

      {/* 옆에 글이 없는 단독 이미지라 격자를 쓰지 않는다. */}
      <A.MediaSolo $ratio="2160 / 2700">
          <Image
            src={CurriculumImg}
            alt="2026 커리큘럼"
            fill
            sizes="(max-width: 56rem) 100vw, 760px"
            style={{ objectFit: "contain" }}
            priority
          />
      </A.MediaSolo>
    </A.Section>
  );
}
