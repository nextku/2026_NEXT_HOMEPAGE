import Head from "next/head";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import { useRecoilState } from "recoil";
import * as S from "styles/join/style";
import { joinModalOpen, isLaunched } from "constants/atoms";
import RecruitTimeline, { Stage } from "components/join/RecruitTimeline";

// Static Assets
import RocketImg from "public/assets/joinus_rocket.png";
import PlanetImg from "public/assets/new_earth@4x.png";
import Text from "public/assets/Accelerate_Your_Potential_new.svg";
import Logo from "public/assets/new_logo(wh).svg";

const variants = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
};

/** 안내문에 흩어져 있던 날짜를 한곳에 모은다. 표시 문자열과 실제 날짜가 어긋나지 않게. */
const RECRUIT_STAGES: Stage[] = [
  {
    label: "서류 접수",
    display: "8/3(월) — 8/15(토)",
    start: new Date("2026-08-03T00:00:00"),
    end: new Date("2026-08-15T00:00:00"),
  },
  {
    label: "1차 합격자 발표",
    display: "8/19(수)",
    start: new Date("2026-08-19T00:00:00"),
  },
  {
    label: "면접",
    display: "8/22(토) — 8/23(일)",
    start: new Date("2026-08-22T00:00:00"),
    end: new Date("2026-08-23T00:00:00"),
  },
  {
    label: "최종 합격자 발표",
    display: "8/26(수)",
    start: new Date("2026-08-26T00:00:00"),
  },
  {
    label: "오리엔테이션",
    display: "8/29(토)",
    start: new Date("2026-08-29T00:00:00"),
  },
];

// 동적 로딩
const S3upload = dynamic(() => import("components/s3upload/index"), {
  ssr: false,
});
const AOS = dynamic(() => import("aos"), { ssr: false });

