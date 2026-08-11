import React, { useCallback, useEffect, useState } from "react";

import Confirm from "components/ui/Confirm";
import {
  POSITION_LABEL,
  createGeneration,
  fetchGenerations,
  isClosed,
  periodText,
  removeGeneration,
  updateGeneration,
  type GenerationRow,
  type Position,
} from "lib/generations";
import * as S from "styles/member/style";

/**
 * 기수 관리.
 *
 * 기수마다 언제부터 언제까지였는지, 몇 명이 어떤 자리에 있었는지를 본다.
 * 예전에는 이 정보가 어디에도 없었다 — 프로필에 기수 번호만 적혀 있어서
 * "14기가 언제였지" 를 물으면 아무도 답할 수 없었다.
 *
 * 활동 중인지는 저장하지 않는다. 종료일로 판단한다. 상태를 따로 두면 날짜를
 * 고쳤을 때 둘이 어긋나고, 그때 어느 쪽이 맞는지 알 수 없다.
 */

const ORDER: Position[] = ["lead", "vice_lead", "staff", "member"];

export default function Generations() {
  const [rows, setRows] = useState<GenerationRow[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [removing, setRemoving] = useState<GenerationRow | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setRows(await fetchGenerations());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async () => {
    // 다음 기수는 가장 큰 번호 + 1 이다. 매번 적게 하면 오타가 난다.
    const next = rows && rows.length > 0 ? rows[0].number + 1 : 1;
    setBusy(true);
    setError("");
    const err = await createGeneration(next);
    if (err) setError(err);
    else await load();
    setBusy(false);
  };

  const save = async (
    g: GenerationRow,
    patch: { started_on?: string | null; ended_on?: string | null },
  ) => {
    setBusy(true);
    setError("");
    const err = await updateGeneration(g.id, patch);
    if (err) setError(err);
    else await load();
    setBusy(false);
  };

  const drop = async () => {
    if (!removing) return;
    setBusy(true);
    const err = await removeGeneration(removing.id);
    if (err) setError(err);
    else await load();
    setRemoving(null);
    setBusy(false);
  };

  if (rows === null) return null;

  return (
    <>
      <Confirm
        open={removing !== null}
        tone="danger"
        title={`${removing?.number}기를 지웁니다`}
        detail={
          removing && removing.total > 0
            ? `이 기수에 속한 ${removing.total}명의 소속 기록도 함께 사라집니다. 사람 계정은 남습니다.`
            : "되돌릴 수 없습니다."
        }
        confirmLabel="지우기"
        busy={busy}
        onConfirm={drop}
        onCancel={() => setRemoving(null)}
      />

      <S.GenTop>
        <S.GenHint>
          기수마다 활동 기간과 인원을 관리합니다. 활동 중 표시는 종료일로
          정해집니다.
        </S.GenHint>
        <S.Approve type="button" onClick={add} disabled={busy}>
          기수 추가
        </S.Approve>
      </S.GenTop>

      {error && <S.Notice $bad>{error}</S.Notice>}

      {rows.length === 0 ? (
        <S.Empty>아직 기수가 없습니다.</S.Empty>
      ) : (
        <S.Rows>
          {rows.map((g) => {
            const open = !isClosed(g);
            const shown = ORDER.filter((p) => g.counts[p] > 0);
            return (
              <S.GenRow key={g.id}>
                <S.GenNo $open={open}>{g.number}기</S.GenNo>
                <S.GenPeriod>{periodText(g)}</S.GenPeriod>
                <S.GenCounts>
                  {g.total === 0 ? (
                    <em>아직 아무도 없습니다</em>
                  ) : (
                    shown.map((p) => (
                      <span key={p}>
                        {POSITION_LABEL[p]} <b>{g.counts[p]}</b>
                      </span>
                    ))
                  )}
                </S.GenCounts>
                <S.Quiet
                  type="button"
                  onClick={() => setEditing(editing === g.id ? null : g.id)}
                >
                  {editing === g.id ? "닫기" : "기간 수정"}
                </S.Quiet>

                {editing === g.id && (
                  <S.GenEdit>
                    <S.Field>
                      <span>활동 시작</span>
                      <S.Input
                        type="date"
                        defaultValue={g.started_on ?? ""}
                        onBlur={(e) =>
                          save(g, { started_on: e.target.value || null })
                        }
                      />
                    </S.Field>
                    <S.Field>
                      <span>활동 종료</span>
                      <S.Input
                        type="date"
                        defaultValue={g.ended_on ?? ""}
                        onBlur={(e) =>
                          save(g, { ended_on: e.target.value || null })
                        }
                      />
                    </S.Field>
                    {/* 비워두면 활동 중으로 본다. 그것이 대부분의 경우다. */}
                    <S.GenHint style={{ flex: 1 }}>
                      종료일을 비워두면 활동 중으로 봅니다.
                    </S.GenHint>
                    <S.Reject type="button" onClick={() => setRemoving(g)}>
                      기수 지우기
                    </S.Reject>
                  </S.GenEdit>
                )}
              </S.GenRow>
            );
          })}
        </S.Rows>
      )}
    </>
  );
}
