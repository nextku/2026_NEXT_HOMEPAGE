import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

import { Application, Rejected, Waiting } from "components/member/AuthStates";
import MyProfile from "components/member/MyProfile";
import {
  authorText,
  fetchBoards,
  fetchPosts,
  whenText,
  type Board,
  type PostListItem,
} from "lib/community";
import { memberLabel, needsApplication } from "lib/memberLabel";
import { signOut, useAuth } from "lib/supabase/useAuth";
import * as C from "styles/community/style";
import * as S from "styles/member/style";

/**
 * 학회원 게시판.
 *
 * 승인 전에는 절차를 안내하고, 승인된 뒤에는 게시판이 열린다. 한 주소가 두
 * 얼굴을 갖는 이유는 사용자가 하는 일이 "학회원 공간에 들어간다" 하나이기
 * 때문이다. 주소를 나누면 승인 직후 어디로 가야 하는지 다시 알려줘야 한다.
 */
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
  const [rewriting, setRewriting] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  const body = () => {
    if (loading || !session) return null;

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
            <S.Approve type="button" onClick={() => signOut("/login")}>
              다시 로그인
            </S.Approve>
          </S.Actions>
        </S.Narrow>
      );
    }

    if (needsApplication(profile) || rewriting) {
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

    if (showProfile) {
      return (
        <C.Wrap>
          <C.Head>
            <div>
              <h1>내 정보</h1>
              <p>{profile.email}</p>
            </div>
            <C.Ghost type="button" onClick={() => setShowProfile(false)}>
              게시판으로
            </C.Ghost>
          </C.Head>
          <MyProfile profile={profile} onSaved={refresh} />
        </C.Wrap>
      );
    }

    return (
      <Community
        name={profile.name}
        label={memberLabel(profile)}
        isApproved={isApproved}
        isAdmin={isAdmin}
        onProfile={() => setShowProfile(true)}
      />
    );
  };

  return (
    <>
      <Head>
        <title>학회원 게시판 | 고려대학교 소프트웨어 창업학회 NEXT</title>
        <meta name="robots" content="noindex" />
      </Head>
      <S.Page>{body()}</S.Page>
    </>
  );
}

/* ─── 게시판 ──────────────────────────────────────────────────────────── */

function Community({
  name,
  label,
  isApproved,
  isAdmin,
  onProfile,
}: {
  name: string;
  label: string;
  isApproved: boolean;
  isAdmin: boolean;
  onProfile: () => void;
}) {
  const router = useRouter();
  const boardSlug = (router.query.board as string) || null;

  const [boards, setBoards] = useState<Board[]>([]);
  const [posts, setPosts] = useState<PostListItem[] | null>(null);

  useEffect(() => {
    if (!isApproved) return;
    fetchBoards().then(setBoards);
  }, [isApproved]);

  useEffect(() => {
    if (!isApproved) return;
    let alive = true;
    setPosts(null);
    fetchPosts(boardSlug).then((rows) => {
      if (alive) setPosts(rows);
    });
    return () => {
      alive = false;
    };
  }, [isApproved, boardSlug]);

  const current = useMemo(
    () => boards.find((b) => b.slug === boardSlug) ?? null,
    [boards, boardSlug],
  );

  // 공지처럼 운영진만 쓰는 판에서는 글쓰기 버튼을 보여주지 않는다.
  const canWrite = !current || current.write_role === "member" || isAdmin;

  const go = (slug: string | null) =>
    router.push(slug ? `/members?board=${slug}` : "/members", undefined, {
      shallow: true,
    });

  return (
    <C.Wrap>
      <C.Head>
        <div>
          <h1>{current ? current.name : "게시판"}</h1>
          <p>
            {current?.description ??
              `${label ? `${label} · ` : ""}${name}님, 학회원에게만 공개되는 공간입니다.`}
          </p>
        </div>
        <C.Row>
          {canWrite && (
            <C.Primary
              type="button"
              onClick={() =>
                router.push(
                  boardSlug
                    ? `/members/write?board=${boardSlug}`
                    : "/members/write",
                )
              }
            >
              글쓰기
            </C.Primary>
          )}
          <C.Ghost type="button" onClick={onProfile}>
            내 정보
          </C.Ghost>
          {isAdmin && (
            <C.Ghost type="button" onClick={() => router.push("/admin")}>
              운영진
            </C.Ghost>
          )}
          <C.Back type="button" onClick={() => signOut()}>
            로그아웃
          </C.Back>
        </C.Row>
      </C.Head>

      <C.BoardNav>
        <C.BoardTab type="button" $on={!boardSlug} onClick={() => go(null)}>
          전체
        </C.BoardTab>
        {boards.map((b) => (
          <C.BoardTab
            key={b.id}
            type="button"
            $on={boardSlug === b.slug}
            onClick={() => go(b.slug)}
          >
            {b.name}
          </C.BoardTab>
        ))}
      </C.BoardNav>

      {posts === null ? null : posts.length === 0 ? (
        <C.Empty>
          아직 글이 없습니다.
          {canWrite && " 첫 글을 남겨보세요."}
        </C.Empty>
      ) : (
        <C.List>
          {posts.map((p) => (
            <PostRow key={p.id} post={p} showBoard={!boardSlug} />
          ))}
        </C.List>
      )}
    </C.Wrap>
  );
}

function PostRow({
  post,
  showBoard,
}: {
  post: PostListItem;
  showBoard: boolean;
}) {
  const router = useRouter();

  return (
    <C.Item>
      <C.ItemLink
        href={`/members/${post.id}`}
        onClick={(e) => {
          // 새 탭으로 열고 싶은 사람을 막지 않는다.
          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
          e.preventDefault();
          router.push(`/members/${post.id}`);
        }}
      >
        <C.ItemMain>
          <C.ItemTop>
            {post.pinned && <C.Pin>고정</C.Pin>}
            {showBoard && <C.BoardChip>{post.board_name}</C.BoardChip>}
            {post.company && <C.BoardChip>{post.company}</C.BoardChip>}
          </C.ItemTop>

          <C.ItemTitle>{post.title}</C.ItemTitle>
          {post.excerpt && <C.ItemExcerpt>{post.excerpt}</C.ItemExcerpt>}

          <C.ItemMeta>
            <b>
              {authorText(
                post.author_name,
                post.author_generation,
                post.author_title,
              )}
            </b>
            <span>{whenText(post.created_at)}</span>
            {post.comment_count > 0 && <span>댓글 {post.comment_count}</span>}
            {post.like_count > 0 && <span>좋아요 {post.like_count}</span>}
            {post.view_count > 0 && <span>조회 {post.view_count}</span>}
            {post.deadline && <span>마감 {post.deadline}</span>}
          </C.ItemMeta>
        </C.ItemMain>

        {post.cover_url && (
          <C.Thumb>
            <img src={post.cover_url} alt="" loading="lazy" />
          </C.Thumb>
        )}
      </C.ItemLink>
    </C.Item>
  );
}
