import React, { useState } from "react";

import { MIN_PASSWORD, checkPassword } from "lib/password";
import * as S from "styles/member/style";

/**
 * 새 비밀번호를 받는 두 칸과 규칙 표시.
 *
 * 가입 화면과 재설정 화면이 같은 것을 물어보므로 한곳에 둔다. 규칙이 갈리면
 * 한쪽에서 통과한 비밀번호가 다른 쪽에서 거절되는 일이 생긴다.
 *
 * 타이핑할 때마다 다시 계산한다. 제출한 뒤에 알려주면 이미 늦다.
 */

type Props = {
  email?: string;
  password: string;
  onPassword: (v: string) => void;
  again: string;
  onAgain: (v: string) => void;
  /** 규칙과 일치 여부를 모두 만족하는지. 바깥의 제출 버튼이 이걸 본다. */
  onValidChange?: (valid: boolean) => void;
};

function Mark({ ok }: { ok: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ok ? <path d="M3.5 8.5l3 3 6-6.5" /> : <circle cx="8" cy="8" r="2.2" />}
    </svg>
  );
}

export default function PasswordFields({
  email,
  password,
  onPassword,
  again,
  onAgain,
  onValidChange,
}: Props) {
  const [reveal, setReveal] = useState(false);

  const { rules, allOk } = checkPassword(password, email);
  // 두 번째 칸은 뭔가 치기 시작한 뒤에만 판단한다. 비어 있는 동안 빨간 줄을
  // 띄우면 아직 하지도 않은 일을 틀렸다고 말하는 셈이다.
  const matched = again.length > 0 && password === again;
  const mismatch = again.length > 0 && password !== again;

  const valid = allOk && matched;
  React.useEffect(() => {
    onValidChange?.(valid);
  }, [valid, onValidChange]);

  return (
    <>
      <S.Field>
        <S.FieldHead>
          <span>비밀번호</span>
          <S.Reveal type="button" onClick={() => setReveal((v) => !v)}>
            {reveal ? "숨기기" : "보기"}
          </S.Reveal>
        </S.FieldHead>
        <S.Input
          type={reveal ? "text" : "password"}
          value={password}
          onChange={(e) => onPassword(e.target.value)}
          autoComplete="new-password"
          minLength={MIN_PASSWORD}
          required
        />

        <S.Rules aria-live="polite">
          {rules.map((r) => (
            <S.Rule key={r.id} $ok={r.ok}>
              <Mark ok={r.ok} />
              {r.label}
            </S.Rule>
          ))}
        </S.Rules>
      </S.Field>

      <S.Field>
        <span>비밀번호 확인</span>
        <S.Input
          type={reveal ? "text" : "password"}
          value={again}
          onChange={(e) => onAgain(e.target.value)}
          autoComplete="new-password"
          required
        />
        {mismatch && (
          <S.Notice $bad>두 번 입력한 비밀번호가 다릅니다.</S.Notice>
        )}
        {matched && (
          <S.Rule as="p" $ok style={{ margin: 0 }}>
            <Mark ok />
            일치합니다
          </S.Rule>
        )}
      </S.Field>
    </>
  );
}
