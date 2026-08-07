import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { PEOPLE_INFORMATION } from "constants/people";
import { POST_CATEGORIES } from "constants/member";
import { parseRoster, type RosterParse } from "lib/roster";
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

type Tab = "pending" | "members" | "roster" | "stats" | "write";

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

  /*
   * 아직 판단이 안 선 동안에도 Head 는 내보낸다. 여기서 통째로 null 을
   * 돌려주면 정적 HTML 에 noindex 가 빠지는데, 이 주소가 그대로 색인되면
   * 곤란하다. robots.txt 로도 막고 있지만 두 겹으로 둔다.
   */
  const head = (
    <Head>
      <title>운영진 | NEXT</title>
      <meta name="robots" content="noindex" />
    </Head>
  );

  if (loading || !session) return head;

  if (!isAdmin) {
    return (
      <>
        {head}
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
      {head}

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
              $on={tab === "stats"}
              onClick={() => setTab("stats")}
            >
              통계
            </S.Tab>
            <S.Tab
              type="button"
              $on={tab === "roster"}
              onClick={() => setTab("roster")}
            >
              명단
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
          ) : tab === "roster" ? (
            <RosterForm onSaved={load} />
          ) : tab === "stats" ? (
            <Stats />
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
          {row.title ? ` · ${row.title}` : ""}
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

/* ─── 통계 ────────────────────────────────────────────────────────────── */

type Stats = {
  days: number;
  funnel: {
    visitors: number;
    join_page: number;
    download: number;
    apply: number;
  };
  pages: { path: string; views: number; visitors: number }[];
  tabs: { path: string; tab: string; views: number; visitors: number }[];
  sources: { source: string; visits: number }[];
};

const RANGES = [
  { days: 7, label: "7일" },
  { days: 30, label: "30일" },
  { days: 90, label: "90일" },
];

/** 홈 방문에서 지원까지 어디서 사람이 빠지는지가 이 화면의 전부다. */
function funnelSteps(f: Stats["funnel"]) {
  return [
    { label: "사이트 방문", value: f.visitors },
    { label: "JOIN US 열람", value: f.join_page },
    { label: "지원서 다운로드", value: f.download },
    { label: "지원하기", value: f.apply },
  ];
}

function Stats() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setData(null);
    setFailed(false);
    createClient()
      .rpc("admin_stats", { p_days: days })
      .then(({ data: d, error }) => {
        if (!alive) return;
        if (error) setFailed(true);
        else setData(d as Stats);
      });
    return () => {
      alive = false;
    };
  }, [days]);

  const steps = data ? funnelSteps(data.funnel) : [];
  const top = steps[0]?.value ?? 0;
  const pageMax = Math.max(1, ...(data?.pages ?? []).map((p) => p.views));
  const tabMax = Math.max(1, ...(data?.tabs ?? []).map((t) => t.views));
  const srcMax = Math.max(1, ...(data?.sources ?? []).map((s) => s.visits));

  return (
    <>
      <S.StatBar>
        {RANGES.map((r) => (
          <S.Chip
            key={r.days}
            type="button"
            $on={days === r.days}
            onClick={() => setDays(r.days)}
          >
            최근 {r.label}
          </S.Chip>
        ))}
      </S.StatBar>

      {failed ? (
        <S.Empty>
          통계를 불러오지 못했습니다. 마이그레이션 0005 가 적용됐는지 확인해
          주세요.
        </S.Empty>
      ) : !data ? null : steps[0].value === 0 ? (
        <S.Empty>이 기간에 쌓인 기록이 없습니다.</S.Empty>
      ) : (
        <>
          <S.Funnel>
            {steps.map((s, i) => {
              const prev = i === 0 ? null : steps[i - 1];
              const rate =
                prev && prev.value > 0
                  ? Math.round((s.value / prev.value) * 100)
                  : null;
              return (
                <S.FunnelStep
                  key={s.label}
                  $ratio={top > 0 ? s.value / top : 0}
                  $last={i === steps.length - 1}
                >
                  <div>
                    <span className="label">{s.label}</span>
                    <span className="count">
                      {s.value.toLocaleString()}
                      <small>명</small>
                    </span>
                  </div>
                  <div className="track">
                    <span className="fill" />
                  </div>
                  {rate !== null && (
                    <S.FunnelDrop>
                      앞 단계에서 <b>{rate}%</b> 이어짐
                      {prev && (
                        <> · {(prev.value - s.value).toLocaleString()}명 이탈</>
                      )}
                    </S.FunnelDrop>
                  )}
                </S.FunnelStep>
              );
            })}
          </S.Funnel>

          <S.StatGrid>
            <S.StatBlock>
              <h2>페이지</h2>
              {data.pages.length === 0 ? (
                <S.Empty>기록 없음</S.Empty>
              ) : (
                <S.StatRows>
                  {data.pages.map((p) => (
                    <S.StatRow key={p.path} $ratio={p.views / pageMax}>
                      <span>{p.path}</span>
                      <strong>
                        {p.views.toLocaleString()}
                        <em>{p.visitors.toLocaleString()}명</em>
                      </strong>
                    </S.StatRow>
                  ))}
                </S.StatRows>
              )}
            </S.StatBlock>

            <S.StatBlock>
              <h2>탭</h2>
              {data.tabs.length === 0 ? (
                <S.Empty>기록 없음</S.Empty>
              ) : (
                <S.StatRows>
                  {data.tabs.map((t) => (
                    <S.StatRow
                      key={`${t.path}-${t.tab}`}
                      $ratio={t.views / tabMax}
                    >
                      <span>
                        {t.path.replace("/", "")} · {t.tab}
                      </span>
                      <strong>
                        {t.views.toLocaleString()}
                        <em>{t.visitors.toLocaleString()}명</em>
                      </strong>
                    </S.StatRow>
                  ))}
                </S.StatRows>
              )}
            </S.StatBlock>

            <S.StatBlock>
              <h2>유입 경로</h2>
              {data.sources.length === 0 ? (
                <S.Empty>기록 없음</S.Empty>
              ) : (
                <S.StatRows>
                  {data.sources.map((s) => (
                    <S.StatRow key={s.source} $ratio={s.visits / srcMax}>
                      <span>{s.source}</span>
                      <strong>
                        {s.visits.toLocaleString()}
                        <em>명</em>
                      </strong>
                    </S.StatRow>
                  ))}
                </S.StatRows>
              )}
            </S.StatBlock>
          </S.StatGrid>
        </>
      )}
    </>
  );
}

