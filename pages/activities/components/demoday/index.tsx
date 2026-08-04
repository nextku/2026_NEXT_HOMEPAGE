import React from "react";
import * as A from "styles/activities/shared";
import Image from "next/image";
import SessionSlider from "components/sessionSlider/index";

import bass from "public/images/partners/bass.png";
import futureplay from "public/images/partners/futureplay.png";
import bluepoint from "public/images/partners/bluepoint.svg";
import zuzu from "public/images/partners/zuzu.png";
import nonce from "public/images/partners/nonce.png";
import strongventures from "public/images/partners/strongventures.png";
import dcamp from "public/images/partners/dcamp.png";
import mashup from "public/images/partners/mashup_ventures.svg";
import crimson from "public/images/partners/crimson.png";
import startupStation from "public/images/partners/startupStation.png";

/** 데모데이 심사와 후속 투자 논의에 참여하는 투자사들. */
const VCS = [
  { name: "BASS Investment", src: bass },
  { name: "FuturePlay", src: futureplay },
  { name: "BluePoint Partners", src: bluepoint },
  /* 원본이 2.0 비율이고 파일 안에 여백이 있어 컨테이너(2.5)에서 작게 보인다 */
  { name: "ZUZU", src: zuzu, scale: 1.6 },
  { name: "nonce", src: nonce },
  /* 정사각형 원본이라 높이에 갇힌다 */
  { name: "Strong Ventures", src: strongventures, scale: 2.6 },
  { name: "d.camp", src: dcamp },
  { name: "Mashup Ventures", src: mashup },
  { name: "Crimson", src: crimson },
  { name: "Startup Station", src: startupStation, scale: 1.5 },
];
import { DemoItem } from "constants/demo";

/**
 * 데모데이 탭.
 *
 * 이전에는 이 탭만 가운데 정렬이었고, 크기·색·여백이 인라인 style 로 흩어져 있었다.
 * 다른 탭과 축이 맞지 않아 탭을 옮길 때마다 화면이 흔들렸다.
 * 공통 레이아웃으로 옮기고 왼쪽 정렬로 맞춘다. 문구는 그대로 둔다.
 *
 * 하단에 있던 로티(상승 그래프 · 트로피)는 뺐다. 빨강·파랑·금색이라 브랜드 밖의
 * 색이고, 어디서나 보이는 스톡 클립아트다. 무엇보다 바로 위에 실제 수상 사진이
 * 있는데 그 아래 그려진 트로피를 두면 진짜 사진이 약해진다.
 */


export default function Demoday() {
  return (
    <A.Section className="mount">
      <A.Intro>
        <h2>만든 것을 심사받습니다</h2>
        <p>메이저 VC 투자심사역 앞에서 발표하고, 그 다음을 결정합니다.</p>
      </A.Intro>

      <A.Item>
        <A.Copy>
          <A.Title>
            최종 데모데이
            <small>7월 · 1월</small>
          </A.Title>
          <A.Body>
            1학기 동안 학습한 내용을 바탕으로, 약 2달간 팀별로 몰입하여 자신들만의
            독창적인 창업 아이템을 구체화합니다. 창업 아이템을 메이저 VC 하우스
            투자심사역 앞에서 발표하고 최종 창업 진행 여부를 결정합니다. 해당
            과정에서 받은 투자심사역 분들의 피드백과 알럼나이 분들의 도움과 함께
            학회 이후의 후속 창업 여부를 결정합니다.
          </A.Body>
        </A.Copy>
        <A.MediaSlider>
          <SessionSlider
            images={DemoItem.map((item) => ({
              src: item.src.src,
              alt: `데모데이 ${item.name}`,
            }))}
          />
        </A.MediaSlider>

      </A.Item>

      <A.VcBand>
        <A.VcMarquee>
          <A.VcTrack>
            {/* 목록을 두 번 그리고 절반만 이동시켜 이음새를 없앤다 */}
            {[...VCS, ...VCS].map((vc, i) => (
              <A.VcLogo key={`${vc.name}-${i}`} $scale={(vc as any).scale}>
                <Image
                  src={vc.src}
                  alt={i < VCS.length ? vc.name : ""}
                  aria-hidden={i >= VCS.length}
                  fill
                  sizes="110px"
                  style={{ objectFit: "contain" }}
                />
              </A.VcLogo>
            ))}
          </A.VcTrack>
        </A.VcMarquee>
      </A.VcBand>
    </A.Section>
  );
}
