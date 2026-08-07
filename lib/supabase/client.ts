import { createBrowserClient } from "@supabase/ssr";

/**
 * 브라우저에서 쓰는 Supabase 클라이언트.
 *
 * 여기 실리는 publishable key 는 번들에 그대로 나가는 공개 키다. 숨길 수 없고
 * 숨길 필요도 없다. 데이터를 지키는 것은 키가 아니라 RLS 정책이므로,
 * 새 테이블을 만들 때마다 정책을 함께 써야 한다.
 *
 * 이 프로젝트는 pages router 라 App Router 예제와 사용법이 조금 다르다.
 * 서버에서 세션을 읽어야 할 때는 lib/supabase/server.ts 를 쓴다.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  // 빌드가 조용히 통과한 뒤 런타임에 알 수 없는 오류로 터지는 것보다,
  // 설정이 빠졌다는 사실을 개발 중에 바로 알리는 편이 낫다.
  throw new Error(
    "Supabase 환경변수가 없습니다. .env.example 을 .env.local 로 복사하고 값을 채워주세요.",
  );
}

export function createClient() {
  return createBrowserClient(url!, key!);
}
