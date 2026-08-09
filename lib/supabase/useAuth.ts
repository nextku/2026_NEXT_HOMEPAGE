import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { markInternal } from "lib/analytics";
import { createClient, isSupabaseConfigured } from "./client";

export type MemberStatus = "pending" | "approved" | "rejected";
export type MemberRole = "member" | "admin";

export type Profile = {
  id: string;
  email: string;
  name: string;
  generation: number | null;
  department: string | null;
  /** 학회 내 직책. 비어 있으면 일반 학회원. */
  title: string | null;
  /** 그 직책을 맡은 기수. 입회 기수와 다를 수 있다(14기로 들어와 15기 운영진). */
  staff_generation: number | null;
  status: MemberStatus;
  role: MemberRole;
  /** 학회 공용 관리자 계정. 항상 한 명이고 권한 이전으로만 바뀐다. */
  is_owner: boolean;
  created_at: string;
  reject_note: string | null;
};

/**
 * 로그인 상태와 프로필을 함께 읽는다.
 *
 * 세션만으로는 부족하다. 로그인했다는 사실과 학회원으로 승인됐다는 사실은
 * 별개이고, 화면 대부분은 후자를 기준으로 갈린다.
 *
 * 여기서 하는 판단은 화면 표시용이다. 실제 접근 제어는 RLS 가 하므로,
 * 이 훅을 우회해 요청을 보내도 데이터는 나오지 않는다.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // 쿼리가 실패한 것인지, 행이 없는 것인지 화면이 구분해서 안내해야 한다.
  const [profileError, setProfileError] = useState<string | null>(null);
  // 신청서를 내면 status 가 바뀌므로 프로필만 다시 읽을 방법이 필요하다.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // 환경변수가 없는 환경(설정 전 배포 등)에서 훅이 화면을 통째로 죽이지
    // 않게 한다. 안내는 로그인 화면이 한다.
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let alive = true;

    const loadProfile = async (userId: string) => {
      /*
       * maybeSingle 을 쓴다. single 은 행이 없을 때도 오류를 만들어서,
       * "행이 없음" 과 "쿼리가 실패함" 이 구분되지 않는다. 이 둘은 원인이
       * 전혀 다르다 — 앞은 세션이 낡은 것이고, 뒤는 정책이나 테이블 문제다.
       */
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!alive) return;
      setProfile((data as Profile) ?? null);
      setProfileError(error ? error.message : null);
    };

    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      // 로그인한 적 있는 브라우저의 방문은 통계에서 뺀다. 우리 사람이 자주
      // 들어와 확인하는데 그것까지 세면 밖에서 온 사람 수를 알 수 없다.
      if (data.session) markInternal();
      setSession(data.session);
      if (data.session) await loadProfile(data.session.user.id);
      if (alive) setLoading(false);
    });

    // 다른 탭에서 로그아웃하거나 토큰이 갱신되면 여기서 따라잡는다.
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, next) => {
        if (!alive) return;
        if (next) markInternal();
        setSession(next);
        if (next) await loadProfile(next.user.id);
        else setProfile(null);
      },
    );

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [reloadKey]);

  return {
    session,
    profile,
    profileError,
    loading,
    refresh: () => setReloadKey((n) => n + 1),
    isLoggedIn: !!session,
    isApproved: profile?.status === "approved",
    // 관리자는 운영진이 하는 일을 모두 할 수 있다. DB 의 is_admin() 과 같은 판단.
    isAdmin:
      profile?.status === "approved" &&
      (profile?.role === "admin" || profile?.is_owner === true),
    isOwner: profile?.status === "approved" && profile?.is_owner === true,
  };
}

/**
 * 인증 관련 동작 모음.
 *
 * 가입은 이메일 + 비밀번호로 한다. 그런데 아무 주소나 적어서 가입할 수 있으면
 * 남의 메일로 계정을 만들 수 있으므로, 가입 직후 그 주소로 여섯 자리 코드를
 * 보내 주인임을 확인한다. 확인 전에는 로그인되지 않는다.
 *
 * 링크가 아니라 코드를 쓰는 이유: 메일 앱이 링크를 자체 브라우저로 열어서
 * 가입은 됐는데 원래 보던 창에는 세션이 안 붙는 일이 잦다.
 *
 * 오류 메시지는 Supabase 가 영어로 준다. 그대로 보여주면 읽히지 않으므로
 * 자주 나오는 것만 우리말로 바꾸고 나머지는 일반 문구로 덮는다.
 */

function ko(message: string | undefined, fallback: string) {
  const raw = (message ?? "").trim();
  const m = raw.toLowerCase();

  // "For security purposes, you can only request this after 41 seconds."
  const wait = /after (\d+) seconds?/.exec(m);
  if (wait) {
    return `너무 자주 요청했습니다. ${wait[1]}초 후에 다시 시도해 주세요.`;
  }

  if (m.includes("invalid login credentials"))
    return "이메일 또는 비밀번호가 맞지 않습니다.";
  if (m.includes("email not confirmed"))
    return "메일 확인이 아직 끝나지 않았습니다. 받은 코드를 입력해 주세요.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "이미 가입된 주소입니다. 로그인하거나 비밀번호를 재설정해 주세요.";
  if (m.includes("token has expired") || m.includes("invalid token"))
    return "코드가 맞지 않거나 만료됐습니다. 다시 받아주세요.";
  if (m.includes("password should be at least"))
    return "비밀번호가 너무 짧습니다.";
  if (m.includes("new password should be different"))
    return "이전과 다른 비밀번호를 정해주세요.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.";
  if (m.includes("user not found") || m.includes("no user found"))
    return "가입되지 않은 주소입니다.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled"))
    return "지금은 가입을 받고 있지 않습니다. 운영진에게 문의해 주세요.";

  // 메일 발송 자체가 실패하는 경우. 대부분 SMTP 설정 문제라 원문이 필요하다.
  if (
    m.includes("error sending") ||
    m.includes("smtp") ||
    m.includes("535") ||
    m.includes("relay")
  ) {
    return `메일 발송에 실패했습니다. 운영진에게 알려주세요. (${raw})`;
  }

  /*
   * 여기까지 왔다는 것은 우리가 모르는 오류다. 원문을 감추면 무엇이 잘못됐는지
   * 아무도 알 수 없다. 읽기 좋은 문장 뒤에 원문을 괄호로 남긴다.
   */
  return raw ? `${fallback} (${raw})` : fallback;
}

