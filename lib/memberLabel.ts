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

/** 이름이 아직 없는 사람. 가입만 하고 신청서를 안 쓴 상태다. */
export function needsApplication(p: Profile) {
  return !p.name?.trim() || p.generation === null;
}
