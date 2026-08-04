import React from "react";
import Image from "next/image";
import * as A from "styles/activities/shared";
import { Startups as StartupsItems } from "constants/startups";

/**
 * 배출한 스타트업.
 *
 * 이전에는 로고를 원본 크기 그대로 늘어놓아 어떤 건 큰 컬러 사각형, 어떤 건
 * 작은 텍스트로 보였다. 같은 크기의 칸을 주고 그 안에서 맞춘다.
 * 문구의 오렌지 강조는 걷고 굵기로 바꾼다.
 */

export default function Achievement() {
  return (
    <A.Section className="mount">
      <A.Intro>
        <h2>NEXT에서 시작된 서비스</h2>
        <p>
          아이디어를 기반으로 모인 팀이 서비스를 직접 실현하고, MVP를 제작하여
          빠른 시장 검증을 통해 다양한 스타트업이 탄생했습니다.
        </p>
      </A.Intro>

      <A.LogoGrid>
        {StartupsItems.map(({ name, src }) => (
          <A.LogoCell key={name}>
            <Image
              src={src}
              alt={name}
              fill
              sizes="(max-width: 36rem) 45vw, 240px"
              style={{ objectFit: "contain" }}
            />
          </A.LogoCell>
        ))}
      </A.LogoGrid>
    </A.Section>
  );
}
