import Head from "next/head";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "react-responsive";
import { Tabs } from "antd";
import { useRouter } from "next/router";
import * as S from "styles/people/style";
import { PEOPLE_ITEMS, PEOPLE_INFORMATION } from "constants/people";

// AOS 동적 로드 (SSR 방지)
const AOS = dynamic(() => import("aos"), { ssr: false });

// 멤버 및 카드뉴스 컴포넌트 동적 로딩
const Member = dynamic(() => import("./components/Member"), { ssr: false });
const Cardnews = dynamic(() => import("./components/Cardnews"), { ssr: false });

const { TEN, ELEVEN, TWELVE, THIRTEEN } = PEOPLE_ITEMS;

export default function People() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const isMobile = useMediaQuery({ query: "(max-width: 820px)" });

    useEffect(() => {
        import("aos").then((AOS) => {
            AOS.default.init();
        });
        setLoading(false);
    }, []);

    return (
        <>
            <Head>
                <title>고려대 소프트웨어 창업 학회 | NEXT 멋사 : PEOPLE</title>
            </Head>

            {!loading && (
                <S.Container isMobile={isMobile}>
                    <Tabs
                        defaultActiveKey="1"
                        centered
                        items={[
                            {
                                label: "Alumni",
                                key: "1",
                                children: <Cardnews />,
                            },
                            {
                                label: `${TEN}기`,
                                key: "2",
                                children: (
                                    <Member peopleInformation={PEOPLE_INFORMATION.filter((item) => item.gen === 10)} />
                                ),
                            },
                            {
                                label: `${ELEVEN}기`,
                                key: "3",
                                children: (
                                    <Member peopleInformation={PEOPLE_INFORMATION.filter((item) => item.gen === 11)} />
                                ),
                            },
                            {
                                label: `${TWELVE}기`,
                                key: "4",
                                children: (
                                    <Member peopleInformation={PEOPLE_INFORMATION.filter((item) => item.gen === 12)} />
                                ),
                            },
                            {
                                label: `${THIRTEEN}기`,
                                key: "5",
                                children: (
                                    <Member peopleInformation={PEOPLE_INFORMATION.filter((item) => item.gen === 13)} />
                                ),
                            },
                        ]}
                    />
                </S.Container>
            )}
        </>
    );
}
