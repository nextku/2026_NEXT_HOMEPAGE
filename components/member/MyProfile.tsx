import React, { useState } from "react";

import { DEPARTMENT } from "constants/people";
import { checkPassword } from "lib/password";
import {
  changePassword,
  updateProfile,
  type Profile,
} from "lib/supabase/useAuth";
import PasswordFields from "components/member/PasswordFields";
import * as S from "styles/member/style";

/**
 * 내 정보.
 *
 * 이름과 학과는 본인이 고친다 — 처음 신청할 때 오타가 나기 마련이고, 그걸
 * 고치자고 운영진을 불러야 하면 아무도 안 고친다.
 *
 * 기수는 읽기만 한다. 운영진이 명단과 대조해 승인한 근거가 기수이므로,
 * 승인된 뒤에 그것만 바뀌면 승인의 의미가 없어진다. 화면에서 막을 뿐 아니라
 * 정책(0006)이 실제로 거절한다.
 */

const DEPARTMENTS = Object.values(DEPARTMENT);

export default function MyProfile({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [department, setDepartment] = useState(profile.department ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [bad, setBad] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [pwValid, setPwValid] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwBad, setPwBad] = useState(false);

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg("");

    const err = await updateProfile(profile.id, { name, department });
    setBad(!!err);
    setMsg(err ?? "저장했습니다.");
    if (!err) onSaved();
    setBusy(false);
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwBusy) return;
    if (!pwValid) {
      setPwBad(true);
      setPwMsg("아래 조건을 모두 채운 뒤 다시 눌러주세요.");
      return;
    }
    setPwBusy(true);
    setPwMsg("");

    const err = await changePassword(profile.email, current, next);
    setPwBad(!!err);
    setPwMsg(err ?? "비밀번호를 바꿨습니다.");
    if (!err) {
      setCurrent("");
      setNext("");
      setAgain("");
      setPwOpen(false);
    }
    setPwBusy(false);
  };

  return (
    <S.Split>
      <S.FormCard onSubmit={saveInfo}>
        <S.Field>
          <span>이름</span>
          <S.Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            required
          />
        </S.Field>

        <S.Field>
          <span>학과</span>
          <S.Input
            list="ku-departments-my"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            maxLength={30}
            required
          />
          <datalist id="ku-departments-my">
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </S.Field>

        <S.Readonly>
          <div>
            <span>기수</span>
            <strong>{profile.generation}기</strong>
          </div>
          <div>
            <span>이메일</span>
            <strong>{profile.email}</strong>
          </div>
          {profile.title && (
            <div>
              <span>직책</span>
              <strong>{profile.title}</strong>
            </div>
          )}
          <p>
            기수와 이메일은 본인이 바꿀 수 없습니다. 잘못 들어갔다면 운영진에게
            알려주세요.
          </p>
        </S.Readonly>

        {msg && <S.Notice $bad={bad}>{msg}</S.Notice>}

        <S.Submit type="submit" disabled={busy}>
          {busy ? "저장 중" : "저장"}
        </S.Submit>
      </S.FormCard>

      {!pwOpen ? (
        <S.Foot>
          <S.SignOut type="button" onClick={() => setPwOpen(true)}>
            비밀번호 바꾸기
          </S.SignOut>
        </S.Foot>
      ) : (
        <S.FormCard onSubmit={savePassword}>
          <S.Field>
            <span>현재 비밀번호</span>
            <S.Input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
            />
          </S.Field>

          <PasswordFields
            email={profile.email}
            password={next}
            onPassword={setNext}
            again={again}
            onAgain={setAgain}
            onValidChange={setPwValid}
          />

          {pwMsg && <S.Notice $bad={pwBad}>{pwMsg}</S.Notice>}

          <S.Submit type="submit" disabled={pwBusy || !current || !pwValid}>
            {pwBusy ? "바꾸는 중" : "비밀번호 바꾸기"}
          </S.Submit>

          <S.Foot>
            <S.SignOut type="button" onClick={() => setPwOpen(false)}>
              취소
            </S.SignOut>
          </S.Foot>
        </S.FormCard>
      )}
    </S.Split>
  );
}

/** 저장 버튼을 눌러도 되는 상태인지 바깥에서 볼 일이 있으면 쓴다. */
export const isPasswordOk = (pw: string, email?: string) =>
  checkPassword(pw, email).allOk;
