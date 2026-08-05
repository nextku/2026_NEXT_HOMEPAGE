import React from "react";
import * as A from "styles/activities/shared";
import blackLogo from "public/assets/new_logo(bl).svg";

/**
 * 인사말.
 *
 * 이전에는 제목 없이 본문만 시작했고 줄바꿈을 <br> 로 강제해 화면 폭이 달라지면
 * 어긋났다. 오른쪽 절반은 계속 비어 있었다.
 *
 * 다른 탭과 같은 인트로 구조로 시작하되, 인사말은 옆에 둘 것이 없으므로
 * 글 덩어리 자체를 화면 가운데에 놓는다. 왼쪽에 붙이면 오른쪽 절반이 통째로 빈다.
 * 단체사진은 넣지 않는다 — 보관된 사진이 12기라 15기 인사말과 맞지 않는다.
 * 문구는 그대로다.
 */

const Mark = () => <img src={blackLogo.src} alt="NEXT" />;

export default function Greeting() {
  return (
    <A.SectionNarrow className="mount">
      <A.Intro>
        <h2>안녕하세요, NEXT입니다</h2>
        <p>고려대학교 유일의 소프트웨어 창업학회.</p>
      </A.Intro>

      <A.Prose>
            <p>
        창업, 아이디어는 떠오르지만 막상 실행 방법을 몰라, 혹은 함께할
        사람이 없어 묻어두지는 않으셨나요? 코딩, 따분한 강의와 두꺼운
        교재에 결국 흐지부지 끝나버리지는 않으셨나요?
            </p>
            <p>
        <Mark />
        에서는 자체적으로 구축한 커리큘럼에 따라 개발을 학습하며 소프트웨어
        역량을 기르고, 다양한 파트너사와의 협업을 통해 기업가적 마인드셋을
        갖출 수 있습니다.
            </p>
            <p>
        공동의 목표를 가진 동료들, 서비스를 직접 만들고 시장에서
        테스트하며 축적한 실전 역량, 다양한 분야의 사람들과 네트워킹할 수
        있는 시간까지.
            </p>
            <p>
        이 과정에서 우리는 더 넓은 세상을 마주하게 될 것이고, 동료들과
        열정을 공유하며 모두가 그리는 비전에 더욱 가까워질 것입니다.
            </p>
            <p>
        지금껏 경험해본 적 없는 폭발적인 성장을 기대하며{" "}
        <Mark />
        라는 <b>로켓</b>에 올라타세요.
            </p>
      </A.Prose>

      <A.Signature>
        <strong>NEXT 15기 임원진 드림</strong>
        대표 이성민 · 부대표 박보겸
      </A.Signature>
    </A.SectionNarrow>
  );
}
