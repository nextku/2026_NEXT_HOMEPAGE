import * as S from "styles/activities/components/demoday/index";
import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import AOS from "aos";
import "aos/dist/aos.css";
import { useRouter } from "next/router";
import { DemodayFinalLottie, DemodayInHouseLottie } from "components/lottie/lottie";
import SliderSlick from "components/sliderSlick/index";
import { DemoItem } from "constants/demo";

export default function Curriculrum() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const isDesktop = useMediaQuery({ minDeviceWidth: 820 });
    const isMobile = useMediaQuery({ maxWidth: 820 });

    useEffect(() => {
        AOS.init();
        if (isMobile !== undefined && isDesktop !== undefined) {
            setLoading(false);
        }
    }, [isMobile, isDesktop]);

    return (
        <>
            {!loading && (
                <S.Container className="mount" isMobile={isMobile}>
                    <S.MainContainer 
                        isMobile={isMobile} 
                        style={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            alignItems: "center", 
                            width: "100%" 
                        }}
                    >
                        
                        {/* 1. Title & Date */}
                        <div style={{ width: "100%", textAlign: "center", marginBottom: "30px" }}>
                             <S.SessionTitleBox isMobile={isMobile} style={{ margin: "0 auto", display: "block" }}>
                                최종 데모데이
                            </S.SessionTitleBox>
                            <p style={{ 
                                margin: "10px 0 0 0", 
                                fontSize: "1.4rem", 
                                color: "#ff8a00", 
                                fontWeight: "700" 
                            }}>
                                7월 초
                            </p>
                        </div>

                        {/* 2. Slide */}
                        <div style={{ 
                            width: isMobile ? "80%" : "50%", 
                            maxWidth: "600px",               
                            margin: "0 auto", 
                            position: "relative",
                            overflow: "hidden"             
                        }}>
                            <S.SlideWrapper style={{ margin: "0" }}>
                                <SliderSlick slideItemGroup={DemoItem} slideShowGroup={1} />
                            </S.SlideWrapper>
                        </div>

                        {/* 3. Info */}
                        <S.SessionInfoBox 
                            isMobile={isMobile} 
                            style={{ 
                                width: "100%",
                                marginTop: "40px", 
                                textAlign: "center",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center"
                            }}
                        >
                            <p style={{ 
                                color: "#000", 
                                lineHeight: "1.8", 
                                wordBreak: "keep-all", 
                                maxWidth: "700px", 
                                margin: "0 auto",
                                padding: isMobile ? "0 20px" : "0"
                            }}>
                                1학기 동안 학습한 내용을 바탕으로, 약 2달간 팀별로 몰입하여 자신들만의 독창적인 창업 아이템을 구체화합니다. <br />
                                창업 아이템을 메이저 VC 하우스 투자심사역 앞에서 발표하고 최종 창업 진행 여부를
                                결정합니다. <br />
                                해당 과정에서 받은 투자심사역 분들의 피드백과 알럼나이 분들의 도움과 함께 학회 이후의
                                후속 창업 여부를 결정합니다.
                            </p>
                        </S.SessionInfoBox>

                        {/* 4. Animation */}
                        <div style={{ width: "100%", marginTop: "60px", display: "flex", justifyContent: "center" }}>
                            <S.SessionImgBox isMobile={isMobile} style={{ display: "flex", gap: "20px" }}>
                                <DemodayInHouseLottie />
                                <DemodayFinalLottie />
                            </S.SessionImgBox>
                        </div>

                    </S.MainContainer>
                </S.Container>
            )}
        </>
    );
}