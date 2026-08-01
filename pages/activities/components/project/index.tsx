import * as S from "styles/activities/components/project/index";
import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import AOS from "aos";
import "aos/dist/aos.css";
import { useRouter } from "next/router";
import SliderSlick from "components/sliderSlick/index";
import SessionSlider from "components/sessionSlider/index";
import { ProjectItem } from "constants/project";
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
                <p>돈굴돈굴 프로젝트</p>
              </S.SessionTitleBox>
              <S.SessionSemiTitleBox isMobile={isMobile}>
                <p>3월</p>
              </S.SessionSemiTitleBox>
              <S.SessionInfoBox isMobile={isMobile}>
                단돈 10만 원의 자본으로 3주간 최대의 수익을 창출하며, <br />
                비즈니스의 본질과 자본의 흐름을 몸소 체득하는 실전 프로젝트입니다. <br />
              </S.SessionInfoBox>
              <S.SessionImgBox isMobile={isMobile}>
                <SessionSlider
                  images={[
                    { src: dongul1.src, alt: "돈굴돈굴 프로젝트 1" },
                    { src: dongul2.src, alt: "돈굴돈굴 프로젝트 2" },
                    { src: dongul3.src, alt: "돈굴돈굴 프로젝트 3" },
                    { src: dongul4.src, alt: "돈굴돈굴 프로젝트 4" },
                    { src: dongul5.src, alt: "돈굴돈굴 프로젝트 5" },
                    { src: dongul6.src, alt: "돈굴돈굴 프로젝트 6" },
                    { src: dongul7.src, alt: "돈굴돈굴 프로젝트 7" },
                    { src: dongul8.src, alt: "돈굴돈굴 프로젝트 8" },
                  ]}
                />
              </S.SessionImgBox>
            </S.SessionWrapper>
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
                <SessionSlider
                  images={[
                    { src: leanstartup1.src, alt: "린스타트업 세션 1" },
                    { src: leanstartup2.src, alt: "린스타트업 세션 2" },
                    { src: leanstartup3.src, alt: "린스타트업 세션 3" },
                    { src: leanstartup4.src, alt: "린스타트업 세션 4" },
                    { src: leanstartup5.src, alt: "린스타트업 세션 5" },
                  ]}
                />
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
                <SessionSlider
                  images={[
                    { src: hackathon1.src, alt: "무박해커톤 1" },
                    { src: hackathon2.src, alt: "무박해커톤 2" },
                  ]}
                />
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
                <SessionSlider
                  images={[
                    { src: productday1.src, alt: "프로덕트 데이 1" },
                    { src: productday2.src, alt: "프로덕트 데이 2" },
                    { src: productday3.src, alt: "프로덕트 데이 3" },
                    { src: productday4.src, alt: "프로덕트 데이 4" },
                    { src: productday5.src, alt: "프로덕트 데이 5" },
                    { src: productday6.src, alt: "프로덕트 데이 6" },
                  ]}
                />
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
