import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { PEOPLE_INFORMATION } from "constants/people";
import { POST_CATEGORIES } from "constants/member";
import DailyChart from "components/member/DailyChart";
import { memberTags } from "lib/memberLabel";
import { parseRoster, type RosterParse } from "lib/roster";
import { createClient } from "lib/supabase/client";
import {
  signOut,
  transferOwnership,
  useAuth,
  type Profile,
} from "lib/supabase/useAuth";
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

/*
 * 직책 고르기.
 *
 * 거의 다 이 넷 중 하나다. 매번 타이핑하면 "부대표" 와 "부 대표" 가 섞이고,
 * 그러면 나중에 세거나 거르지 못한다. 다만 팀장처럼 기수마다 생기는 직책이
 * 있어서 마지막에 직접 입력을 남겨둔다.
 *
 * 빈 값이 곧 일반 학회원이다. '학회원' 이라는 직책을 따로 저장하지 않는다.
 */
const TITLE_PRESETS = ["대표", "부대표", "운영진"] as const;

export default function Admin() {
  const router = useRouter();
  const { session, profile, loading, isAdmin, isOwner } = useAuth();
  /*
   * 탭을 주소에 둔다. 상태로만 두면 새로고침할 때마다 첫 탭으로 돌아가고,
   * 통계를 보다가 실수로 새로고침하면 다시 찾아 들어가야 한다.
   * 링크로 특정 탭을 바로 열 수도 있다.
   */
  const tab = ((router.query.tab as string) || "pending") as Tab;
  const setTab = (next: Tab) =>
    router.replace(
      { pathname: "/admin", query: next === "pending" ? {} : { tab: next } },
      undefined,
      { shallow: true },
    );
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
              <S.Reject type="button" onClick={() => signOut()}>
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
              <S.SignOut type="button" onClick={() => signOut()}>
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
                  viewerIsOwner={isOwner}
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
  viewerIsOwner,
  onDone,
}: {
  row: Profile;
  isSelf: boolean;
  viewerIsOwner: boolean;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [name, setName] = useState(row.name ?? "");
  const [department, setDepartment] = useState(row.department ?? "");
  const [generation, setGeneration] = useState(
    row.generation ? String(row.generation) : "",
  );
  const [title, setTitle] = useState(row.title ?? "");
  const [staffGen, setStaffGen] = useState(
    row.staff_generation ? String(row.staff_generation) : "",
  );
  // 목록에 없는 직책을 가진 사람은 열자마자 직접 입력 상태여야 한다.
  const [custom, setCustom] = useState(
    !!row.title && !TITLE_PRESETS.includes(row.title as never),
  );
  const [isAdminRole, setIsAdminRole] = useState(row.role === "admin");
  const [handing, setHanding] = useState(false);

  /*
   * 필드를 한 줄에 늘어놓으면 좁은 화면에서 서로를 밀어낸다. 평소에는 요약만
   * 보이고, 고칠 때만 펼친다. 목록을 훑는 일이 고치는 일보다 훨씬 잦다.
   */
  const save = async () => {
    setBusy(true);
    setMsg("");

    const { error } = await createClient()
      .from("profiles")
      .update({
        name: name.trim(),
        department: department.trim() || null,
        generation: generation ? Number(generation) : null,
        title: title.trim() || null,
        // 직책이 없으면 그 기수도 의미가 없다.
        staff_generation: title.trim() && staffGen ? Number(staffGen) : null,
        // 관리자 계정의 권한은 이 화면에서 바꾸지 않는다. 이전으로만 움직인다.
        role: row.is_owner ? row.role : isAdminRole ? "admin" : "member",
      })
      .eq("id", row.id);

    if (error) setMsg("저장하지 못했습니다.");
    else {
      setOpen(false);
      onDone();
    }
    setBusy(false);
  };

  return (
    <S.Row>
      <S.Who>
        <strong>{row.name || "이름 없음"}</strong>
        <p>
          {row.department ? `${row.department} · ` : ""}
          {row.email}
        </p>
        {memberTags(row).length > 0 && (
          <S.Tags>
            {memberTags(row).map((t) => (
              <S.Tag key={t} $strong={t === "관리자"}>
                {t}
              </S.Tag>
            ))}
          </S.Tags>
        )}
      </S.Who>

      {!open ? (
        <S.Actions>
          {!row.is_owner && row.role === "admin" && (
            <S.Badge $tone="approved">운영진</S.Badge>
          )}
          <S.Promote type="button" onClick={() => setOpen(true)}>
            수정
          </S.Promote>
        </S.Actions>
      ) : (
        <S.EditBox>
          <S.EditGrid>
            <S.Field>
              <span>이름</span>
              <S.Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
              />
            </S.Field>
            <S.Field>
              <span>기수</span>
              <S.Input
                value={generation}
                onChange={(e) =>
                  setGeneration(e.target.value.replace(/\D/g, "").slice(0, 2))
                }
                inputMode="numeric"
                placeholder="14"
              />
            </S.Field>
            <S.Field>
              <span>학과</span>
              <S.Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                maxLength={30}
              />
            </S.Field>
            <S.FieldWide>
              <span>직책</span>
              <S.Segmented>
                <S.Chip
                  type="button"
                  $on={!custom && !title}
                  onClick={() => {
                    setCustom(false);
                    setTitle("");
                  }}
                >
                  학회원
                </S.Chip>
                {TITLE_PRESETS.map((t) => (
                  <S.Chip
                    key={t}
                    type="button"
                    $on={!custom && title === t}
                    onClick={() => {
                      setCustom(false);
                      setTitle(t);
                    }}
                  >
                    {t}
                  </S.Chip>
                ))}
                <S.Chip
                  type="button"
                  $on={custom}
                  onClick={() => {
                    setCustom(true);
                    if (TITLE_PRESETS.includes(title as never)) setTitle("");
                  }}
                >
                  직접 입력
                </S.Chip>
              </S.Segmented>
              {custom && (
                <S.Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="개발팀장, 학술부 등"
                  maxLength={20}
                  autoFocus
                />
              )}
            </S.FieldWide>
            <S.Field>
              <span>직책 기수</span>
              <S.Input
                value={staffGen}
                onChange={(e) =>
                  setStaffGen(e.target.value.replace(/\D/g, "").slice(0, 2))
                }
                inputMode="numeric"
                placeholder={generation || "15"}
                disabled={!title.trim()}
              />
              <small>입회 기수와 다를 때만 적으면 됩니다.</small>
            </S.Field>
          </S.EditGrid>

          {/*
            직책과 별개다. 직책은 학회 안에서 무엇으로 불리는가이고, 이것은
            이 화면에 들어올 수 있는가다. 대표라도 이 칸을 켜지 않으면 못 들어오고,
            NEXT 공용 계정처럼 직책 없이 권한만 가진 경우도 있다.

            DB 의 값은 그대로 'admin' 이다. 화면에서 부르는 이름만 바꿨다 —
            열거형을 고치면 정책과 함수까지 모두 따라가야 하는데 얻는 것이 없다.
          */}
          {row.is_owner ? (
            <S.Notice>
              학회 공용 관리자 계정입니다. 운영진이 하는 모든 일을 할 수 있고,
              권한은 아래 이전으로만 옮길 수 있습니다.
            </S.Notice>
          ) : (
            <S.Check>
              <input
                type="checkbox"
                checked={isAdminRole}
                onChange={(e) => setIsAdminRole(e.target.checked)}
                disabled={isSelf}
              />
              <span>
                운영진 권한
                <small>
                  {isSelf
                    ? "본인 권한은 스스로 내릴 수 없습니다."
                    : "승인·명단·통계 화면에 들어올 수 있습니다."}
                </small>
              </span>
            </S.Check>
          )}

          {/*
            이전은 관리자만, 그리고 자기 자신이 아닌 승인된 계정에만 보인다.
            되돌리려면 받은 쪽에서 다시 넘겨줘야 하므로 한 번 묻는다.
          */}
          {viewerIsOwner && !row.is_owner && row.status === "approved" && (
            <S.Actions>
              <S.Reject
                type="button"
                disabled={handing || busy}
                onClick={async () => {
                  const ok = window.confirm(
                    `관리자 권한을 ${row.name || row.email} 에게 넘깁니다.\n` +
                      "넘긴 뒤에는 본인이 되돌릴 수 없고, 받은 쪽에서 다시 넘겨야 합니다.",
                  );
                  if (!ok) return;
                  setHanding(true);
                  const err = await transferOwnership(row.id);
                  if (err) setMsg(err);
                  else onDone();
                  setHanding(false);
                }}
              >
                {handing ? "넘기는 중" : "관리자 권한 넘기기"}
              </S.Reject>
            </S.Actions>
          )}

          {msg && <S.Notice $bad>{msg}</S.Notice>}

          <S.Actions>
            <S.Approve type="button" disabled={busy} onClick={save}>
              {busy ? "저장 중" : "저장"}
            </S.Approve>
            <S.Promote type="button" onClick={() => setOpen(false)}>
              취소
            </S.Promote>
          </S.Actions>
        </S.EditBox>
      )}
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
  daily: { day: string; visitors: number }[];
  internal_visitors: number;
};

const RANGES = [
  { days: 1, label: "오늘" },
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
            {r.days === 1 ? r.label : `최근 ${r.label}`}
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

          <S.StatBlock style={{ marginBottom: "clamp(2.4rem, 4vw, 3.6rem)" }}>
            <h2>일별 방문자</h2>
            <DailyChart rows={data.daily ?? []} days={data.days} />
            {/*
              빼놓고 말하지 않으면 "왜 이것밖에 안 되지" 를 묻게 된다.
              얼마를 뺐는지 같이 적는다.
            */}
            {data.internal_visitors > 0 && (
              <S.Notice style={{ marginTop: "0.8rem" }}>
                학회원·운영진 {data.internal_visitors}명의 방문은 빼고 셌습니다.
              </S.Notice>
            )}
          </S.StatBlock>

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
            "hong@gmail.com, 14, 홍길동\n" +
            "kim@gmail.com, 13, 김철수, 부대표\n" +
            "lee@gmail.com, 14, 이영희, 대표, 15"
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
                  {r.title
                    ? r.staff_generation
                      ? ` · ${r.staff_generation}기 ${r.title}`
                      : ` · ${r.title}`
                    : ""}{" "}
                  — {r.email}
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
