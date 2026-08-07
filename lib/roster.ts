/**
 * 붙여넣은 명단 텍스트를 행으로 바꾼다.
 *
 * 운영진이 명단을 어디서 가져올지 정해줄 수 없다. 엑셀에서 복사하면 탭으로,
 * 메모장에서 옮기면 쉼표로 나뉘고, 열 순서도 사람마다 다르다. 그래서 순서를
 * 강제하는 대신 칸의 생김새로 무엇인지 판단한다.
 *
 *   @ 가 있으면            → 이메일
 *   숫자 한두 자리(14, 14기) → 기수
 *   남은 것 중 첫 칸        → 이름
 *   그 다음 칸             → 직책 (선택)
 *
 * 이렇게 하면 "메일, 기수, 이름" 이든 "이름 기수 메일" 이든 같게 읽힌다.
 */

export type RosterRow = {
  email: string;
  name: string;
  generation: number;
  title?: string;
};

export type RosterSkip = { line: string; reason: string };

export type RosterParse = {
  rows: RosterRow[];
  skipped: RosterSkip[];
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERATION = /^(\d{1,2})\s*기?$/;

/** 첫 줄에 열 이름이 붙어 오는 경우가 많다. 데이터로 오해하지 않게 걸러낸다. */
const HEADER_WORDS = [
  "이메일",
  "메일",
  "email",
  "mail",
  "이름",
  "성명",
  "name",
  "기수",
  "gen",
  "직책",
];

function isHeaderLine(cells: string[]) {
  const joined = cells.join(" ").toLowerCase();
  const hits = HEADER_WORDS.filter((w) => joined.includes(w)).length;
  // 이름이 '이메일' 인 사람은 없다. 두 단어 이상 겹치면 머리글로 본다.
  return hits >= 2 && !cells.some((c) => EMAIL.test(c));
}

export function parseRoster(text: string): RosterParse {
  const rows: RosterRow[] = [];
  const skipped: RosterSkip[] = [];
  const seen = new Set<string>();

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    const cells = line
      .split(/[\t,;]/)
      .map((c) => c.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);

    if (cells.length === 0) continue;
    if (isHeaderLine(cells)) continue;

    const email = cells.find((c) => EMAIL.test(c))?.toLowerCase();
    const genCell = cells.find((c) => GENERATION.test(c));
    const rest = cells.filter(
      (c) => c !== genCell && c.toLowerCase() !== email,
    );

    if (!email) {
      skipped.push({ line, reason: "이메일 없음" });
      continue;
    }
    if (!genCell) {
      skipped.push({ line, reason: "기수 없음" });
      continue;
    }
    if (rest.length === 0) {
      skipped.push({ line, reason: "이름 없음" });
      continue;
    }
    if (seen.has(email)) {
      skipped.push({ line, reason: "같은 메일 중복" });
      continue;
    }

    const generation = Number(GENERATION.exec(genCell)![1]);
    if (generation < 1 || generation > 99) {
      skipped.push({ line, reason: "기수 범위 벗어남" });
      continue;
    }

    seen.add(email);
    rows.push({
      email,
      name: rest[0],
      generation,
      title: rest[1] || undefined,
    });
  }

  return { rows, skipped };
}
