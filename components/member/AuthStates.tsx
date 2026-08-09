import React, { useState } from "react";

import { DEPARTMENT } from "constants/people";
import { GENERATIONS } from "constants/member";
import { createClient } from "lib/supabase/client";
import { signOut, type Profile } from "lib/supabase/useAuth";
import * as S from "styles/member/style";

/**
 * 승인 전 화면들.
 *
 * 신청서, 대기, 거절. 라운지 본체와 성격이 달라 한 파일에 두면 그 파일이
 * "가입 절차 + 게시판" 두 가지를 동시에 설명하게 된다.
 */

const DEPARTMENTS = Object.values(DEPARTMENT);

/* ─── 신청서 ──────────────────────────────────────────────────────────── */

export function Application({
  profile,
  onDone,
}: {
  profile: Profile;
  onDone: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [generation, setGeneration] = useState(
    profile.generation ? String(profile.generation) : "",
  );
  const [department, setDepartment] = useState(profile.department ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    // 직접 update 하지 않고 함수를 부른다. 거절 → 재신청일 때 status 를
    // pending 으로 되돌리는 일은 본인 권한으로 할 수 없기 때문이다.
    const { error: err } = await createClient().rpc("submit_profile", {
      p_name: name.trim(),
      p_generation: Number(generation),
      p_department: department.trim(),
    });

    if (err) {
      setError("신청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setBusy(false);
      return;
    }
    onDone();
  };

  return (
    <S.Narrow>
      <S.Intro>
        <h1>학회원 확인</h1>
        <p>
          로그인은 이 주소의 주인이라는 것까지만 확인합니다. 기수와 학과를
          적어주시면 운영진이 명단과 대조한 뒤 승인합니다.
        </p>
      </S.Intro>

      <S.FormCard onSubmit={submit}>
        <S.Field>
          <span>이름</span>
          <S.Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="김넥스트"
            maxLength={20}
            required
          />
          <small>명단에 있는 이름 그대로 적어주세요.</small>
        </S.Field>

        <S.FieldRow>
          <S.Field>
            <span>기수</span>
            <S.Select
              value={generation}
              onChange={(e) => setGeneration(e.target.value)}
              required
            >
              <option value="" disabled>
                선택
              </option>
              {GENERATIONS.map((g) => (
                <option key={g} value={g}>
                  {g}기
                </option>
              ))}
            </S.Select>
          </S.Field>

          <S.Field>
            <span>학과</span>
            <S.Input
              list="ku-departments"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="컴퓨터학과"
              maxLength={30}
              required
            />
            <datalist id="ku-departments">
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </S.Field>
        </S.FieldRow>

        <S.Notice>
          로그인 계정 {profile.email} 로 승인 결과를 안내합니다.
        </S.Notice>

        {error && <S.Notice $bad>{error}</S.Notice>}

        <S.Submit type="submit" disabled={busy}>
          {busy ? "제출 중" : "승인 신청"}
        </S.Submit>
      </S.FormCard>

      <S.Foot>
        <S.SignOut type="button" onClick={() => signOut()}>
          다른 계정으로 로그인
        </S.SignOut>
      </S.Foot>
    </S.Narrow>
  );
}

/* ─── 대기 · 거절 ─────────────────────────────────────────────────────── */

export function Waiting({ profile }: { profile: Profile }) {
  return (
    <S.Narrow>
      <S.Intro>
        <h1>승인을 기다리는 중입니다</h1>
      </S.Intro>

      <S.WaitCard>
        <S.WaitDots>
          <i />
          <i />
          <i />
        </S.WaitDots>
        <h2>
          {profile.generation}기 {profile.name}
        </h2>
        <p>
          {profile.department} · 운영진이 명단과 대조하고 있습니다. 확인되면 이
          화면이 학회원 라운지로 바뀝니다.
        </p>
      </S.WaitCard>

      <S.Foot>
        <S.SignOut type="button" onClick={() => signOut()}>
          로그아웃
        </S.SignOut>
      </S.Foot>
    </S.Narrow>
  );
}

export function Rejected({
  profile,
  onRewrite,
}: {
  profile: Profile;
  onRewrite: () => void;
}) {
  return (
    <S.Narrow>
      <S.Intro>
        <h1>승인되지 않았습니다</h1>
        <p>
          {profile.reject_note ||
            "명단에서 확인되지 않았습니다. 적어주신 내용을 다시 확인해 주세요."}
        </p>
      </S.Intro>

      <S.Actions>
        <S.Approve type="button" onClick={onRewrite}>
          다시 작성하기
        </S.Approve>
        <S.Reject type="button" onClick={() => signOut()}>
          로그아웃
        </S.Reject>
      </S.Actions>
    </S.Narrow>
  );
}
