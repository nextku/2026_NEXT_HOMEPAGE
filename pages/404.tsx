import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

import * as S from "styles/member/style";

/**
 * 없는 주소.
 *
 * 직접 만들지 않으면 Next 의 기본 화면이 나온다. 그 화면은 검은 바탕에 영문
 * 한 줄이라, 헤더가 깔아둔 흰 그라데이션이 그 위에 얹혀 얼룩처럼 보였다.
 * 사이트와 같은 바탕을 쓰면 그 문제가 함께 사라진다.
 *
 * 옛 주소로 들어온 경우가 대부분이므로 돌아갈 곳을 준다.
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>페이지를 찾을 수 없습니다 | 고려대학교 소프트웨어 창업학회 NEXT</title>
        <meta name="robots" content="noindex" />
      </Head>

      <S.PageCenter>
        <S.Narrow>
          <S.Intro>
            <h1>페이지를 찾을 수 없습니다</h1>
            <p>
              주소가 바뀌었거나 사라진 페이지입니다. 아래에서 다시 찾아보세요.
            </p>
          </S.Intro>

          <S.Actions>
            <S.Approve type="button" onClick={() => router.push("/home")}>
              홈으로
            </S.Approve>
            <S.Reject type="button" onClick={() => router.push("/activities")}>
              활동 보기
            </S.Reject>
          </S.Actions>
        </S.Narrow>
      </S.PageCenter>
    </>
  );
}
