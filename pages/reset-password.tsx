import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";

import PasswordFields from "components/member/PasswordFields";
import { updatePassword, useAuth } from "lib/supabase/useAuth";
import * as S from "styles/member/style";

/**
 * 새 비밀번호 정하기.
 *
 * 재설정 메일의 링크로 들어오면 Supabase 가 그 자리에서 임시 세션을 만들어준다.
 * 그래서 여기서는 따로 본인 확인을 하지 않고 새 비밀번호만 받는다. 링크 없이
 * 주소만 치고 들어온 경우에는 세션이 없으므로 안내하고 돌려보낸다.
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

  /*
   * 주소창을 건드리지 않는다.
   *
   * 예전에는 마운트하자마자 해시를 지웠는데, 재설정 링크의 토큰이 바로 그
   * 해시에 실려 온다. Supabase 클라이언트가 그것을 읽어 세션을 만들기 전에
   * 지워버려서, 링크를 누른 순간 "유효하지 않다" 가 떴다.
   * 정리는 클라이언트가 알아서 한다.
   */

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
    if (loading) return null;

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
