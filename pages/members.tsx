import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

import { DEPARTMENT } from "constants/people";
import {
  GENERATIONS,
  POST_CATEGORIES,
  categoryLabel,
  formatDate,
  formatDay,
  safeLink,
  type Post,
} from "constants/member";
import MyProfile from "components/member/MyProfile";
import { createClient } from "lib/supabase/client";
import {
  signOut,
  signOutAndLogin,
  useAuth,
  type Profile,
} from "lib/supabase/useAuth";
import * as S from "styles/member/style";

/**
 * 학회원 라운지.
 *
 * 한 화면이 상태에 따라 네 가지 얼굴을 가진다.
 *   신청서 미작성 → 기수·학과를 받는다
 *   승인 대기     → 기다려 달라고 알린다
 *   거절          → 사유를 보여준다
 *   승인          → 게시물을 보여준다
 * 화면 분기는 표시용이고, 실제 차단은 RLS 가 한다. 승인 전 계정이 이 페이지를
 * 강제로 열어도 posts 조회는 빈 배열로 돌아온다.
 */

const DEPARTMENTS = Object.values(DEPARTMENT);

export default function Members() {
  const router = useRouter();
  const {
    session,
    profile,
    profileError,
    loading,
    isApproved,
    isAdmin,
    refresh,
  } = useAuth();
  // 거절당한 사람이 신청서를 다시 열었을 때만 켜진다.
  const [rewriting, setRewriting] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  const body = () => {
    if (loading || !session) return null;

    /*
     * 로그인은 돼 있는데 프로필이 없는 상태.
     *
     * 대부분은 브라우저에 남은 세션이 이미 지워진 계정을 가리키는 경우다.
     * 계정을 지웠다 다시 만들면 id 가 새로 발급되는데, 예전 토큰은 옛 id 를
     * 들고 있어서 조회 결과가 비어 있게 된다. 이때 새로고침은 아무 소용이 없다.
     * 다시 로그인해야 풀리므로 그 버튼을 준다.
     *
     * 조회 자체가 실패한 경우(정책·테이블 문제)는 원인이 전혀 다르니
     * 오류 문구를 그대로 보여줘 헤매지 않게 한다.
     */
    if (!profile) {
      return (
        <S.Narrow>
          <S.Intro>
            <h1>다시 로그인해 주세요</h1>
            <p>
              로그인 정보가 더 이상 유효하지 않습니다. 계정을 다시 만들었거나
              오래된 로그인이 남아 있는 경우입니다.
            </p>
          </S.Intro>

          {profileError && (
            <S.Notice $bad style={{ marginBottom: "1.6rem" }}>
              {profileError}
            </S.Notice>
          )}

          <S.Actions>
            <S.Approve type="button" onClick={signOutAndLogin}>
              다시 로그인
            </S.Approve>
          </S.Actions>
        </S.Narrow>
      );
    }

    if (profile.generation === null || rewriting) {
      return (
        <Application
          profile={profile}
          onDone={() => {
            setRewriting(false);
            refresh();
          }}
        />
      );
    }
    if (profile.status === "pending") return <Waiting profile={profile} />;
    if (profile.status === "rejected") {
      return (
        <Rejected profile={profile} onRewrite={() => setRewriting(true)} />
      );
    }
    return (
      <Lounge
        profile={profile}
        isAdmin={isAdmin}
        isApproved={isApproved}
        onProfileSaved={refresh}
      />
    );
  };

  return (
    <>
      <Head>
        <title>학회원 라운지 | 고려대학교 소프트웨어 창업학회 NEXT</title>
        <meta name="robots" content="noindex" />
      </Head>
      <S.Page>{body()}</S.Page>
    </>
  );
}

/* ─── 신청서 ──────────────────────────────────────────────────────────── */

function Application({
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
        <S.SignOut type="button" onClick={signOut}>
          다른 계정으로 로그인
        </S.SignOut>
      </S.Foot>
    </S.Narrow>
  );
}

/* ─── 대기 · 거절 ─────────────────────────────────────────────────────── */

