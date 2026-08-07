import Head from "next/head";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "react-responsive";
import { Tabs } from "antd";
import { useRouter } from "next/router";
import { track } from "lib/analytics";
import * as S from "styles/activities/style";
import { ACTIVITY_ITEMS } from "constants/activities";

// AOS 동적 로드 (SSR 방지)
const AOS = dynamic(() => import("aos"), { ssr: false });

// 각 섹션을 `dynamic import`로 최적화
const Curriculum = dynamic(() => import("components/activities/curriculum"), {
  ssr: false,
});
const Session = dynamic(() => import("components/activities/session"), {
  ssr: false,
});
const Project = dynamic(() => import("components/activities/project"), {
  ssr: false,
});
const Demoday = dynamic(() => import("components/activities/demoday"), {
  ssr: false,
});
const WhyNext = dynamic(() => import("components/activities/whynext"), {
  ssr: false,
});

const { CURRICULUM, SESSION, PROJECT, DEMODAY, WHY_NEXT } = ACTIVITY_ITEMS;

/* 어느 탭이 실제로 읽히는지 운영진 화면에서 보기 위한 키-이름 대응. */
const TAB_LABELS: Record<string, string> = {
  "1": CURRICULUM,
  "5": WHY_NEXT,
  "2": SESSION,
  "3": PROJECT,
  "4": DEMODAY,
};

export default function Activities() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery({ query: "(max-width: 820px)" });
  const isTabCenter = useMediaQuery({ query: "(min-width: 381px)" });

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
    track("tab_view", { path: "/activities", tab: TAB_LABELS[viewKey] });
  }, [viewKey, loading]);

  return (
    <>
      <Head>
        <title>고려대 소프트웨어 창업 학회 | NEXT : ACTIVITIES</title>
      </Head>

      {!loading && (
        <S.Container isMobile={isMobile}>
          <Tabs
            defaultActiveKey="1"
            activeKey={viewKey}
            onChange={(key) => setViewKey(key)}
            centered={isTabCenter}
            items={[
              {
                label: CURRICULUM,
                key: "1",
                children: <Curriculum />,
              },
              {
                /*
                 * 키는 5 로 새로 붙인다. 기존 1~4 를 밀면 ?key=N 딥링크가 다른 탭을
                 * 가리키게 된다. 표시 순서만 커리큘럼 다음으로 둔다.
                 */
                label: WHY_NEXT,
                key: "5",
                children: <WhyNext />,
              },
              {
                label: SESSION,
                key: "2",
                children: <Session />,
              },
              {
                label: PROJECT,
                key: "3",
                children: <Project />,
              },
              {
                label: DEMODAY,
                key: "4",
                children: <Demoday />,
              },
            ]}
          />
        </S.Container>
      )}
    </>
  );
}
