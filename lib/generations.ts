import { createClient } from "lib/supabase/client";

/**
 * 기수와 소속.
 *
 * 예전에는 프로필 한 줄에 기수·직책기수·직책 세 칸으로 눌러담았다. 직책을 한
 * 번밖에 담지 못해서, 15기 대표였다가 16기에 부대표가 되면 앞의 것이 덮였다.
 * 사람과 기수 사이를 표로 두고 여기서 읽는다.
 */

export type Position = "member" | "staff" | "vice_lead" | "lead";

/** 화면에 쓰는 말. DB 의 membership_label 과 같은 규칙이어야 한다. */
export const POSITION_LABEL: Record<Position, string> = {
  member: "부원",
  staff: "운영진",
  vice_lead: "부대표",
  lead: "대표",
};

/** 고르는 차례. 위에서부터 무거운 자리. */
export const POSITIONS: Position[] = ["lead", "vice_lead", "staff", "member"];

export type Generation = {
  id: string;
  number: number;
  started_on: string | null;
  ended_on: string | null;
};

export type GenerationRow = Generation & {
  /** 그 기수에 속한 사람 수. 자리별로 나눠 센다. */
  counts: Record<Position, number>;
  total: number;
};

/** 활동이 끝났는가. 상태를 저장하지 않고 날짜로 판단한다 — 저장하면 어긋난다. */
export function isClosed(g: Generation) {
  if (!g.ended_on) return false;
  return new Date(g.ended_on) < new Date(new Date().toDateString());
}

export function periodText(g: Generation) {
  const f = (d: string | null) =>
    d ? `${d.slice(0, 4)}.${d.slice(5, 7)}` : "미설정";
  if (!g.started_on && !g.ended_on) return "미설정";
  return `${f(g.started_on)} ~ ${f(g.ended_on)}`;
}

/**
 * 기수 목록과 기수별 인원.
 *
 * 기수마다 따로 세면 열 기수에 요청이 열한 번이다. 소속을 한 번에 받아 화면에서
 * 센다 — 학회 전체를 합쳐도 몇 백 줄이라 한 번에 받는 편이 빠르다.
 */
export async function fetchGenerations(): Promise<GenerationRow[]> {
  const supabase = createClient();

  const [{ data: gens }, { data: mems }] = await Promise.all([
    supabase.from("generations").select("*").order("number", { ascending: false }),
    supabase.from("memberships").select("generation_id, position"),
  ]);

  const empty = (): Record<Position, number> => ({
    lead: 0,
    vice_lead: 0,
    staff: 0,
    member: 0,
  });

  const byGen = new Map<string, Record<Position, number>>();
  for (const m of (mems ?? []) as { generation_id: string; position: Position }[]) {
    const c = byGen.get(m.generation_id) ?? empty();
    c[m.position] += 1;
    byGen.set(m.generation_id, c);
  }

  return ((gens ?? []) as Generation[]).map((g) => {
    const counts = byGen.get(g.id) ?? empty();
    return {
      ...g,
      counts,
      total: counts.lead + counts.vice_lead + counts.staff + counts.member,
    };
  });
}

export async function createGeneration(number: number) {
  const { error } = await createClient()
    .from("generations")
    .insert({ number });
  if (!error) return null;
  // 같은 번호를 두 번 만들려는 것은 흔한 실수라 따로 말해준다.
  if (/duplicate key/i.test(error.message)) return `${number}기는 이미 있습니다.`;
  return error.message;
}

export async function updateGeneration(
  id: string,
  patch: { started_on?: string | null; ended_on?: string | null },
) {
  const { error } = await createClient()
    .from("generations")
    .update(patch)
    .eq("id", id);
  return error ? error.message : null;
}

export async function removeGeneration(id: string) {
  const { error } = await createClient()
    .from("generations")
    .delete()
    .eq("id", id);
  return error ? error.message : null;
}
