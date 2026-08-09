import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

import PasswordFields from "components/member/PasswordFields";
import { GENERATIONS } from "constants/member";
import { DEPARTMENT } from "constants/people";
import { formatLeft, useAttemptLimit, useCooldown } from "lib/cooldown";
import { MIN_PASSWORD } from "lib/password";
import { isSupabaseConfigured } from "lib/supabase/client";
import {
  resendSignupCode,
  sendPasswordReset,
  signInWithPassword,
  submitProfile,
  updatePassword,
  verifyRecoveryCode,
  signUpWithPassword,
  useAuth,
  verifySignupCode,
} from "lib/supabase/useAuth";
import * as S from "styles/member/style";

/**
 * 로그인 · 가입 · 비밀번호 재설정.
 *
 * 화면 하나가 네 가지 모드를 갖는다. 각각을 따로 만들면 주소가 늘고 뒤로가기가
 * 어색해지는데, 사용자가 하는 일은 결국 "들어가기" 하나다.
 *
 * 가입할 때 확인 코드를 받는 이유는 아무 주소나 적을 수 있기 때문이다. 코드를
 * 옮겨 적었다는 사실이 그 주소의 주인이라는 증명이 된다. 확인 전에는 로그인이
 * 막힌다(Supabase 의 Confirm email 설정).
 *
 * 로그인은 "이 주소의 주인"까지만 증명한다. 학회원인지는 다음 화면에서 명단과
 * 대조하거나 운영진이 승인한다.
 */

type Mode = "signin" | "signup" | "verify" | "forgot" | "reset";

const DEPARTMENTS = Object.values(DEPARTMENT);

