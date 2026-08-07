import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { updatePassword, useAuth } from "lib/supabase/useAuth";
import * as S from "styles/member/style";

/**
 * 새 비밀번호 정하기.
 *
 * 재설정 메일의 링크로 들어오면 Supabase 가 그 자리에서 임시 세션을 만들어준다.
 * 그래서 여기서는 따로 본인 확인을 하지 않고 새 비밀번호만 받는다. 링크 없이
 * 주소만 치고 들어온 경우에는 세션이 없으므로 안내하고 돌려보낸다.
 */

const MIN_PASSWORD = 8;

export default function ResetPassword() {
  const router = useRouter();
  const { session, loading } = useAuth();

  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // 링크에 담겨 온 토큰은 주소창에 남는다. 어깨너머로 보이지 않게 지운다.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    if (password.length < MIN_PASSWORD) {
      setError(`비밀번호는 ${MIN_PASSWORD}자 이상이어야 합니다.`);
      return;
    }
    if (password !== again) {
      setError("두 번 입력한 비밀번호가 서로 다릅니다.");
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
            <h1>링크가 유효하지 않습니다</h1>
            <p>
              재설정 링크가 만료됐거나 이미 사용된 것 같습니다. 다시 받아주세요.
            </p>
          </S.Intro>
          <S.Actions>
            <S.Approve type="button" onClick={() => router.replace("/login")}>
              재설정 링크 다시 받기
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
          <S.Field>
            <span>새 비밀번호</span>
            <S.Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={MIN_PASSWORD}
              required
            />
            <small>{MIN_PASSWORD}자 이상</small>
          </S.Field>

          <S.Field>
            <span>한 번 더</span>
            <S.Input
              type="password"
              value={again}
              onChange={(e) => setAgain(e.target.value)}
              autoComplete="new-password"
              required
            />
          </S.Field>

          {error && <S.Notice $bad>{error}</S.Notice>}

          <S.Submit type="submit" disabled={busy}>
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
