import * as S from "styles/activities/components/project/index";
import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import AOS from "aos";
import "aos/dist/aos.css";
import { useRouter } from "next/router";
import SliderSlick from "components/sliderSlick/index";
import { ProjectItem } from "constants/project";
import hackathon_codeit from "public/images/next13/hackathon.png";
import ideathon from "public/images/next13/lean-startup.png";
import product_day from "public/images/next13/product-day.png";

export default function Curriculrum() {
  const [loading, setLoading] = useState(true);
  const isDesktop = useMediaQuery({ minDeviceWidth: 820 });
  const isMobile = useMediaQuery({ maxWidth: 820 });

  useEffect(() => {
    AOS.init();
    if (isMobile != undefined && isDesktop != undefined) {
      setLoading(false);
    }
  }, []);
  return (
    <>
      {!loading && (
        <S.Container className="mount" isMobile={isMobile}>
          <S.MainContainer isMobile={isMobile}>
            <S.SessionWrapper isMobile={isMobile}>
              <S.SessionTitleBox isMobile={isMobile}>
                <p>린스타트업 세션</p>
              </S.SessionTitleBox>
              <S.SessionSemiTitleBox isMobile={isMobile}>
                <p>3-4월</p>
              </S.SessionSemiTitleBox>
              <S.SessionInfoBox isMobile={isMobile}>
                린스타트업 방법론을 배우고 실전에 적용하는 시간입니다. <br />
                MVP를 빠르게 개발하고, 사용자의 피드백을 수집하여 <br />
                서비스를 지속적으로 개선해 나가는 경험을 쌓습니다.
              </S.SessionInfoBox>
              <S.SessionImgBox isMobile={isMobile}>
                <img src={ideathon.src} alt="린스타트업 세션" />
              </S.SessionImgBox>
            </S.SessionWrapper>
            <S.SessionWrapper isMobile={isMobile}>
              <S.SessionTitleBox isMobile={isMobile}>
                <p>무박 해커톤</p>
              </S.SessionTitleBox>
              <S.SessionSemiTitleBox isMobile={isMobile}>
                <p>5월 초</p>
              </S.SessionSemiTitleBox>
              <S.SessionInfoBox isMobile={isMobile}>
                꿈꿔왔던 아이템을 개발 세션을 통해 배운 도구들로 직접 만들어봅니다. <br />
                제한된 시간 안에 아이디어를 선정하고 배포하는 것을 목표로 하며, <br />
                창업가로서의 협업 경험을 쌓습니다.
              </S.SessionInfoBox>
              <S.SessionImgBox isMobile={isMobile}>
                <img src={hackathon_codeit.src} alt="무박해커톤" />
              </S.SessionImgBox>
            </S.SessionWrapper>
            <S.SessionWrapper isMobile={isMobile}>
              <S.SessionTitleBox isMobile={isMobile}>
                <p>프로덕트 데이</p>
              </S.SessionTitleBox>
              <S.SessionSemiTitleBox isMobile={isMobile}>
                <p>4-5월</p>
              </S.SessionSemiTitleBox>
              <S.SessionInfoBox isMobile={isMobile}>
                4주동안 새로운 팀원들과 소통하며 단순한 서비스 구현을 넘어 <br />
                실제 프로덕트 완성과 운영에 집중합니다. <br />
                <br />
              </S.SessionInfoBox>
              <S.SessionImgBox isMobile={isMobile}>
                <img src={product_day.src} alt="프로덕트 데이" />
              </S.SessionImgBox>
            </S.SessionWrapper>
            {/* <S.ProjectExampleWrapper>
              <S.ProjectTextBox>NEXT 프로젝트 예시</S.ProjectTextBox>
              <S.SlideWrapper>
                <SliderSlick slideItemGroup={ProjectItem} slideShowGroup={2} />
              </S.SlideWrapper>
            </S.ProjectExampleWrapper> */}
          </S.MainContainer>
        </S.Container>
      )}
    </>
  );
}
