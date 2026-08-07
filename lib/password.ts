/**
 * 비밀번호 규칙.
 *
 * 여기서 하는 검사는 사용자를 돕기 위한 것이지 방어선이 아니다. 브라우저에서
 * 도는 코드는 얼마든지 우회되므로, 최종 판단은 Supabase 의 최소 길이 설정과
 * 아래 signUp 호출이 한다. 그래도 규칙을 화면에서 바로 보여주면 "가입 눌렀는데
 * 영어 오류가 떴다" 는 상황이 사라진다.
 *
 * 구성 규칙을 길게 늘어놓지 않는다. NIST 800-63B 는 특수문자 강제 같은
 * 규칙이 오히려 예측 가능한 비밀번호(Password1!)를 만든다고 본다. 길이를
 * 중심에 두고, 확실히 위험한 것만 막는다.
 */

export type PasswordRule = {
  id: string;
  label: string;
  ok: boolean;
};

export const MIN_PASSWORD = 8;

/**
 * 이런 것들은 길이만 맞아도 몇 초 안에 뚫린다. 완전한 목록일 필요는 없고,
 * 실제로 자주 쓰이는 것만 막아도 효과가 크다.
 */
const COMMON = [
  "password",
  "passw0rd",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty",
  "qwerty123",
  "asdfasdf",
  "iloveyou",
  "letmein",
  "welcome",
  "admin123",
  "abcd1234",
  "a1234567",
  "korea123",
  "next1234",
  "nextku123",
  "dnjsdlfjs",
];

function looksCommon(pw: string) {
  const low = pw.toLowerCase();
  if (COMMON.some((c) => low === c || low.includes(c))) return true;
  // 같은 글자만 반복하거나(aaaaaaaa) 이어지는 숫자(12345678)
  if (/^(.)\1+$/.test(pw)) return true;
  if (/^(?:0123456789|9876543210)/.test(pw)) return true;
  return false;
}

/** 이메일 아이디를 그대로 넣는 경우가 많다. 주소가 알려지면 같이 뚫린다. */
function containsEmailName(pw: string, email?: string) {
  const local = (email ?? "").split("@")[0]?.trim().toLowerCase();
  if (!local || local.length < 3) return false;
  return pw.toLowerCase().includes(local);
}

export function checkPassword(password: string, email?: string) {
  const rules: PasswordRule[] = [
    {
      id: "length",
      label: `${MIN_PASSWORD}자 이상`,
      ok: password.length >= MIN_PASSWORD,
    },
    {
      id: "letter",
      label: "영문 포함",
      ok: /[A-Za-z]/.test(password),
    },
    {
      id: "digit",
      label: "숫자 포함",
      ok: /\d/.test(password),
    },
    {
      id: "notCommon",
      label: "흔히 쓰는 비밀번호가 아님",
      ok: password.length > 0 && !looksCommon(password),
    },
    {
      id: "notEmail",
      label: "이메일 아이디가 들어 있지 않음",
      ok: password.length > 0 && !containsEmailName(password, email),
    },
  ];

  return { rules, allOk: rules.every((r) => r.ok) };
}
