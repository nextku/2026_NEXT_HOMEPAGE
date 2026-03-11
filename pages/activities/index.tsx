import Head from "next/head";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "react-responsive";
import { Tabs } from "antd";
import { useRouter } from "next/router";
import * as S from "styles/activities/style";
import { ACTIVITY_ITEMS } from "constants/activities";

// AOS 동적 로드 (SSR 방지)
const AOS = dynamic(() => import("aos"), { ssr: false });

// 각 섹션을 `dynamic import`로 최적화
const Curriculum = dynamic(() => import("./components/curriculum"), { ssr: false });
const Session = dynamic(() => import("./components/session"), { ssr: false });
const Project = dynamic(() => import("./components/project"), { ssr: false });
const Demoday = dynamic(() => import("./components/demoday"), { ssr: false });

const { CURRICULUM, SESSION, PROJECT, DEMODAY } = ACTIVITY_ITEMS;

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
