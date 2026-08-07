import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import PasswordFields from "components/member/PasswordFields";
import { createClient } from "lib/supabase/client";
import { updatePassword, useAuth } from "lib/supabase/useAuth";
import * as S from "styles/member/style";

/**
 * 새 비밀번호 정하기.
 *
 * 메일의 링크는 ?token_hash=... 를 달고 들어온다. 그 값을 verifyOtp 에 넘기면
 * 서버가 검증해 세션을 만들어준다. 브라우저에 미리 저장된 것이 필요 없으므로
 * 컴퓨터에서 요청하고 휴대폰에서 열어도 그대로 열린다.
 *
 * 처음에는 이것을 PKCE 링크로 두었는데, 그 방식은 요청한 브라우저에만 있는
 * 검증값을 쓴다. 메일을 다른 기기에서 여는 흔한 경우에 반드시 실패했다.
 */

export default function ResetPassword() {
  const router = useRouter();
  const { session, loading } = useAuth();

  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [pwValid, setPwValid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  // 주소에 토큰이 실려 왔다면 그것부터 검증한다. 끝나기 전에는 판단하지 않는다.
  const [exchanging, setExchanging] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenHash = url.searchParams.get("token_hash");

    if (!tokenHash) {
      setExchanging(false);
      return;
    }

    createClient()
      .auth.verifyOtp({ token_hash: tokenHash, type: "recovery" })
      .then(() => {
        // 검증이 끝난 뒤에 지운다. 먼저 지우면 읽을 것이 없어진다.
        window.history.replaceState(null, "", url.pathname);
        setExchanging(false);
      });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    // 규칙과 일치 여부는 아래 칸들이 실시간으로 판단한다. 여기서는 그 결과만 본다.
    if (!pwValid) {
      setError("아래 조건을 모두 채운 뒤 다시 눌러주세요.");
      return;
    }

    setBusy(true);
    setError("");
    const err = await updatePassword(password);
    if (err) setError(err);
    else setDone(true);
    setBusy(false);
  };

  const body = () => {
    if (loading || exchanging) return null;

    if (!session) {
      return (
        <>
          <S.Intro>
            <h1>이 링크로는 열 수 없습니다</h1>
            <p>
              재설정 링크는 요청한 그 브라우저에서만 열립니다. 컴퓨터에서
              요청하고 휴대폰 메일 앱에서 열면 이 화면이 나옵니다.
            </p>
            <p>
              메일에 함께 적힌 <b>여섯 자리 코드</b>를 쓰면 어느 기기에서든 바꿀
              수 있습니다.
            </p>
          </S.Intro>
          <S.Actions>
            <S.Approve type="button" onClick={() => router.replace("/login")}>
              코드로 비밀번호 바꾸기
            </S.Approve>
          </S.Actions>
        </>
      );
    }

    if (done) {
      return (
        <>
          <S.Intro>
            <h1>비밀번호를 바꿨습니다</h1>
            <p>새 비밀번호로 계속 이용하시면 됩니다.</p>
          </S.Intro>
          <S.Actions>
            <S.Approve type="button" onClick={() => router.replace("/members")}>
              학회원 라운지로
            </S.Approve>
          </S.Actions>
        </>
      );
    }

    return (
      <>
        <S.Intro>
          <h1>새 비밀번호</h1>
          <p>앞으로 이 비밀번호로 로그인합니다.</p>
        </S.Intro>

        <S.AuthCard as="form" onSubmit={submit}>
          <PasswordFields
            email={session?.user?.email ?? undefined}
            password={password}
            onPassword={setPassword}
            again={again}
            onAgain={setAgain}
            onValidChange={setPwValid}
          />

          {error && <S.Notice $bad>{error}</S.Notice>}

          <S.Submit type="submit" disabled={busy || !pwValid}>
            {busy ? "저장 중" : "비밀번호 바꾸기"}
          </S.Submit>
        </S.AuthCard>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>비밀번호 재설정 | 고려대학교 소프트웨어 창업학회 NEXT</title>
        <meta name="robots" content="noindex" />
      </Head>
      <S.PageCenter>
        <S.Narrow>{body()}</S.Narrow>
      </S.PageCenter>
    </>
  );
}