/* ─── 명단 등록 ───────────────────────────────────────────────────────── */

/**
 * 명단을 올려두면 그 메일로 가입한 사람은 승인 없이 통과한다.
 *
 * 형식을 강요하지 않는다. 엑셀에서 복사하면 탭, 손으로 적으면 쉼표로 나뉘고
 * 열 순서도 제각각이라, 붙여넣은 것을 그대로 받아 화면에서 해석한다. 저장 전에
 * 몇 줄이 읽혔고 몇 줄이 왜 빠졌는지 보여주는 편이 형식을 설명하는 것보다 빠르다.
 */
function RosterForm({ onSaved }: { onSaved: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [bad, setBad] = useState(false);

  const parsed: RosterParse = useMemo(() => parseRoster(text), [text]);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || parsed.rows.length === 0) return;
    setBusy(true);
    setMsg("");

    const { error } = await createClient().rpc("upsert_roster", {
      p_rows: parsed.rows,
    });

    if (error) {
      setBad(true);
      setMsg("저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } else {
      setBad(false);
      setMsg(
        `${parsed.rows.length}명 저장했습니다. 이미 가입해 대기 중이던 사람은 함께 승인됐습니다.`,
      );
      setText("");
      onSaved();
    }
    setBusy(false);
  };

  return (
    <S.FormWide onSubmit={save}>
      <S.Field>
        <span>명단 붙여넣기</span>
        <S.Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            "hong@gmail.com, 14, 홍길동\nkim@gmail.com, 13, 김철수, 부대표"
          }
          rows={10}
        />
        <small>
          엑셀에서 복사해 붙여넣어도 됩니다. 메일·기수·이름 순서는 상관없고, 네
          번째 칸에 직책을 적으면 함께 저장됩니다.
        </small>
      </S.Field>

      <S.Field>
        <span>파일에서 불러오기</span>
        <S.FileInput
          type="file"
          accept=".csv,.tsv,.txt,text/csv,text/plain"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) readFile(f);
            e.target.value = "";
          }}
        />
        <small>
          엑셀은 &lsquo;다른 이름으로 저장 &rarr; CSV&rsquo; 로 내보낸 뒤
          올려주세요.
        </small>
      </S.Field>

      {text.trim() !== "" && (
        <S.Preview>
          <strong>{parsed.rows.length}명 인식</strong>
          {parsed.rows.length > 0 && (
            <ul>
              {parsed.rows.slice(0, 5).map((r) => (
                <li key={r.email}>
                  {r.generation}기 {r.name}
                  {r.title ? ` · ${r.title}` : ""} — {r.email}
                </li>
              ))}
              {parsed.rows.length > 5 && <li>외 {parsed.rows.length - 5}명</li>}
            </ul>
          )}
          {parsed.skipped.length > 0 && (
            <S.PreviewSkipped>
              <strong>{parsed.skipped.length}줄 건너뜀</strong>
              <ul>
                {parsed.skipped.slice(0, 5).map((s, i) => (
                  <li key={i}>
                    {s.reason} — {s.line}
                  </li>
                ))}
                {parsed.skipped.length > 5 && (
                  <li>외 {parsed.skipped.length - 5}줄</li>
                )}
              </ul>
            </S.PreviewSkipped>
          )}
        </S.Preview>
      )}

      {msg && <S.Notice $bad={bad}>{msg}</S.Notice>}

      <S.Submit type="submit" disabled={busy || parsed.rows.length === 0}>
        {busy ? "저장 중" : `${parsed.rows.length}명 명단에 등록`}
      </S.Submit>
    </S.FormWide>
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
