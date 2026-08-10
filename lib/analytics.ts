/*
 * Supabase 클라이언트를 위에서 불러오지 않는다.
 *
 * 이 파일은 _app 에 들어가므로, 여기서 정적으로 가져오면 홈·소개처럼 로그인과
 * 무관한 페이지도 인증 라이브러리 전체(60kB 남짓)를 내려받는다. 하는 일은
 * 행 하나를 넣는 것뿐이라 그때 가서 가져오면 된다.
 */
const supabaseEnvReady =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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

/**
 * 여기가 진짜 사이트인가.
 *
 * 개발할 때 띄우는 localhost 도 .env.local 을 통해 운영 데이터베이스를 본다.
 * 그래서 화면을 확인하려고 만든 임시 페이지의 방문이 실제 통계로 들어갔고,
 * 그 브라우저는 로그인한 적이 없어 내부 방문 표시도 안 붙어 바깥 손님으로
 * 집계됐다. 지원 유입을 보는 숫자가 그만큼 부풀었다.
 *
 * 주소로 막는다. 배포된 곳에서 온 것만 센다.
 */
function isRealSite() {
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1" || h === "[::1]") return false;
  // 미리보기 배포도 우리가 확인하려고 여는 것이라 세지 않는다.
  if (h.endsWith(".vercel.app")) return false;
  return true;
}

export function track(
  name: EventName,
  extra: { path?: string; tab?: string } = {},
) {
  if (typeof window === "undefined" || !supabaseEnvReady) return;
  if (!isRealSite()) return;

  try {
    const referrer = document.referrer || null;
    // 같은 사이트 안에서의 이동은 유입 경로가 아니다.
    const external =
      referrer && !referrer.startsWith(window.location.origin)
        ? referrer
        : null;

    const row = {
      name,
      path: extra.path ?? window.location.pathname,
      tab: extra.tab ?? null,
      referrer: external,
      session_id: sessionId(),
      internal: isInternal(),
    };

    void import("lib/supabase/client")
      .then(({ createClient }) => createClient().from("events").insert(row))
      .then(
        () => undefined,
        () => undefined,
      );
  } catch {
    // 기록은 부가 기능이다. 실패해도 조용히 넘어간다.
  }
}
