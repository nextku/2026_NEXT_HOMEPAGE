import Head from "next/head";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

// Style & Component & Constants
import * as S from "styles/home/style";
import { useMediaQuery } from "react-responsive";
import { Partners } from "constants/partners";
import { RECRUIT, isRecruiting } from "constants/recruit";
import Sticky from "components/sticky";

// 히어로 워드마크는 canvas 기반이라 서버에서 그릴 수 없다.
const ParticleWordmark = dynamic(
  () => import("components/hero/ParticleWordmark"),
  {
    ssr: false,
  },
);

// AOS 동적 로드 (SSR 방지)
const AOS = dynamic(() => import("aos"), { ssr: false });

// Lottie 애니메이션 동적 로드
const RocketLottie = dynamic(
  () => import("components/lottie/lottie").then((mod) => mod.RocketLottie),
  { ssr: false },
);
const LaptopLottie = dynamic(
  () => import("components/lottie/lottie").then((mod) => mod.LaptopLottie),
  { ssr: false },
);
const SessionLottie = dynamic(
  () => import("components/lottie/lottie").then((mod) => mod.SessionLottie),
  {
    ssr: false,
  },
);
const ProjectLottie = dynamic(
  () => import("components/lottie/lottie").then((mod) => mod.ProjectLottie),
  {
    ssr: false,
  },
);
const DemodayLottie = dynamic(
  () => import("components/lottie/lottie").then((mod) => mod.DemodayLottie),
  {
    ssr: false,
  },
);

// Static Assets
import Logo from "public/assets/logo.png";
import MainBG from "public/assets/Rocket_Background.jpg";
import Text from "public/assets/Accelerate_Your_Potential_new.svg";
import RecruitRocket from "public/assets/joinus_rocket.png";