function Waiting({ profile }: { profile: Profile }) {
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
        <S.SignOut type="button" onClick={signOut}>
          로그아웃
        </S.SignOut>
      </S.Foot>
    </S.Narrow>
  );
}

function Rejected({
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
        <S.Reject type="button" onClick={signOut}>
          로그아웃
        </S.Reject>
      </S.Actions>
    </S.Narrow>
  );
}

/* ─── 라운지 ──────────────────────────────────────────────────────────── */

function Lounge({
  profile,
  isAdmin,
  isApproved,
  onProfileSaved,
}: {
  profile: Profile;
  isAdmin: boolean;
  isApproved: boolean;
  onProfileSaved: () => void;
}) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [filter, setFilter] = useState<string>("all");
  // 내 정보는 자주 열지 않는다. 평소에는 접어두고 필요할 때만 편다.
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!isApproved) return;
    let alive = true;
    createClient()
      .from("posts")
      .select("id, category, title, body, link, company, deadline, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (alive) setPosts((data as Post[]) ?? []);
      });
    return () => {
      alive = false;
    };
  }, [isApproved]);

  // 글이 하나도 없는 분류를 눌러볼 수 있게 두면 헛걸음만 시킨다.
  const used = useMemo(() => {
    const set = new Set((posts ?? []).map((p) => p.category));
    return POST_CATEGORIES.filter((c) => set.has(c.key));
  }, [posts]);

  const shown = (posts ?? []).filter(
    (p) => filter === "all" || p.category === filter,
  );

  return (
    <S.Wrap>
      <S.TopBar>
        <S.Intro style={{ marginBottom: 0 }}>
          <h1>{profile.name}님, 환영합니다</h1>
          <p>
            {profile.generation}기{profile.title ? ` · ${profile.title}` : ""} ·
            학회원에게만 공개되는 채용·투자·행사 정보입니다.
          </p>
        </S.Intro>
        <S.Actions>
          <S.Promote type="button" onClick={() => setShowProfile((v) => !v)}>
            {showProfile ? "목록 보기" : "내 정보"}
          </S.Promote>
          {isAdmin && (
            <S.Promote type="button" onClick={() => router.push("/admin")}>
              운영진 페이지
            </S.Promote>
          )}
          <S.SignOut type="button" onClick={signOut}>
            로그아웃
          </S.SignOut>
        </S.Actions>
      </S.TopBar>

      {showProfile ? (
        <MyProfile profile={profile} onSaved={onProfileSaved} />
      ) : (
        <>
          {used.length > 0 && (
            <S.Filters>
              <S.Chip
                type="button"
                $on={filter === "all"}
                onClick={() => setFilter("all")}
              >
                전체
              </S.Chip>
              {used.map((c) => (
                <S.Chip
                  key={c.key}
                  type="button"
                  $on={filter === c.key}
                  onClick={() => setFilter(c.key)}
                >
                  {c.label}
                </S.Chip>
              ))}
            </S.Filters>
          )}

          {posts === null ? null : shown.length === 0 ? (
            <S.Empty>아직 올라온 글이 없습니다.</S.Empty>
          ) : (
            <S.PostList>
              {shown.map((p) => {
                const href = safeLink(p.link);
                return (
                  <S.PostCard key={p.id}>
                    <S.PostTop>
                      <S.Kind>{categoryLabel(p.category)}</S.Kind>
                      {p.company && <span>{p.company}</span>}
                      <time dateTime={p.created_at}>
                        {formatDate(p.created_at)}
                      </time>
                      {p.deadline && <span>마감 {formatDay(p.deadline)}</span>}
                    </S.PostTop>
                    <S.PostTitle>{p.title}</S.PostTitle>
                    <S.PostBody>{p.body}</S.PostBody>
                    {href && (
                      <S.PostLink
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>자세히 보기</span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </S.PostLink>
                    )}
                  </S.PostCard>
                );
              })}
            </S.PostList>
          )}
        </>
      )}
    </S.Wrap>
  );
}
