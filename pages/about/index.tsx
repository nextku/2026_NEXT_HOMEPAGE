import Head from "next/head";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "react-responsive";
import { Tabs } from "antd";
import { useRouter } from "next/router";
import { track } from "lib/analytics";
import * as S from "styles/about/style";
import { ABOUT_ITEMS } from "constants/about";

// AOS 동적 로드 (SSR 방지)
const AOS = dynamic(() => import("aos"), { ssr: false });

// 각 섹션을 `dynamic import`로 최적화
const Partners = dynamic(() => import("components/about/partners"), {
  ssr: false,
});
const Introduction = dynamic(() => import("components/about/introduction"), {
  ssr: false,
});
const Greeting = dynamic(() => import("components/about/greeting"), {
  ssr: false,
});
const History = dynamic(() => import("components/about/history"), {
  ssr: false,
});
const Achievement = dynamic(() => import("components/about/achievement"), {
  ssr: false,
});

const { GREETING, HISTORY, ACHIEVEMENT, PARTNERS } = ABOUT_ITEMS;

/* 어느 탭이 실제로 읽히는지 운영진 화면에서 보기 위한 키-이름 대응. */
const TAB_LABELS: Record<string, string> = {
  "1": GREETING,
  "2": HISTORY,
  "3": ACHIEVEMENT,
  "4": PARTNERS,
};

export default function About() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery({ query: "(max-width: 820px)" });
  const isTabCenter = useMediaQuery({ query: "(min-width: 500px)" });

  const [viewKey, setViewKey] = useState<string>("1");

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
    if (router.query.key) {
      setViewKey(router.query.key as string);
    }
  }, [router.query.key]);

  // 어느 탭이 실제로 읽히는지. 첫 표시도 한 번 센다.
  useEffect(() => {
    if (loading) return;
    track("tab_view", { path: "/about", tab: TAB_LABELS[viewKey] });
  }, [viewKey, loading]);

  return (
    <>
      <Head>
        <title>고려대 소프트웨어 창업 학회 | NEXT : ABOUT US</title>
      </Head>

      {!loading && (
        <S.Container isMobile={isMobile}>
          <Tabs
            defaultActiveKey={"1"}
            activeKey={viewKey}
            onChange={(key) => setViewKey(key)}
            centered={isTabCenter}
            items={[
              {
                label: GREETING,
                key: "1",
                children: <Greeting />,
              },
              {
                label: HISTORY,
                key: "2",
                children: <History />,
              },
              {
                label: ACHIEVEMENT,
                key: "3",
                children: <Achievement />,
              },
              {
                label: PARTNERS,
                key: "4",
                children: <Partners />,
              },
            ]}
          />
        </S.Container>
      )}
    </>
  );
}
