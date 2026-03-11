import Head from "next/head";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

// Style & Component & Constants
import * as S from "styles/home/style";
import { useMediaQuery } from "react-responsive";
import { Partners } from "constants/partners";
import Sticky from "components/sticky";

// AOS 동적 로드 (SSR 방지)
const AOS = dynamic(() => import("aos"), { ssr: false });

// Lottie 애니메이션 동적 로드
const RocketLottie = dynamic(
  () => import("components/lottie/lottie").then((mod) => mod.RocketLottie),
  { ssr: false }
);
const LaptopLottie = dynamic(
  () => import("components/lottie/lottie").then((mod) => mod.LaptopLottie),
  { ssr: false }
);
const SessionLottie = dynamic(
  () => import("components/lottie/lottie").then((mod) => mod.SessionLottie),
  {
    ssr: false,
  }
);
const ProjectLottie = dynamic(
  () => import("components/lottie/lottie").then((mod) => mod.ProjectLottie),
  {
    ssr: false,
  }
);
const DemodayLottie = dynamic(
  () => import("components/lottie/lottie").then((mod) => mod.DemodayLottie),
  {
    ssr: false,
  }
);

// Static Assets
import Logo from "public/assets/logo.png";
import LikeLion from "public/assets/likelion_kor_logo.svg";
import MainBG from "public/assets/Rocket_Background.png";
import Text from "public/assets/Accelerate_Your_Potential_new.svg";

export default function Main() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery({ query: "(max-width: 820px)" });

  useEffect(() => {
    import("aos").then((AOS) => {
      AOS.default.init();
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoading(false);
    }
  }, [isMobile]);
  return (
    <div>
      <Head>
        <title>고려대 소프트웨어 창업 학회 | NEXT : HOME</title>
        <meta
          name="google-site-verification"
          content="YdrWjel7OcCUGNmuvaV86uwaB_ZEqJsOqOoV-rKi6vA"
        />
      </Head>
      {/* <Intro></Intro> */}
      {!loading && (
        <S.Container>
          <S.MainContainer>
            <S.MainWrapper isMobile={isMobile}>
              <S.MainTextWrapper>
                <Image src={Text} alt="Main Text" layout="intrinsic" />
              </S.MainTextWrapper>
              <S.MainContainerLogo>
                <Image src={Logo} alt="Logo" layout="intrinsic" />
              </S.MainContainerLogo>
              <S.MainTextLionWrapper>
                <h2>고려대학교</h2>
                <Image src={LikeLion} alt="Like Lion" layout="intrinsic" />
              </S.MainTextLionWrapper>
            </S.MainWrapper>
            {/* 배경 이미지 최적화 */}
            <Image
              src={MainBG}
              alt="Background"
              layout="fill"
              objectFit={isMobile ? "contain" : "cover"}
              priority
            />
          </S.MainContainer>
          <S.Section1 isMobile={isMobile}>
            <div data-aos="fade-right">
              <LaptopLottie />
            </div>
            <div>
              <S.HomeTwoTextWrapper data-aos="fade">
                <Image src={Text} alt="Main Text" width={600} height={300} priority />
              </S.HomeTwoTextWrapper>
              <p
                style={{
                  marginTop: "5rem",
                  fontWeight: "700",
                  fontSize: "3rem",
                }}
                data-aos="fade"
              >
                고려대학교 소프트웨어 창업학회
                <S.NextInlineLogo src={Logo.src} alt="" />는
              </p>
              <p style={{ marginTop: "10rem" }} data-aos="fade">
                다양한 전공과 경험을 가진 사람들이 모여
                <br />
                함께 <b>소프트웨어/ IT 창업</b>을 통해
                <br />
                세상의 여러 문제를 해결해 나가는 학회입니다
              </p>
            </div>
          </S.Section1>
          <Sticky></Sticky>
          <S.Section2>
            <S.TextWrapper isMobile={isMobile} data-aos="fade">
              <span>
                <b>What We Do</b>
              </span>
            </S.TextWrapper>
            <S.LottieContainer isMobile={isMobile}>
              <S.LottieWrapper isMobile={isMobile} data-aos="zoom-in" data-aos-delay="100">
                <SessionLottie />
                <h2>Session</h2>
                <p>필수 기술 스택 습득</p>
              </S.LottieWrapper>
              <S.LottieWrapper isMobile={isMobile} data-aos="zoom-in" data-aos-delay="300">
                <ProjectLottie />
                <h2>Project</h2>
                <p>팀별 실전 서비스 개발</p>
              </S.LottieWrapper>
              <S.LottieWrapper isMobile={isMobile} data-aos="zoom-in" data-aos-delay="500">
                <DemodayLottie />
                <h2>Demoday</h2>
                <p>서비스 검증 및 평가</p>
              </S.LottieWrapper>
              <S.ArrowBG isMobile={isMobile}></S.ArrowBG>
            </S.LottieContainer>

            <S.LottieWrapper isMobile={isMobile} data-aos="zoom-in" data-aos-delay="100">
              <RocketLottie />

              <p>창업 경진대회 및 VC 투자 유치</p>
              <h2 style={{ fontSize: "3rem" }}>"창업"</h2>
            </S.LottieWrapper>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "6rem",
              }}
            >
              <S.MoreBtn isMobile={isMobile} onClick={() => router.push("activities")}>
                &gt;&gt;&nbsp; Activities 자세히 보기
              </S.MoreBtn>
            </div>
          </S.Section2>
          <S.Section2 style={{ background: "black" }}>
            <S.TextWrapper isMobile={isMobile} data-aos="fade">
              <span>
                <b>Partners</b>
              </span>
              <p
                style={{
                  marginTop: "4rem",
                  marginBottom: "4rem",
                  fontWeight: "700",
                }}
              >
                <span>
                  고려대학교 소프트웨어 창업학회 &nbsp;
                  <S.NextInlineLogo2
                    src={Logo.src}
                    alt="NEXT"
                    width="100px"
                    marginLeft="2px"
                    marginRight="3px"
                  />
                  와 함께하는
                </span>
              </p>
            </S.TextWrapper>
            <S.PartnerContainer isMobile={isMobile}>
              {Partners.map(({ name, src }) => (
                <div key={name} data-aos="fade">
                  <Image alt={name} src={src} width={200} height={100} layout="responsive" />
                </div>
              ))}
            </S.PartnerContainer>
          </S.Section2>
          <S.Footer isMobile={isMobile}>
            <h3>고려대학교 소프트웨어 창업학회 NEXT</h3>
            <p>email | nextku.contact@gmail.com</p>
            <p>대표 홍지우 | 010-7222-8050</p>
            <p>부대표 엄빅토리아 | 010-7508-2801</p>
            <S.FooterCopyright>NEXT 2025 All Rights Reserved</S.FooterCopyright>
          </S.Footer>
        </S.Container>
      )}
    </div>
  );
}
