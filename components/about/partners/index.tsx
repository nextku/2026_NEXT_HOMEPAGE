import React from "react";
import Image from "next/image";
import * as A from "styles/activities/shared";
import { Partners as PartnersItems } from "constants/partners";

/**
 * 파트너.
 *
 * Achievement 와 같은 격자를 쓴다. 이전에는 로고를 원본 크기로 늘어놓아
 * 마지막 줄이 어색하게 남고 크기가 요동쳤다.
 * 문의 메일은 실제로 누를 수 있게 링크로 만든다.
 */

export default function Partners() {
  return (
    <A.Section className="mount">
      <A.Intro>
        <h2>함께해주시는 분들</h2>
        <p>
          교내 창업지원단체와 교육 기업, 그리고 다양한 VC와 긴밀하게 협력하고
          있습니다. 협업 문의는{" "}
          <a href="mailto:nextku.contact@gmail.com">nextku.contact@gmail.com</a>
          으로 부탁드립니다.
        </p>
      </A.Intro>

      <A.LogoGrid>
        {PartnersItems.map(({ name, src }) => (
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
