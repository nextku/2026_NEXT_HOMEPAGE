import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
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
  status: MemberStatus;
  role: MemberRole;
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
      setSession(data.session);
      if (data.session) await loadProfile(data.session.user.id);
      if (alive) setLoading(false);
    });

    // 다른 탭에서 로그아웃하거나 토큰이 갱신되면 여기서 따라잡는다.
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, next) => {
        if (!alive) return;
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
    isAdmin: profile?.role === "admin" && profile?.status === "approved",
  };
}

export async function signInWithGoogle(redirectTo = "/members") {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${redirectTo}`,
    },
  });
}

export async function signOut(to = "/home") {
  const supabase = createClient();
  // 서버 세션이 이미 사라진 경우에도 브라우저에 남은 토큰은 지워야 한다.
  await supabase.auth.signOut().catch(() => undefined);
  window.location.href = to;
}

/** 낡은 세션을 버리고 로그인 화면으로. 재로그인 안내에서 쓴다. */
export function signOutAndLogin() {
  return signOut("/login");
}