export default function Main() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  /*
   * 이전에는 true 로 시작해 모집이 끝난 뒤에도 '지원하기' 팝업이 계속 떴다.
   * 서버와 브라우저의 시각이 다르면 hydration 이 어긋나므로 첫 렌더에서는 닫아두고
   * 마운트된 뒤 기간을 확인해 연다.
   */
  const [recruitPopupOpen, setRecruitPopupOpen] = useState(false);

  useEffect(() => {
    if (isRecruiting()) setRecruitPopupOpen(true);
  }, []);

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

  useEffect(() => {
    if (!recruitPopupOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRecruitPopupOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [recruitPopupOpen]);

  return (
    <S.PageShell>
      <Head>
        {/*
          이 제목은 건드리지 않는다. 이미 검색 순위가 잡힌 문구다.

          한때 구글 OAuth 동의 화면의 앱 이름과 맞추려고 바꿨었는데, 심사가
          보는 것은 title 이 아니라 홈페이지에 '보이는' 이름과 설명이다.
          푸터의 <h3>고려대학교 소프트웨어 창업학회 NEXT</h3> 와 그 아래 한 줄이
          그 몫을 하므로 제목을 손댈 이유가 없다.

          description 도 여기에 두지 않는다. _app.tsx 에 전역으로 이미 있어서
          하나 더 쓰면 태그가 둘이 되고, 검색엔진이 어느 쪽을 쓸지 알 수 없어진다.
        */}
        <title>고려대 소프트웨어 창업 학회 | NEXT : HOME</title>
        {/*
          홈에서만 description 을 덮어쓴다. 전역 문구는 홍보 문장이라 "이 앱이
          무엇을 하는가" 를 답하지 않는데, 구글 OAuth 브랜딩 검사가 그것을 본다.
          _app.tsx 와 같은 key 를 써야 태그가 하나로 합쳐진다.
          기존 검색 키워드(고려대학교·소프트웨어·창업학회·NEXT)는 그대로 담았다.
        */}
        <meta
          key="description"
          name="description"
          content="고려대학교 소프트웨어 창업학회 NEXT 공식 웹사이트입니다. 다양한 전공과 경험을 가진 학생들이 모여 소프트웨어·IT 창업으로 세상의 문제를 해결합니다. 학회 소개와 활동, 신입 부원 모집을 안내하며 학회원은 구글 계정으로 로그인해 채용·투자·행사 정보를 확인할 수 있습니다."
        />
        <meta
          name="google-site-verification"
          content="YdrWjel7OcCUGNmuvaV86uwaB_ZEqJsOqOoV-rKi6vA"
        />
      </Head>
      {/* <Intro></Intro> */}
      {loading && (
        <S.Booting>
          <h1>고려대학교 소프트웨어 창업학회 NEXT</h1>
          <p>
            다양한 전공과 경험을 가진 사람들이 모여 소프트웨어·IT 창업으로
            세상의 여러 문제를 해결해 나가는 학회입니다.
          </p>
          <p>
            이 웹사이트는 학회 소개와 활동, 신입 부원 모집을 안내합니다.
            학회원은 구글 계정으로 로그인해 채용·투자·행사 정보를 확인할 수
            있습니다.
          </p>
        </S.Booting>
      )}
      {!loading && (
        <S.Container>
          {recruitPopupOpen && (
            <S.RecruitPopupBackdrop
              role="presentation"
              onClick={() => setRecruitPopupOpen(false)}
            >
              <S.RecruitPopup
                role="dialog"
                aria-modal="true"
                aria-labelledby="recruit-popup-title"
                onClick={(event) => event.stopPropagation()}
              >
                <S.RecruitPopupCanvas>
                  <S.RecruitPopupGlow />
                  <S.RecruitPopupClose
                    type="button"
                    aria-label="리크루팅 안내 닫기"
                    onClick={() => setRecruitPopupOpen(false)}
                  >
                    ×
                  </S.RecruitPopupClose>
                  <S.RecruitPopupContent>
                    <S.RecruitPopupEyebrow>
                      Who's NEXT? - {RECRUIT.generation}th Recruiting
                    </S.RecruitPopupEyebrow>
                    <h2 id="recruit-popup-title">
                      세상을 바꿀 다음 여정에
                      <br />
                      함께할{" "}
                      <S.RecruitPopupWordmark
                        src="/assets/new_logo(wh).svg"
                        alt="NEXT"
                      />
                      를 찾습니다
                    </h2>
                    <S.RecruitPopupPeriod>
                      <span>지원 기간</span>
                      {RECRUIT.display}
                    </S.RecruitPopupPeriod>
                    <S.RecruitPopupButton
                      type="button"
                      onClick={() => router.push("/join")}
                    >
                      {RECRUIT.generation}기 지원하기
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12h13M12.5 6l6 6-6 6" />
                      </svg>
                    </S.RecruitPopupButton>
                  </S.RecruitPopupContent>
                  <S.RecruitPopupRocket aria-hidden="true">
                    <Image
                      src={RecruitRocket}
                      alt=""
                      layout="fill"
                      objectFit="contain"
                      priority
                    />
                  </S.RecruitPopupRocket>
                </S.RecruitPopupCanvas>
              </S.RecruitPopup>
            </S.RecruitPopupBackdrop>
          )}
          <S.MainContainer>
            <S.MainWrapper isMobile={isMobile}>
              <S.MainTextWrapper>
                <Image src={Text} alt="Main Text" layout="intrinsic" />
              </S.MainTextWrapper>
              <S.VisuallyHidden>
                NEXT · 고려대학교 소프트웨어 창업학회
              </S.VisuallyHidden>
              <S.ParticleMark>
                <ParticleWordmark src={Logo.src} />
              </S.ParticleMark>
              <S.MainTextLionWrapper>
                <h2>고려대학교</h2>
              </S.MainTextLionWrapper>
            </S.MainWrapper>
            {/* 배경 이미지 최적화 */}
            {/*
              모바일에서 contain 이면 사진이 화면을 못 채워 위아래에 검정 띠가 남고
              텍스트가 사진 안에 갇혀 화면 중앙과 어긋난다. 항상 채운다.
            */}
            <Image
              src={MainBG}
              alt=""
              layout="fill"
              objectFit="cover"
              objectPosition="center"
              priority
            />
          </S.MainContainer>
          <S.Section1 isMobile={isMobile}>
            <div data-aos="fade-right">
              <LaptopLottie />
            </div>
            <div>
              <S.HomeTwoTextWrapper data-aos="fade">
                <Image
                  src={Text}
                  alt="Main Text"
                  width={600}
                  height={300}
                  priority
                />
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
              <S.LottieWrapper
                isMobile={isMobile}
                data-aos="zoom-in"
                data-aos-delay="100"
              >
                <SessionLottie />
                <h2>Session</h2>
                <p>필수 기술 스택 습득</p>
              </S.LottieWrapper>
              <S.LottieWrapper
                isMobile={isMobile}
                data-aos="zoom-in"
                data-aos-delay="300"
              >
                <ProjectLottie />
                <h2>Project</h2>
                <p>팀별 실전 서비스 개발</p>
              </S.LottieWrapper>
              <S.LottieWrapper
                isMobile={isMobile}
                data-aos="zoom-in"
                data-aos-delay="500"
              >
                <DemodayLottie />
                <h2>Demoday</h2>
                <p>서비스 검증 및 평가</p>
              </S.LottieWrapper>
              <S.ArrowBG isMobile={isMobile}></S.ArrowBG>
            </S.LottieContainer>

            <S.FinaleWrapper data-aos="zoom-in" data-aos-delay="100">
              <RocketLottie />
              <p>창업 경진대회 및 VC 투자 유치</p>
              <h2>"창업"</h2>
            </S.FinaleWrapper>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "6rem",
              }}
            >
              <S.MoreBtn
                isMobile={isMobile}
                onClick={() => router.push("activities")}
              >
                <span>Activities 자세히 보기</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h13M12.5 6l6 6-6 6" />
                </svg>
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
                  <Image
                    alt={name}
                    src={src}
                    width={200}
                    height={100}
                    layout="responsive"
                  />
                </div>
              ))}
            </S.PartnerContainer>
          </S.Section2>
        </S.Container>
      )}
      {/*
        푸터는 loading 조건 밖에 둔다.

        위 본문은 useMediaQuery 로 모바일 여부를 판단하기 때문에 마운트 전에는
        그리지 못한다. 그 결과 서버가 내려주는 HTML 은 빈 div 하나뿐이었고,
        JS 를 실행하지 않는 크롤러 눈에는 아무 글도 없는 페이지였다. 구글
        OAuth 심사가 "홈페이지에 앱의 목적 설명이 없다" 로 반려한 실제 원인이다.
        푸터는 isMobile 에 의존하지 않으므로 서버에서 그대로 그릴 수 있다.
      */}
      <S.Footer>
        <S.FooterTop>
          <div>
            <h3>고려대학교 소프트웨어 창업학회 NEXT</h3>
            <p style={{ marginTop: "1rem" }}>
              email |{" "}
              <a href="mailto:nextku.contact@gmail.com">
                nextku.contact@gmail.com
              </a>
            </p>
          </div>
          <S.FooterContacts>
            <p>대표 이성민 · 010-8693-1884</p>
            <p>부대표 박보겸 · 010-3185-7117</p>
          </S.FooterContacts>
        </S.FooterTop>

        <S.FooterBottom>
          <S.FooterMeta>
            <S.FooterCopyright>NEXT 2026 All Rights Reserved</S.FooterCopyright>
            <S.FooterLegal>
              <a href="/privacy">개인정보처리방침</a>
              <a href="/terms">이용약관</a>
            </S.FooterLegal>
          </S.FooterMeta>
          <S.FooterSocials>
            <a
              href="https://www.linkedin.com/company/nextxlikelion/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NEXT 링크드인"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <path d="M7.5 10.5V17M7.5 7.4v.1M11.5 17v-3.6a2.4 2.4 0 014.8 0V17" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/next_koreauniv/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NEXT 인스타그램"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="3.8" />
                <path d="M17.3 6.8v.01" />
              </svg>
            </a>
          </S.FooterSocials>
        </S.FooterBottom>
      </S.Footer>
    </S.PageShell>
  );
}
