import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as S from "styles/activities/components/whynext/style";

/**
 * Why NEXT — 왜 NEXT 에 들어와야 하는지를 설명하는 포스터 연작.
 *
 * 포스터는 이미 완성된 디자인이므로 위에 아무것도 더하지 않는다.
 * 이 컴포넌트가 하는 일은 순서를 정하고, 스크롤에 맞춰 한 장씩 드러내는 것뿐이다.
 *
 * 등장 처리는 IntersectionObserver 로 직접 한다. docs/reference.md 의
 * in-view 컴포넌트는 framer-motion 의 useInView 를 쓰는데 그 훅은 v9 부터라
 * 이 저장소(8.5.4)에서는 동작하지 않는다.
 */

/*
 * 포스터 옆에 붙는 글.
 *
 * 포스터는 "NEXT 가 무엇을 주는가" 를 말한다. 같은 말을 옆에 또 쓰면 읽을 이유가
 * 없어지므로, 이 글은 "지원자가 지금 하고 있을 고민" 을 짚는다.
 * 포스터가 그 고민에 대한 답이 되는 구조다.
 *
 * 포스터 헤드라인(중복 금지 대상)
 *   1 체계적인 커리큘럼으로 제대로 배우는 창업
 *   2 변화에 맞춘 개발 세션
 *   3 말이 아니라 실전으로
 *   4 가장 가까이에서 듣는 현장의 이야기
 *   5 같은 방향을 보는 사람들과 쌓이는 관계
 */
const POSTERS = [
  {
    n: 1,
    title: "어디서부터 시작할지 모르겠다면",
    body: "창업을 해보고 싶은데 첫 단추가 뭔지 모르는 상태. 대부분 여기서 멈춥니다. 무엇을 언제 하는지가 정해져 있으면 그 지점을 넘어갈 수 있습니다.",
  },
  {
    n: 2,
    title: "만들 사람을 구하지 못해 멈추는 대신",
    body: "아이디어는 있는데 개발자가 없어서 접는 팀이 많습니다. 직접 만들 수 있으면 남에게 맡기지 않아도 되고, 맡기더라도 무엇을 요구할지 알게 됩니다.",
  },
  {
    n: 3,
    title: "발표로 끝나지 않습니다",
    body: "슬라이드까지만 만들고 끝나는 활동과, 실제로 손님 앞에 내놓는 활동은 남는 것이 다릅니다. 여기서는 후자를 합니다.",
  },
  {
    n: 4,
    title: "이미 겪어본 사람에게 묻는 시간",
    body: "검색으로는 안 나오는 것들이 있습니다. 왜 그 결정을 했는지, 무엇이 틀렸는지는 겪어본 사람만 말해줄 수 있습니다.",
  },
  {
    n: 5,
    title: "혼자였다면 하지 않았을 시도",
    body: "창업은 결국 사람과 하는 일입니다. 활동이 끝나도 같은 방향을 보던 사람들은 남고, 그게 다음 시도의 출발점이 됩니다.",
  },
].map((p) => ({
  ...p,
  src: `/images/why-next/Why NEXT ${p.n}.jpg`,
  alt: `NEXT 를 선택해야 하는 이유 ${p.n}`,
}));

function useRevealed<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 관찰이 불가능한 환경에서는 그냥 보여준다. 모션은 강조일 뿐 존재 조건이 아니다.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setShown(true);
          io.unobserve(entry.target);
        });
      },
      // 화면 아래에서 조금 일찍 시작해야 스크롤을 따라잡는 느낌이 난다.
      { rootMargin: "0px 0px -14% 0px", threshold: 0.05 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, shown };
}

function Poster({
  src,
  alt,
  title,
  body,
  flip,
  priority,
}: {
  src: string;
  alt: string;
  title: string;
  body: string;
  flip: boolean;
  priority: boolean;
}) {
  const { ref, shown } = useRevealed<HTMLDivElement>();

  return (
    <S.Item ref={ref} $shown={shown} $flip={flip}>
      <S.Aside>
        <h3>{title}</h3>
        <p>{body}</p>
      </S.Aside>
      <S.Frame data-frame>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 60rem) 100vw, 580px"
          priority={priority}
        />
      </S.Frame>
    </S.Item>
  );
}

export default function WhyNext() {
  return (
    <S.Section>
      <S.Intro>
        <h2>왜 NEXT 인가</h2>
        <p>
          {/*
            '담았습니다' 처럼 콘텐츠 자체를 소개하는 말투는 힘이 들어가 오글거린다.
            다른 곳과 비교하는 말도 깎아내리는 톤이 된다. 사실만 적는다.
          */}
          한 해 동안 무엇을 하고, 무엇이 남는지.
        </p>
      </S.Intro>

      <S.List>
        {POSTERS.map((poster, i) => (
          <Poster
            key={poster.src}
            src={poster.src}
            alt={poster.alt}
            title={poster.title}
            body={poster.body}
            flip={i % 2 === 1}
            /* 첫 장만 먼저 받아온다. 다섯 장을 한꺼번에 받으면 초기 로딩이 무거워진다. */
            priority={i === 0}
          />
        ))}
      </S.List>
    </S.Section>
  );
}
