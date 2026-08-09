import { createClient, isSupabaseConfigured } from "lib/supabase/client";

/**
 * 방문·클릭 기록.
 *
 * GA4 는 그대로 두고, 운영진 화면에 바로 보여줄 값만 여기에 따로 쌓는다.
 * 누가 눌렀는지는 담지 않는다 — session_id 는 브라우저가 만든 난수이고 사람과
 * 연결할 방법이 없다.
 *
 * 기록에 실패해도 화면은 아무 일 없이 굴러가야 한다. 통계 때문에 지원 버튼이
 * 안 눌리는 상황은 있을 수 없다.
 */

export type EventName =
  "page_view" | "tab_view" | "download_click" | "apply_click";

const SESSION_KEY = "nextku_sid";
const INTERNAL_KEY = "nextku_internal";

/**
 * 이 브라우저가 학회 내부 사람의 것인지.
 *
 * 한 번이라도 로그인했으면 표시해두고, 로그아웃해도 지우지 않는다. 같은 사람이
 * 로그아웃한 채 둘러본 것도 내부 방문이기 때문이다.
 *
 * 기록을 버리지는 않는다. 표시만 남기고 집계에서 빼면 나중에 되살릴 수 있다.
 */
export function markInternal() {
  try {
    localStorage.setItem(INTERNAL_KEY, "1");
  } catch {
    // 저장소를 못 쓰면 그냥 외부 방문으로 센다. 통계가 조금 부풀 뿐이다.
  }
}

function isInternal() {
  try {
    return localStorage.getItem(INTERNAL_KEY) === "1";
  } catch {
    return false;
  }
}

function sessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // 시크릿 모드나 저장소 차단. 이 방문은 그냥 익명으로 센다.
    return null;
  }
}

export function track(
  name: EventName,
  extra: { path?: string; tab?: string } = {},
) {
  if (typeof window === "undefined" || !isSupabaseConfigured) return;

  try {
    const referrer = document.referrer || null;
    // 같은 사이트 안에서의 이동은 유입 경로가 아니다.
    const external =
      referrer && !referrer.startsWith(window.location.origin)
        ? referrer
        : null;

    void createClient()
      .from("events")
      .insert({
        name,
        path: extra.path ?? window.location.pathname,
        tab: extra.tab ?? null,
        referrer: external,
        session_id: sessionId(),
        internal: isInternal(),
      })
      .then(
        () => undefined,
        () => undefined,
      );
  } catch {
    // 기록은 부가 기능이다. 실패해도 조용히 넘어간다.
  }
}
