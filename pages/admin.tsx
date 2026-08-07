import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { PEOPLE_INFORMATION } from "constants/people";
import { POST_CATEGORIES } from "constants/member";
import { createClient } from "lib/supabase/client";
import { signOut, useAuth, type Profile } from "lib/supabase/useAuth";
import * as S from "styles/member/style";

/**
 * 운영진 페이지.
 *
 * 하는 일은 하나다 — 가입 신청이 진짜 학회원인지 판단해 승인하거나 거절한다.
 * 그 판단을 빠르게 하도록 constants/people.ts 명단과 자동으로 대조해 결과를
 * 행마다 붙인다. 대조는 참고 자료일 뿐 차단 장치가 아니다. 명단에 없는 기수도
 * 있으므로 최종 판단은 사람이 한다.
 *
 * 이 화면이 열린다고 권한이 생기는 것은 아니다. 승인/거절 쿼리는 RLS 의
 * is_admin() 을 통과해야만 반영된다.
 */

type Tab = "pending" | "members" | "write";

export default function Admin() {
  const router = useRouter();
  const { session, profile, loading, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("pending");
  const [rows, setRows] = useState<Profile[] | null>(null);

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  const load = useCallback(async () => {
    const { data } = await createClient()
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    setRows((data as Profile[]) ?? []);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const pending = useMemo(
    () => (rows ?? []).filter((r) => r.status === "pending" && r.generation),
    [rows],
  );
  const members = useMemo(
    () => (rows ?? []).filter((r) => r.status === "approved"),
    [rows],
  );

  if (loading || !session) return null;

  if (!isAdmin) {
    return (
      <>
        <Head>
          <title>운영진 | NEXT</title>
          <meta name="robots" content="noindex" />
        </Head>
        <S.Page>
          <S.Narrow>
            <S.Intro>
              <h1>접근 권한이 없습니다</h1>
              <p>운영진으로 등록된 계정만 볼 수 있는 화면입니다.</p>
            </S.Intro>
            <S.Actions>
              <S.Approve type="button" onClick={() => router.push("/members")}>
                학회원 라운지로
              </S.Approve>
              <S.Reject type="button" onClick={signOut}>
                로그아웃
              </S.Reject>
            </S.Actions>
          </S.Narrow>
        </S.Page>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>운영진 | NEXT</title>
        <meta name="robots" content="noindex" />
      </Head>

      <S.Page>
        <S.Wrap>
          <S.TopBar>
            <S.Intro style={{ marginBottom: 0 }}>
              <h1>운영진</h1>
              <p>가입 신청을 확인하고 학회원 게시물을 올립니다.</p>
            </S.Intro>
            <S.Actions>
              <S.Promote type="button" onClick={() => router.push("/members")}>
                라운지 보기
              </S.Promote>
              <S.SignOut type="button" onClick={signOut}>
                로그아웃
              </S.SignOut>
            </S.Actions>
          </S.TopBar>

          <S.Tabs>
            <S.Tab
              type="button"
              $on={tab === "pending"}
              onClick={() => setTab("pending")}
            >
              승인 대기<small>{pending.length}</small>
            </S.Tab>
            <S.Tab
              type="button"
              $on={tab === "members"}
              onClick={() => setTab("members")}
            >
              학회원<small>{members.length}</small>
            </S.Tab>
            <S.Tab
              type="button"
              $on={tab === "write"}
              onClick={() => setTab("write")}
            >
              글쓰기
            </S.Tab>
          </S.Tabs>

          {tab === "write" ? (
            <PostForm authorId={profile!.id} />
          ) : rows === null ? null : tab === "pending" ? (
            pending.length === 0 ? (
              <S.Empty>확인할 신청이 없습니다.</S.Empty>
            ) : (
              <S.Rows>
                {pending.map((r) => (
                  <PendingRow
                    key={r.id}
                    row={r}
                    reviewerId={profile!.id}
                    onDone={load}
                  />
                ))}
              </S.Rows>
            )
          ) : members.length === 0 ? (
            <S.Empty>아직 승인된 학회원이 없습니다.</S.Empty>
          ) : (
            <S.Rows>
              {members.map((r) => (
                <MemberRow
                  key={r.id}
                  row={r}
                  isSelf={r.id === profile!.id}
                  onDone={load}
                />
              ))}
            </S.Rows>
          )}
        </S.Wrap>
      </S.Page>
    </>
  );
}

/* ─── 명단 대조 ───────────────────────────────────────────────────────── */

const ROSTER_GENS = Array.from(new Set(PEOPLE_INFORMATION.map((p) => p.gen)));
const ROSTER_MIN = Math.min(...ROSTER_GENS);
const ROSTER_MAX = Math.max(...ROSTER_GENS);

type MatchResult = { ok: boolean; text: string };

/** 이름 표기가 흔들리는 것(공백·가운뎃점)까지 맞춰야 헛것이 안 잡힌다. */
function normalize(s: string) {
  return s.replace(/\s+/g, "").trim();
}

function matchRoster(name: string, generation: number | null): MatchResult {
  const n = normalize(name);
  const sameName = PEOPLE_INFORMATION.filter((p) => normalize(p.name) === n);

  if (generation === null) return { ok: false, text: "기수 미기재" };

  const exact = sameName.find((p) => p.gen === generation);
  if (exact) {
    return {
      ok: true,
      text: `명단 일치 — ${exact.gen}기 ${exact.name} · ${exact.department}`,
    };
  }
  if (sameName.length > 0) {
    const gens = sameName.map((p) => `${p.gen}기`).join(", ");
    return { ok: false, text: `이름은 있으나 기수가 다름 — 명단상 ${gens}` };
  }
  if (generation < ROSTER_MIN || generation > ROSTER_MAX) {
    return {
      ok: false,
      text: `명단에 없는 기수 (사이트 명단은 ${ROSTER_MIN}~${ROSTER_MAX}기) — 직접 확인 필요`,
    };
  }
  return { ok: false, text: "명단에 없음 — 직접 확인 필요" };
}

/* ─── 승인 대기 행 ────────────────────────────────────────────────────── */

function PendingRow({
  row,
  reviewerId,
  onDone,
}: {
  row: Profile;
  reviewerId: string;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const match = matchRoster(row.name, row.generation);

  const review = async (status: "approved" | "rejected") => {
    setBusy(true);
    await createClient()
      .from("profiles")
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        reject_note: status === "rejected" ? note.trim() || null : null,
      })
      .eq("id", row.id);
    onDone();
  };

  return (
    <S.Row>
      <S.Who>
        <strong>
          {row.generation}기 {row.name}
        </strong>
        <p>
          {row.department} · {row.email}
        </p>
        <S.Match $ok={match.ok}>{match.text}</S.Match>
      </S.Who>

      {rejecting ? (
        <S.RejectBox>
          <S.Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="거절 사유 (본인에게 보입니다)"
            maxLength={100}
          />
          <S.Actions>
            <S.Reject
              type="button"
              disabled={busy}
              onClick={() => review("rejected")}
            >
              거절 확정
            </S.Reject>
            <S.Promote type="button" onClick={() => setRejecting(false)}>
              취소
            </S.Promote>
          </S.Actions>
        </S.RejectBox>
      ) : (
        <S.Actions>
          <S.Approve
            type="button"
            disabled={busy}
            onClick={() => review("approved")}
          >
            승인
          </S.Approve>
          <S.Reject
            type="button"
            disabled={busy}
            onClick={() => setRejecting(true)}
          >
            거절
          </S.Reject>
        </S.Actions>
      )}
    </S.Row>
  );
}

/* ─── 학회원 행 ───────────────────────────────────────────────────────── */

function MemberRow({
  row,
  isSelf,
  onDone,
}: {
  row: Profile;
  isSelf: boolean;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const setRole = async (role: "member" | "admin") => {
    setBusy(true);
    await createClient().from("profiles").update({ role }).eq("id", row.id);
    onDone();
  };

  return (
    <S.Row>
      <S.Who>
        <strong>
          {row.generation}기 {row.name}
        </strong>
        <p>
          {row.department} · {row.email}
        </p>
      </S.Who>

      <S.Actions>
        {row.role === "admin" ? (
          <>
            <S.Badge $tone="approved">운영진</S.Badge>
            {/* 마지막 운영진이 스스로를 내리면 아무도 승인할 수 없게 된다. */}
            {!isSelf && (
              <S.Promote
                type="button"
                disabled={busy}
                onClick={() => setRole("member")}
              >
                운영진 해제
              </S.Promote>
            )}
          </>
        ) : (
          <S.Promote
            type="button"
            disabled={busy}
            onClick={() => setRole("admin")}
          >
            운영진으로 지정
          </S.Promote>
        )}
      </S.Actions>
    </S.Row>
  );
}

/* ─── 게시물 작성 ─────────────────────────────────────────────────────── */

function PostForm({ authorId }: { authorId: string }) {
  const [category, setCategory] = useState<string>(POST_CATEGORIES[0].key);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [deadline, setDeadline] = useState("");
  const [link, setLink] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [bad, setBad] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg("");

    const { error } = await createClient()
      .from("posts")
      .insert({
        category,
        title: title.trim(),
        body: body.trim(),
        company: company.trim() || null,
        deadline: deadline || null,
        link: link.trim() || null,
        author_id: authorId,
      });

    if (error) {
      setBad(true);
      setMsg("올리지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } else {
      setBad(false);
      setMsg("올라갔습니다. 라운지에서 바로 보입니다.");
      setTitle("");
      setCompany("");
      setDeadline("");
      setLink("");
      setBody("");
    }
    setBusy(false);
  };

  return (
    <S.FormWide onSubmit={submit}>
      <S.FieldRowLead>
        <S.Field>
          <span>분류</span>
          <S.Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {POST_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </S.Select>
        </S.Field>

        <S.Field>
          <span>제목</span>
          <S.Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="백엔드 인턴 모집"
            maxLength={80}
            required
          />
        </S.Field>
      </S.FieldRowLead>

      <S.FieldRowLead>
        <S.Field>
          <span>마감</span>
          <S.Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </S.Field>

        <S.Field>
          <span>회사 · 기관</span>
          <S.Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="비워두어도 됩니다"
            maxLength={40}
          />
        </S.Field>
      </S.FieldRowLead>

      <S.Field>
        <span>내용</span>
        <S.Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="어떤 일인지, 누구를 찾는지, 어떻게 지원하는지"
          required
        />
      </S.Field>

      <S.Field>
        <span>링크</span>
        <S.Input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://"
        />
      </S.Field>

      {msg && <S.Notice $bad={bad}>{msg}</S.Notice>}

      <S.Submit type="submit" disabled={busy}>
        {busy ? "올리는 중" : "올리기"}
      </S.Submit>
    </S.FormWide>
  );
}