export default function Join() {
  const [loading, setLoading] = useState(true);
  const [launch, setLaunch] = useRecoilState(isLaunched);
  const [modalPage, setModalPage] = useState(1);
  const [modalOpen, setModalOpen] = useRecoilState(joinModalOpen);
  const [accept, setAccept] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 1000 });

  const config = {
    autoRotate: 1,
    autoLoad: true,
    showControls: false,
    mouseZoom: false,
    uiText: {
      loadingLabel: "NEXT를 향해 비행중...",
      bylineLabel: "",
      iOS8WebGLError: "",
      genericWebGLError: "",
      textureSizeError: "",
    },
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const startApplicationTime = new Date("2026-08-03T00:00:00");
  const endApplicationTime = new Date("2026-08-15T23:59:59");

  let buttonText = "지원하기";
  let disabled = false;

  if (currentTime < startApplicationTime) {
    buttonText = "아직 모집 기간이 아닙니다";
  } else if (currentTime > endApplicationTime) {
    buttonText = "모집 기간이 종료되었습니다";
  }
  useEffect(() => {
    import("aos").then((AOS) => {
      AOS.default.init({ duration: 1000, once: true });
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      setLaunch(false);
      setModalOpen(false);
    };
  }, []);

  useEffect(() => {
    return () => {
      setModalPage(1);
    };
  }, [modalOpen]);

  // TODO: Change download & apply link
  return (
    <div>
      <Head>
        <title>고려대 소프트웨어 창업 학회 | NEXT : JOIN</title>
        <link rel="icon" href="/favicon.svg" />
      </Head>
      {!loading && (
        <S.Container>
          {!launch && (
            <S.TitleWrapper isMobile={isMobile}>
              <Image
                src={Text}
                alt="Main Text"
                layout="intrinsic"
                width={Text.width / 2}
                height={Text.height / 2}
              />
              <Image
                src={Logo}
                alt="Logo"
                layout="intrinsic"
                width={Logo.width / 2}
                height={Logo.height / 2}
              />
              <div className="university-wrapper">
                <span style={{ fontWeight: 400, fontSize: "2.5rem" }}>
                  고려대학교 소프트웨어 창업학회
                </span>
              </div>
              <p>15기 모집</p>
              <S.RocketInfo className="rocket-info">
                <p>
                  아래 <span>로켓</span>을 누르면 지원 안내가 열립니다
                </p>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </S.RocketInfo>
            </S.TitleWrapper>
          )}
          {launch && (
            <S.TitleWrapper isMobile={isMobile}>
              <p>지원해주셔서 감사합니다</p>
              <br />
              <p style={{ fontSize: "1.8rem" }}>
                NEXT에서 세상을 바꿔나갈 여러분의 도전을 응원합니다!
              </p>
            </S.TitleWrapper>
          )}
          <motion.div
            animate={modalOpen ? "open" : "closed"}
            variants={variants}
            style={{ zIndex: "10", opacity: "0" }}
          >
            <S.ModalContainer infoOpen={modalOpen}>
              <S.ModalHeader>
                {/* 열릴 때 여기에 포커스를 줘야 본문이 항상 맨 위에서 시작한다 (WAI-ARIA) */}
                <h2 id="join-info-title" tabIndex={-1}>
                  15기 지원 안내
                </h2>
                <S.CloseBtnWrapper>
                  <button
                    type="button"
                    aria-label="지원 안내 닫기"
                    onClick={() => setModalOpen(false)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </S.CloseBtnWrapper>
              </S.ModalHeader>
              <S.ModalContentWrapper>
                <S.ScrollProgress aria-hidden="true" />
                {modalPage == 1 && (
                  <S.InfoModal>

                    <S.InfoSection>
                      <h3>
                        <em>1</em>지원 방식
                      </h3>
                      <ol>
                        <li>
                          아래 <S.Chip>지원서 다운로드</S.Chip> 버튼을 클릭한 후
                          지원서 양식 다운로드
                        </li>
                        <li>서류 접수 기간 내에 지원서 작성</li>
                        <li>
                          아래 <S.Chip>지원하기</S.Chip> 버튼을 클릭하여 지원서
                          업로드
                        </li>
                        <li>
                          모든 문항별 글자수는 공백을 포함한 글자수를 기준으로
                          합니다.
                        </li>
                        <li>제출한 지원서는 수정할 수 없습니다.</li>
                      </ol>
                      <S.Note>
                        [지원하기] 버튼은 지원 기간 중에만 확인 가능합니다.
                      </S.Note>
                    </S.InfoSection>

                    <S.InfoSection>
                      <h3>
                        <em>2</em>리크루팅 일정
                      </h3>
                      <RecruitTimeline stages={RECRUIT_STAGES} now={currentTime} />
                    </S.InfoSection>

                    <S.InfoSection>
                      <h3>
                        <em>3</em>수료 기준
                      </h3>
                      <p>
                        학회에서 OT부터 겨울방학 기간 동안 진행하는 모든 세션 및
                        행사는 필참입니다. 불성실하게 참여하는 경우 수료에 제한이
                        생길 수 있음을 알려드립니다.
                      </p>
                    </S.InfoSection>

                    <S.InfoSection>
                      <h3>
                        <em>4</em>면접 촬영 및 개인정보 수집 안내
                      </h3>
                      <p>
                        면접 평가는 모두 <b>대면</b>으로 이뤄집니다. 원활한 스케줄
                        조정을 위하여 8월 22일(토), 23일(일) 중 가능한 시간대를 꼭
                        구글폼에 체크해 주시면 감사하겠습니다.
                      </p>
                      <p>
                        공정한 면접 평가를 위해 면접 내용을 촬영 및 수집할
                        예정입니다. 촬영한 면접영상 및 개인정보는 선발과정에서만
                        활용되며, 리크루팅 이후 즉시 폐기될 예정입니다.
                      </p>
                    </S.InfoSection>

                    <S.InfoSection>
                      <h3>
                        <em>5</em>학회비 안내
                      </h3>
                      <p>
                        원활한 학회 운영을 위해 학회비를 걷어 운영하고 있습니다.
                        새로 들어오시는 학회원들은 <b>10만원</b>의 학회비를
                        납부하고, 해당 금액은 학회 운영을 위해서만 사용될
                        예정입니다.
                      </p>
                      <p>
                        학회원들은 모든 회계 정산 내용을 활동 종료 이후 학회 노션
                        페이지에서 확인하실 수 있습니다.
                      </p>
                    </S.InfoSection>

                    <S.InfoSection>
                      <h3>
                        <em>6</em>오리엔테이션 필참
                      </h3>
                      <p>
                        최종 합격 이후 <b>8월 29일(토)</b>에 진행되는 OT는 필수
                        참여입니다. 원활한 학회 운영을 위해, OT 일정을 고려하여
                        개인 일정을 조정해주시면 감사하겠습니다.
                      </p>
                    </S.InfoSection>


                  </S.InfoModal>
                )}
                {modalPage == 2 && <S3upload />}
              </S.ModalContentWrapper>
              {modalPage == 1 && (
                <S.ModalFooter>
                  <S.CheckContainer>
                    <input
                      checked={accept}
                      type="checkbox"
                      id="acceptCheck"
                      onChange={() => setAccept((prev) => !prev)}
                    />
                    <label htmlFor="acceptCheck">
                      위 안내사항을 확인했으며, 이에 동의합니다.
                    </label>
                  </S.CheckContainer>

                  <S.NextBtnWrapper isMobile={isMobile} accepted={accept}>
                    <button
                      type="button"
                      onClick={() =>
                        (location.href =
                          "https://docs.google.com/document/d/1jHm_GrZzElCt47xJIP5HQJVuElVaWb_G/export?format=docx")
                      }
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 3v12M7.5 10.5L12 15l4.5-4.5M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                      </svg>
                      지원서 다운로드
                    </button>
                    <button
                      type="button"
                      disabled={!accept || disabled}
                      onClick={() => {
                        if (
                          currentTime >= startApplicationTime &&
                          currentTime <= endApplicationTime
                        ) {
                          window.open(
                            "https://docs.google.com/forms/d/e/1FAIpQLScTXBOecHQlOOjlWGaiQNfBbcmAq0h-uEIjgZ_t4P8ReWbc8g/viewform?usp=header",
                            "_blank",
                          );
                        }
                      }}
                    >
                      {buttonText}
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
                    </button>
                  </S.NextBtnWrapper>
                  {/*
                    버튼이 왜 안 눌리는지 말해주지 않으면 지원자는 고장으로 받아들인다.
                    단 조건부로 DOM 에서 빼면 모달 높이가 줄고, 모달이 가운데 정렬이라
                    체크하는 순간 화면이 위로 튄다. 자리는 항상 잡아두고 보이기만 바꾼다.
                  */}
                  <S.BlockedReason aria-hidden={accept || disabled} $shown={!accept && !disabled}>
                    안내사항에 동의하면 지원하기가 열립니다.
                  </S.BlockedReason>
                </S.ModalFooter>
              )}
            </S.ModalContainer>
          </motion.div>
          <S.SpaceContainer isMobile={isMobile}>
            <S.RocketContainer
              onClick={() => {
                setModalOpen((modalOpen) => !modalOpen);
              }}
              launched={launch}
            >
              <S.Rocket>
                <img src={RocketImg.src} />
              </S.Rocket>
              {/* <S.Fire launched={launch}>
                                <FireLottie />
                            </S.Fire> */}
            </S.RocketContainer>

            <S.Planet launched={launch}>
              <img draggable={false} src={PlanetImg.src} />
            </S.Planet>
          </S.SpaceContainer>
        </S.Container>
      )}
    </div>
  );
}