/** 가입. 성공하면 그 주소로 확인 코드가 간다. */
export async function signUpWithPassword(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });
  return error
    ? ko(error.message, "가입에 실패했습니다. 잠시 후 다시 시도해 주세요.")
    : null;
}

/** 가입 확인 코드 검증. 통과하면 곧바로 로그인 상태가 된다. */
export async function verifySignupCode(email: string, code: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: code.trim(),
    type: "signup",
  });
  return error
    ? ko(error.message, "코드가 맞지 않거나 만료됐습니다. 다시 받아주세요.")
    : null;
}

/** 확인 코드 다시 보내기. */
export async function resendSignupCode(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim().toLowerCase(),
  });
  return error
    ? ko(error.message, "코드를 다시 보내지 못했습니다. 잠시 후 시도해 주세요.")
    : null;
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  return error
    ? ko(error.message, "로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.")
    : null;
}

/**
 * 비밀번호 재설정 메일.
 *
 * 메일에는 코드와 링크가 함께 간다. 링크는 요청한 그 브라우저에서만 통한다 —
 * PKCE 의 검증값이 그 브라우저에만 있기 때문이다. 데스크톱에서 요청하고
 * 휴대폰 메일 앱에서 열면 반드시 실패한다. 그래서 화면은 코드를 기본으로
 * 두고, 링크는 같은 기기에서 열었을 때를 위한 보조 경로로만 남긴다.
 */
export async function sendPasswordReset(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}/reset-password` },
  );
  return error
    ? ko(error.message, "메일을 보내지 못했습니다. 주소를 확인해 주세요.")
    : null;
}

/** 재설정 코드 확인. 통과하면 비밀번호를 바꿀 수 있는 세션이 생긴다. */
export async function verifyRecoveryCode(email: string, code: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: code.trim(),
    type: "recovery",
  });
  return error
    ? ko(error.message, "코드가 맞지 않거나 만료됐습니다. 다시 받아주세요.")
    : null;
}

/** 재설정 링크로 들어온 상태에서 새 비밀번호를 저장한다. */
export async function updatePassword(password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  return error
    ? ko(error.message, "비밀번호를 바꾸지 못했습니다. 잠시 후 시도해 주세요.")
    : null;
}

/**
 * 로그인한 상태에서 비밀번호 바꾸기.
 *
 * 현재 비밀번호를 먼저 확인한다. 세션만 있으면 바꿀 수 있게 두면, 잠기지 않은
 * 노트북 앞에 잠깐 앉은 사람이 계정을 가져갈 수 있다.
 */
export async function changePassword(
  email: string,
  current: string,
  next: string,
) {
  const supabase = createClient();

  const { error: checkError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: current,
  });
  if (checkError) return "현재 비밀번호가 맞지 않습니다.";

  const { error } = await supabase.auth.updateUser({ password: next });
  return error
    ? ko(error.message, "비밀번호를 바꾸지 못했습니다. 잠시 후 시도해 주세요.")
    : null;
}

/** 이름·학과 고치기. 기수는 승인 뒤 정책이 막는다(0006). */
export async function updateProfile(
  id: string,
  fields: { name: string; department: string },
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      name: fields.name.trim(),
      department: fields.department.trim(),
    })
    .eq("id", id);
  return error ? "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." : null;
}

/** 관리자 권한을 다른 승인된 계정으로 넘긴다. 넘긴 사람은 운영진으로 남는다. */
export async function transferOwnership(targetId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("transfer_ownership", {
    p_target: targetId,
  });
  return error
    ? ko(error.message, "권한을 넘기지 못했습니다. 잠시 후 다시 시도해 주세요.")
    : null;
}

export async function signOut(to?: unknown) {
  const supabase = createClient();
  // 서버 세션이 이미 사라진 경우에도 브라우저에 남은 토큰은 지워야 한다.
  await supabase.auth.signOut().catch(() => undefined);

  /*
   * onClick={signOut} 로 쓰면 React 가 클릭 이벤트를 첫 인자로 넘긴다.
   * 그대로 주소에 넣으면 "[object Object]" 로 이동해 404 가 났다.
   * 호출부를 고쳤지만, 이런 실수 하나가 로그아웃을 막는 일은 없어야 한다.
   */
  const target = typeof to === "string" && to.startsWith("/") ? to : "/home";
  window.location.href = target;
}

/** 낡은 세션을 버리고 로그인 화면으로. 재로그인 안내에서 쓴다. */
export function signOutAndLogin() {
  return signOut("/login");
}
