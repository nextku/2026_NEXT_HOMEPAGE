import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

import { isSupabaseConfigured } from "lib/supabase/client";
import { sendEmailCode, useAuth, verifyEmailCode } from "lib/supabase/useAuth";
import * as S from "styles/member/style";

/**
 * 학회원 로그인.
 *
 * 메일로 여섯 자리 코드를 보내고 그 코드를 받는다. 비밀번호는 받지 않는다 —
 * 받는 순간 학회가 그것을 보관하고 재설정까지 책임져야 한다. 코드를 옮겨
 * 적었다는 사실이 그 주소의 주인이라는 증명이므로 인증 단계도 이것 하나면 된다.
 *
 * 로그인은 "이 주소의 주인"까지만 증명한다. 학회원인지는 그다음 화면에서
 * 명단과 대조하거나 운영진이 승인한다.
 */
export default function Login() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && isLoggedIn) router.replace("/members");
  }, [loading, isLoggedIn, router]);

  // 코드 화면으로 넘어가면 바로 칠 수 있게 커서를 옮긴다.
  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    const err = await sendEmailCode(email);
    if (err) {
      setError(
        "코드를 보내지 못했습니다. 주소를 확인하고 잠시 후 다시 시도해 주세요.",
      );
    } else {
      setStep("code");
      setCode("");
    }
    setBusy(false);
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    const err = await verifyEmailCode(email, code);
    if (err) {
      setError("코드가 맞지 않거나 만료됐습니다. 다시 받아주세요.");
      setBusy(false);
      return;
    }
    // 세션이 생기면 위 useEffect 가 /members 로 보낸다.
    router.replace("/members");
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
              {step === "email"
                ? "NEXT 학회원에게만 공개되는 채용·투자·행사 정보를 보려면 로그인이 필요합니다."
                : `${email} 로 여섯 자리 코드를 보냈습니다.`}
            </p>
          </S.Intro>

          {step === "email" ? (
            <S.AuthCard as="form" onSubmit={requestCode}>
              <S.Field>
                <span>이메일</span>
                <S.Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  disabled={!isSupabaseConfigured}
                />
                <small>
                  졸업 후에도 쓰는 주소로 넣어주세요. 학교 메일은 졸업하면
                  사라집니다.
                </small>
              </S.Field>

              {error && <S.Notice $bad>{error}</S.Notice>}

              <S.Submit type="submit" disabled={busy || !isSupabaseConfigured}>
                {busy ? "보내는 중" : "인증 코드 받기"}
              </S.Submit>

              <S.AuthNote>
                비밀번호는 없습니다. 로그인할 때마다 메일로 코드를 보냅니다.
              </S.AuthNote>
              <S.AuthNote>
                계속하면 <a href="/terms">이용약관</a>과{" "}
                <a href="/privacy">개인정보처리방침</a>에 동의하는 것으로
                봅니다.
              </S.AuthNote>
            </S.AuthCard>
          ) : (
            <S.AuthCard as="form" onSubmit={submitCode}>
              <S.Field>
                <span>인증 코드</span>
                <S.CodeInput
                  ref={codeRef}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                />
                <small>메일이 안 보이면 스팸함도 확인해 주세요.</small>
              </S.Field>

              {error && <S.Notice $bad>{error}</S.Notice>}

              <S.Submit type="submit" disabled={busy || code.length < 6}>
                {busy ? "확인 중" : "로그인"}
              </S.Submit>

              <S.Foot>
                <S.SignOut
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError("");
                  }}
                >
                  다른 주소로 받기
                </S.SignOut>
              </S.Foot>
            </S.AuthCard>
          )}
        </S.Narrow>
      </S.PageCenter>
    </>
  );
}
