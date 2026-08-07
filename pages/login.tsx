import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import GoogleMark from "components/member/GoogleMark";
import { isSupabaseConfigured } from "lib/supabase/client";
import { signInWithGoogle, useAuth } from "lib/supabase/useAuth";
import * as S from "styles/member/style";

/**
 * 로그인.
 *
 * 구글 로그인만 둔다. 비밀번호를 직접 받으면 그 순간부터 학회가 비밀번호를
 * 관리해야 한다. 졸업하면 학교 메일이 사라지므로 도메인 제한도 걸지 않는다.
 * 대신 로그인 뒤 운영진 승인을 한 번 거친다.
 */
export default function Login() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  // 이미 로그인한 사람이 이 화면에 남아 있을 이유가 없다.
  useEffect(() => {
    if (!loading && isLoggedIn) router.replace("/members");
  }, [loading, isLoggedIn, router]);

  const onSignIn = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch {
      // 리다이렉트가 안 됐다면 버튼을 다시 누를 수 있어야 한다.
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>학회원 로그인 | 고려대학교 소프트웨어 창업학회 NEXT</title>
        <meta name="robots" content="noindex" />
      </Head>

      <S.PageCenter>
        <S.Narrow>
          <S.Intro>
            <h1>학회원 로그인</h1>
            <p>
              NEXT 학회원에게만 공개되는 채용·투자·행사 정보를 보려면 로그인이
              필요합니다.
            </p>
          </S.Intro>

          <S.AuthCard>
            <S.GoogleButton
              type="button"
              onClick={onSignIn}
              disabled={busy || loading || !isSupabaseConfigured}
            >
              <GoogleMark />
              {busy ? "구글로 이동 중" : "구글 계정으로 계속하기"}
            </S.GoogleButton>

            {!isSupabaseConfigured && (
              <S.AuthNote>
                로그인 준비가 아직 끝나지 않았습니다. 잠시 뒤에 다시 시도해
                주세요.
              </S.AuthNote>
            )}

            <S.AuthNote>
              처음 로그인하면 기수와 학과를 확인한 뒤 운영진이 승인합니다. 승인
              전까지는 학회원 화면을 볼 수 없습니다.
            </S.AuthNote>
            <S.AuthNote>
              계속하면 <a href="/terms">이용약관</a>과{" "}
              <a href="/privacy">개인정보처리방침</a>에 동의하는 것으로 봅니다.
            </S.AuthNote>
          </S.AuthCard>
        </S.Narrow>
      </S.PageCenter>
    </>
  );
}
