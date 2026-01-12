import React, { useState, useEffect } from "react";
import * as S from "styles/about/components/greeting/styles";
import { useMediaQuery } from "react-responsive";
import AOS from "aos";
import "aos/dist/aos.css";
import GroupPhoto from "public/images/profile/2024crew.jpg";
import blackLogo from "public/assets/new_logo(bl).svg";

export const DESKTOP_TAB = {
    width: "100%",
    margin: "0 auto 2rem auto",
};

export default function Greeting() {
    const [loading, setLoading] = useState(true);
    const isDesktop = useMediaQuery({ minDeviceWidth: 820 });
    const isMobile = useMediaQuery({ maxWidth: 820 });

    useEffect(() => {
        AOS.init();
        if (isMobile !== undefined && isDesktop !== undefined) {
            setLoading(false);
        }
    }, []);

    return (
        <S.Container isMobile={isMobile} className="mount">
            <S.TextWrapper isMobile={isMobile}>
                <S.TextElementWrapper data-aos="fade">
                    <div>
                        <p>
                            안녕하세요. 고려대학교 유일의 소프트웨어 창업학회{" "}
                            <br />
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                }}
                            >
                                <img
                                    src={blackLogo.src}
                                    alt="NEXT"
                                    style={{
                                        height: "1em",
                                        verticalAlign: "middle",
                                        margin: "0 3px",
                                        display: "inline-block",
                                    }}
                                />
                            </span>
                            (고려대학교 멋쟁이사자처럼)에 오신 여러분
                            반갑습니다.
                        </p>
                        <p>
                            창업, 아이디어는 떠오르지만 막상 실행 방법을 몰라,
                            혹은 함께할 사람이 없어 묻어두지는 않으셨나요?
                            <br />
                            코딩, 따분한 강의와 두꺼운 교재에 결국 흐지부지
                            끝나버리지는 않으셨나요?
                        </p>
                        <br />
                        <p>
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                }}
                            >
                                <img
                                    src={blackLogo.src}
                                    alt="NEXT"
                                    style={{
                                        height: "1em",
                                        verticalAlign: "middle",
                                        margin: "0 3px",
                                        display: "inline-block",
                                    }}
                                />
                            </span>
                            에서는 자체적으로 구축한 커리큘럼에 따라 개발을
                            학습하며 소프트웨어 역량을 기르고
                            <br />
                            다양한 파트너사와의 협업을 통해 기업가적 마인드셋을
                            갖출 수 있습니다.
                        </p>
                        <br />
                        <p>
                            공동의 목표를 가진 동료들, 서비스를 직접 만들고
                            시장에서 테스트하며 축적한 실전 역량,
                            <br />
                            다양한 분야의 사람들과 네트워킹할 수 있는 시간까지.
                        </p>
                        <br />
                        <p>
                            이 과정에서 우리는 더 넓은 세상을 마주하게 될
                            것이고,
                            <br />
                            동료들과 열정을 공유하며 모두가 그리는 비전에 더욱
                            가까워질 것입니다.
                        </p>
                        <br />
                        <p>
                            지금껏 경험해본 적 없는 폭발적인 성장을 기대하며{" "}
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                }}
                            >
                                <img
                                    src={blackLogo.src}
                                    alt="NEXT"
                                    style={{
                                        height: "1em",
                                        verticalAlign: "middle",
                                        margin: "0 3px",
                                        display: "inline-block",
                                    }}
                                />
                            </span>
                            라는{" "}
                            <span
                                style={{ color: "orange", fontWeight: "bold" }}
                            >
                                로켓
                            </span>
                            에 올라타세요.
                        </p>
                        <br />
                        <p>ACCELERATE YOUR POTENTIAL</p>
                    </div>
                    <p>
                        <b
                            style={{
                                display: "flex",
                                alignItems: "baseline",
                                justifyContent: "flex-end",
                            }}
                        >
                            NEXT 14기 임원진 드림
                        </b>
                        <span
                            style={{
                                display: "flex",
                                alignItems: "baseline",
                                justifyContent: "flex-end",
                                fontWeight: "400",
                                fontSize: "1em",
                                flexWrap: "wrap",
                            }}
                        >
                            {" "}
                            <span>
                                <b
                                    style={{
                                        color: "#000",
                                        fontWeight: "500",
                                        paddingLeft: "3px",
                                    }}
                                >
                                    대표
                                </b>
                                &nbsp;&nbsp;홍지우 |
                            </span>
                            <span>
                                <b
                                    style={{
                                        color: "#000",
                                        fontWeight: "500",
                                        paddingLeft: "3px",
                                    }}
                                >
                                    부대표
                                </b>
                                &nbsp;&nbsp;엄빅토리아
                            </span>
                        </span>
                    </p>
                </S.TextElementWrapper>
            </S.TextWrapper>
        </S.Container>
    );
}
