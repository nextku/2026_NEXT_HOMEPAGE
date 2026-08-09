import type { Profile } from "lib/supabase/useAuth";

/**
 * "14기", "14기 · 15기 대표" 처럼 사람을 한 줄로 부르는 표기.
 *
 * 라운지 인사말, 내 정보, 운영진 목록이 각자 조립하면 같은 사람이 화면마다
 * 다르게 불린다. 여기 한 곳에서 만든다.
 *
 * 직책을 맡은 기수가 입회 기수와 같으면 굳이 두 번 쓰지 않는다.
 */
export function memberLabel(p: {
  generation: number | null;
  title: string | null;
  staff_generation?: number | null;
}) {
  const parts: string[] = [];
  if (p.generation) parts.push(`${p.generation}기`);

  if (p.title) {
    const g = p.staff_generation;
    if (g && g !== p.generation) parts.push(`${g}기 ${p.title}`);
    else parts.push(p.title);
  }

  return parts.join(" · ");
}

/**
 * 신청서를 아직 안 쓴 상태인가.
 *
 * 운영진 권한이 있는 계정은 예외다. NEXT 공용 계정처럼 사람이 아닌 계정이 있고, 그런 계정에는
 * 기수가 없다. 기수를 요구하면 아무 값이나 적어 넣게 되고 명단이 지저분해진다.
 */
export function needsApplication(p: Profile) {
  if (p.role === "admin") return false;
  return !p.name?.trim() || p.generation === null;
}
