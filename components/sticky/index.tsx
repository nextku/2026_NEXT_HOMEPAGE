import React, { useEffect } from "react";
import AOS from "aos";
import Image from "next/image";
import "aos/dist/aos.css";
import * as S from "styles/components/sticky/style";
import { useMediaQuery } from "react-responsive";
// import homecoming from "public/assets/homecoming.jpg";
import Demoday from "public/images/next13/demoday.png";
import { Fade } from "react-awesome-reveal";
import Slick from "components/slick/index";
import Logo from "public/assets/logo.png";
import { useRouter } from "next/router";
export default function Sticky() {
    const isDesktop = useMediaQuery({ minDeviceWidth: 820 });
    const isMobile = useMediaQuery({ maxWidth: 820 });
    const router = useRouter();

    useEffect(() => {
        AOS.init();
    });

    return (
        <S.StickyContainer>
            <S.StickyContent isMobile={isMobile}>
                <S.TextWrapper isMobile={isMobile}>
                    <span>
                        <b data-aos="fade-up">Our Vision</b>
                    </span>
                    <p style={{ fontWeight: "700" }}>
                        <span data-aos="fade">
                            <big style={{ fontSize: "4.7rem", fontWeight: "900" }}>우리는 믿습니다.</big>
                        </span>
                        <br />
                        <span data-aos="fade" style={{ fontWeight: "500" }}>
                            10년 안에 이곳에서 <b style={{ color: "white", fontWeight: "900" }}>유니콘</b> 🦄이 탄생할
                            것이라고.
                        </span>
                    </p>
                    <p>
                        <span data-aos="fade">
                            이곳
                            <S.NextInlineLogo src={Logo.src} width="100px" />
                            에서는
                        </span>
                        <br />
                        <span data-aos="fade">
                            다양한 스타트업이 만들어졌으며, IT 업계 전반에 많은 Alumni들이 진출해 있습니다.
                        </span>
                    </p>
                </S.TextWrapper>
                <Slick></Slick>
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
                        onClick={() => router.push("people")}
                        // data-aos="fade"
                    >
                        + More Info
                    </S.MoreBtn>
                </div>
            </S.StickyContent>
            <S.Sticky isMobile={isMobile}>
                <Image src={Demoday} alt="2025 Demoday" width={600} height={400} priority fetchPriority="high" />
            </S.Sticky>
        </S.StickyContainer>
    );
}