export default function Login() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [pwValid, setPwValid] = useState(false);
  const [code, setCode] = useState("");
  /*
   * 학회원 확인에 쓰는 값. 가입 화면에서 받아두었다가 코드 확인을 통과한
   * 직후에 낸다. 여기서 묻는 이유는 두 가지다 — 기수를 묻는 화면은 학회원이
   * 아닌 사람에게 "여기가 내 자리가 아니구나" 를 바로 알리고, 승인에 필요한
   * 것을 한 번에 받아두면 가입한 사람이 다시 무엇을 적을 필요가 없다.
   */
  const [name, setName] = useState("");
  const [generation, setGeneration] = useState("");
  const [department, setDepartment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);

  /*
   * 연타와 무차별 대입 막기.
   *
   * 발송은 주소마다 60초를 둔다. 같은 주소로 메일이 쏟아지는 것을 막기 위해
   * 주소를 키로 삼는다 — 화면 단위로 두면 주소만 바꿔 계속 보낼 수 있다.
   * 이 값들은 Supabase 의 Rate limits 와 SMTP 최소 간격이 실제로 강제하는
   * 것을 화면에 미리 비춰줄 뿐이다.
   */
  const mailKey = `send_${email.trim().toLowerCase()}`;
  const sendCool = useCooldown(mailKey, 60);
  const codeTries = useAttemptLimit("code", 5, 120);
  const loginTries = useAttemptLimit("signin", 5, 60);

  useEffect(() => {
    if (!loading && isLoggedIn) router.replace("/members");
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    if (mode === "verify") codeRef.current?.focus();
  }, [mode]);

  const go = (next: Mode) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  const run = async (fn: () => Promise<string | null>, after?: () => void) => {
    if (busy) return;
    setBusy(true);
    setError("");
    const err = await fn();
    if (err) setError(err);
    else after?.();
    setBusy(false);
  };

  const onSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginTries.locked) return;
    run(
      async () => {
        const err = await signInWithPassword(email, password);
        if (err) {
          const n = loginTries.fail();
          if (n >= 3) return `${err} (${n}번 틀렸습니다)`;
          return err;
        }
        loginTries.reset();
        return null;
      },
      () => router.replace("/members"),
    );
  };

  const onSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    /*
     * 화면의 규칙 표시와 같은 판단을 여기서 한 번 더 한다. 표시는 안내일 뿐
     * 제출을 막지는 않기 때문이다. 물론 이것도 방어선은 아니다 —
     * 최소 길이는 Supabase 설정이 최종적으로 강제한다.
     */
    if (!name.trim() || !generation || !department.trim()) {
      setError("이름과 기수, 학과를 모두 적어주세요.");
      return;
    }
    if (!pwValid) {
      setError("아래 조건을 모두 채운 뒤 다시 눌러주세요.");
      return;
    }
    run(
      () => signUpWithPassword(email, password),
      () => {
        sendCool.start();
        setCode("");
        setMode("verify");
        setNotice("");
      },
    );
  };

  const onVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeTries.locked) return;
    run(
      async () => {
        const err = await verifySignupCode(email, code);
        if (err) {
          codeTries.fail();
          return err;
        }
        codeTries.reset();
        /*
         * 확인을 통과한 지금이 로그인된 첫 순간이다. 가입 화면에서 받아둔
         * 값을 여기서 낸다. 저장에 실패해도 가입 자체는 끝난 것이므로 막지
         * 않는다 — 라운지가 빈 항목을 보고 다시 물어본다.
         */
        await submitProfile(name, Number(generation), department);
        return null;
      },
      () => router.replace("/members"),
    );
  };

  const onResend = () => {
    if (!sendCool.ready) return;
    run(
      () => resendSignupCode(email),
      () => {
        sendCool.start();
        setNotice("코드를 다시 보냈습니다.");
      },
    );
  };

  const onForgot = (e: React.FormEvent) => {
    e.preventDefault();
    run(
      () => sendPasswordReset(email),
      () => {
        sendCool.start();
        setCode("");
        setPassword("");
        setAgain("");
        setMode("reset");
      },
    );
  };

  /*
   * 코드를 확인해 잠깐의 세션을 얻은 뒤 곧바로 새 비밀번호를 저장한다.
   * 두 단계를 한 화면에서 처리하는 이유는, 코드만 넣고 멈추면 그 세션으로
   * 로그인된 채 비밀번호는 그대로인 어정쩡한 상태가 남기 때문이다.
   */
  const onReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwValid) {
      setError("아래 조건을 모두 채운 뒤 다시 눌러주세요.");
      return;
    }
    run(
      async () => {
        const bad = await verifyRecoveryCode(email, code);
        if (bad) return bad;
        return updatePassword(password);
      },
      () => router.replace("/members"),
    );
  };

  const heading =
    mode === "signup"
      ? "학회원 계정 만들기"
      : mode === "verify"
        ? "메일 확인"
        : mode === "forgot"
          ? "비밀번호 재설정"
          : mode === "reset"
            ? "새 비밀번호"
            : "학회원 로그인";

  const lead =
    mode === "signup"
      ? "NEXT 학회원이 쓰는 공간입니다. 적어주신 기수와 이름을 운영진이 명단과 대조한 뒤 승인합니다."
      : mode === "verify"
        ? `${email} 로 여섯 자리 코드를 보냈습니다.`
        : mode === "forgot"
          ? "가입한 주소를 적어주시면 재설정 코드를 보내드립니다."
          : mode === "reset"
            ? `${email} 로 여섯 자리 코드를 보냈습니다.`
            : "NEXT 학회원에게만 공개되는 채용·투자·행사 정보를 보려면 로그인이 필요합니다.";

  const emailField = (
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
      {mode === "signup" && (
        <small>
          졸업 후에도 쓰는 주소로 넣어주세요. 학교 메일은 졸업하면 사라집니다.
        </small>
      )}
    </S.Field>
  );

  return (
    <>
      <Head>
        <title>학회원 로그인 | 고려대학교 소프트웨어 창업학회 NEXT</title>
        <meta name="robots" content="noindex" />
      </Head>

      <S.PageCenter>
        <S.Narrow>
          <S.Intro>
            <h1>{heading}</h1>
            <p>{lead}</p>
          </S.Intro>

          {mode === "signin" && (
            <S.AuthCard as="form" onSubmit={onSignIn}>
              {emailField}
              <S.Field>
                <span>비밀번호</span>
                <S.Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </S.Field>

              {error && <S.Notice $bad>{error}</S.Notice>}
              {notice && <S.Notice>{notice}</S.Notice>}

              {loginTries.locked && (
                <S.Notice $bad>
                  여러 번 틀렸습니다. {formatLeft(loginTries.left)} 후에 다시
                  시도해 주세요.
                </S.Notice>
              )}

              <S.Submit
                type="submit"
                disabled={busy || !isSupabaseConfigured || loginTries.locked}
              >
                {busy
                  ? "확인 중"
                  : loginTries.locked
                    ? `${formatLeft(loginTries.left)} 후 다시 시도`
                    : "로그인"}
              </S.Submit>

              <S.AuthNote>
                계정이 없으신가요?{" "}
                <S.LinkButton type="button" onClick={() => go("signup")}>
                  가입하기
                </S.LinkButton>
                {" · "}
                <S.LinkButton type="button" onClick={() => go("forgot")}>
                  비밀번호를 잊으셨나요?
                </S.LinkButton>
              </S.AuthNote>
            </S.AuthCard>
          )}

          {mode === "signup" && (
            <S.AuthCard as="form" onSubmit={onSignUp}>
              {emailField}

              <S.Field>
                <span>이름</span>
                <S.Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="김넥스트"
                  autoComplete="name"
                  maxLength={20}
                  required
                  disabled={!isSupabaseConfigured}
                />
                <small>명단에 있는 이름 그대로 적어주세요.</small>
              </S.Field>

              <S.FieldRow>
                <S.Field>
                  <span>기수</span>
                  <S.Select
                    value={generation}
                    onChange={(e) => setGeneration(e.target.value)}
                    required
                    disabled={!isSupabaseConfigured}
                  >
                    <option value="" disabled>
                      선택
                    </option>
                    {GENERATIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}기
                      </option>
                    ))}
                  </S.Select>
                </S.Field>

                <S.Field>
                  <span>학과</span>
                  <S.Input
                    list="ku-departments"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="컴퓨터학과"
                    maxLength={30}
                    required
                    disabled={!isSupabaseConfigured}
                  />
                  <datalist id="ku-departments">
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </S.Field>
              </S.FieldRow>

              <PasswordFields
                email={email}
                password={password}
                onPassword={setPassword}
                again={again}
                onAgain={setAgain}
                onValidChange={setPwValid}
              />

              {error && <S.Notice $bad>{error}</S.Notice>}

              <S.Submit
                type="submit"
                disabled={
                  busy || !isSupabaseConfigured || !pwValid || !sendCool.ready
                }
              >
                {busy
                  ? "보내는 중"
                  : !sendCool.ready
                    ? `${formatLeft(sendCool.left)} 후 다시 보낼 수 있습니다`
                    : "인증 코드 받기"}
              </S.Submit>

              <S.AuthNote>
                이미 계정이 있으신가요?{" "}
                <S.LinkButton type="button" onClick={() => go("signin")}>
                  로그인
                </S.LinkButton>
              </S.AuthNote>
              <S.AuthNote>
                계속하면 <a href="/terms">이용약관</a>과{" "}
                <a href="/privacy">개인정보처리방침</a>에 동의하는 것으로
                봅니다.
              </S.AuthNote>
            </S.AuthCard>
          )}

          {mode === "verify" && (
            <S.AuthCard as="form" onSubmit={onVerify}>
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
              {notice && <S.Notice>{notice}</S.Notice>}
              {codeTries.locked && (
                <S.Notice $bad>
                  여러 번 틀렸습니다. {formatLeft(codeTries.left)} 후에 다시
                  시도해 주세요.
                </S.Notice>
              )}

              <S.Submit
                type="submit"
                disabled={busy || code.length < 6 || codeTries.locked}
              >
                {busy
                  ? "확인 중"
                  : codeTries.locked
                    ? `${formatLeft(codeTries.left)} 후 다시 시도`
                    : "확인하고 시작하기"}
              </S.Submit>

              <S.AuthNote>
                <S.LinkButton
                  type="button"
                  onClick={onResend}
                  disabled={busy || !sendCool.ready}
                >
                  {sendCool.ready
                    ? "코드 다시 받기"
                    : `${formatLeft(sendCool.left)} 후 다시 받기`}
                </S.LinkButton>
                {" · "}
                <S.LinkButton type="button" onClick={() => go("signup")}>
                  주소 고치기
                </S.LinkButton>
              </S.AuthNote>
            </S.AuthCard>
          )}

          {mode === "forgot" && (
            <S.AuthCard as="form" onSubmit={onForgot}>
              {emailField}

              {error && <S.Notice $bad>{error}</S.Notice>}
              {notice && <S.Notice>{notice}</S.Notice>}

              <S.Submit
                type="submit"
                disabled={busy || !isSupabaseConfigured || !sendCool.ready}
              >
                {busy
                  ? "보내는 중"
                  : !sendCool.ready
                    ? `${formatLeft(sendCool.left)} 후 다시 보낼 수 있습니다`
                    : "재설정 코드 받기"}
              </S.Submit>

              <S.AuthNote>
                <S.LinkButton type="button" onClick={() => go("signin")}>
                  로그인으로 돌아가기
                </S.LinkButton>
              </S.AuthNote>
            </S.AuthCard>
          )}

          {mode === "reset" && (
            <S.AuthCard as="form" onSubmit={onReset}>
              <S.Field>
                <span>인증 코드</span>
                <S.CodeInput
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

              <PasswordFields
                email={email}
                password={password}
                onPassword={setPassword}
                again={again}
                onAgain={setAgain}
                onValidChange={setPwValid}
              />

              {error && <S.Notice $bad>{error}</S.Notice>}

              {codeTries.locked && (
                <S.Notice $bad>
                  여러 번 틀렸습니다. {formatLeft(codeTries.left)} 후에 다시
                  시도해 주세요.
                </S.Notice>
              )}

              <S.Submit
                type="submit"
                disabled={
                  busy || code.length < 6 || !pwValid || codeTries.locked
                }
              >
                {busy
                  ? "바꾸는 중"
                  : codeTries.locked
                    ? `${formatLeft(codeTries.left)} 후 다시 시도`
                    : "비밀번호 바꾸기"}
              </S.Submit>

              <S.AuthNote>
                <S.LinkButton
                  type="button"
                  onClick={() => go("forgot")}
                  disabled={!sendCool.ready}
                >
                  {sendCool.ready
                    ? "코드 다시 받기"
                    : `${formatLeft(sendCool.left)} 후 다시 받기`}
                </S.LinkButton>
              </S.AuthNote>
            </S.AuthCard>
          )}
        </S.Narrow>
      </S.PageCenter>
    </>
  );
}
