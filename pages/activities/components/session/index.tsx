import * as S from "styles/activities/components/session/index";
import Head from "next/head";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import AOS from "aos";
import SessionDev from "public/images/activities/session/session-development.png";
import SessionStartup from "public/images/next13/session-startup.png";
import "aos/dist/aos.css";
import { useRouter } from "next/router";

export default function Session() {
  const router = useRouter();
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
              <S.SessionImgBox isMobile={isMobile}>
                <Image
                  src={SessionDev}
                  alt="개발 세션"
                  layout="fill"
                  objectFit="cover"
                />
              </S.SessionImgBox>
              <S.SessionTitleBox isMobile={isMobile}>
                <p>개발 세션</p>
                <span />
                <p>매주 수요일 19시 반 - 22시 반</p>
              </S.SessionTitleBox>
              <S.SessionInfoBox isMobile={isMobile}>
                HTML, CSS, Javascript, React, NEXT.js, Firebase 등 실전
                창업과정에 적용 가능한 다양한 기술스택을 공부하며 과제를
                수행합니다.
              </S.SessionInfoBox>
            </S.SessionWrapper>
            <S.SessionWrapper isMobile={isMobile}>
              <S.SessionImgBox isMobile={isMobile}>
                <Image
                  src={SessionStartup}
                  alt="창업 세션"
                  layout="fill"
                  objectFit="cover"
                />
              </S.SessionImgBox>
              <S.SessionTitleBox isMobile={isMobile}>
                <p>창업 세션</p>
                <span />
                <p>매주 토요일 16시 - 18시</p>
              </S.SessionTitleBox>
              <S.SessionInfoBox isMobile={isMobile}>
                서비스 기획 단계에서 필요한 창업적 마인드를 배운 후 프로젝트와
                네트워킹을 통해 실전을 경험하며 창업가로 성장합니다.
              </S.SessionInfoBox>
            </S.SessionWrapper>
          </S.MainContainer>
        </S.Container>
      )}
    </>
  );
}
