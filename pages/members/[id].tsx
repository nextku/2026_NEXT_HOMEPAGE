import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import {
  authorText,
  fetchComments,
  fetchMyLike,
  fetchPost,
  toggleLike,
  whenText,
  type Comment,
  type Post,
} from "lib/community";
import { createClient } from "lib/supabase/client";
import { useAuth } from "lib/supabase/useAuth";
import * as C from "styles/community/style";
import * as S from "styles/member/style";

const PostBody = dynamic(() => import("components/editor/PostBody"), {
  ssr: false,
});

/**
 * 글 읽기.
 *
 * 본문을 넓게 두고 나머지는 뒤로 뺀다. 게시판에서 가장 오래 머무는 화면이라
 * 여기서 시선을 뺏는 것은 전부 방해다.
 */
export default function PostPage() {
  const router = useRouter();
  const { session, profile, loading, isApproved, isAdmin } = useAuth();
  const id = router.query.id as string | undefined;

  const [post, setPost] = useState<Post | null>(null);
  const [boardName, setBoardName] = useState("");
  const [author, setAuthor] = useState<{
    name: string | null;
    generation: number | null;
    title: string | null;
  } | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  // 댓글을 못 읽은 것과 댓글이 없는 것은 화면이 구분해서 말해야 한다.
  const [commentError, setCommentError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  useEffect(() => {
    if (!isApproved || !id) return;
    let alive = true;

    (async () => {
      const p = await fetchPost(id);
      if (!alive) return;
      if (!p) {
        setMissing(true);
        return;
      }
      setPost(p);

      const supabase = createClient();
      const [{ data: b }, { data: pr }, { count }] = await Promise.all([
        supabase
          .from("boards")
          .select("name")
          .eq("id", p.board_id)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("name, generation, title")
          .eq("id", p.author_id)
          .maybeSingle(),
        supabase
          .from("post_likes")
          .select("post_id", { count: "exact", head: true })
          .eq("post_id", id),
      ]);

      if (!alive) return;
      setBoardName((b as { name: string } | null)?.name ?? "");
      setAuthor(pr as typeof author);
      setLikes(count ?? 0);

      if (session) setLiked(await fetchMyLike(id, session.user.id));
      const c = await fetchComments(id);
      setComments(c.rows);
      setCommentError(c.error);

      // 조회수는 한 번만. 새로고침마다 올리면 글쓴이 본인이 제일 많이 올린다.
      const seenKey = `nextku_seen_${id}`;
      try {
        if (!sessionStorage.getItem(seenKey)) {
          sessionStorage.setItem(seenKey, "1");
          void supabase.rpc("bump_view", { p_post: id });
        }
      } catch {
        /* 저장소를 못 쓰면 세지 않는다 */
      }
    })();

    return () => {
      alive = false;
    };
  }, [isApproved, id, session]);

  const mine = !!post && !!session && post.author_id === session.user.id;

  const onLike = async () => {
    if (!session || !post) return;
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    await toggleLike(post.id, session.user.id, next);
  };

  const remove = async () => {
    if (!post) return;
    if (!window.confirm("이 글을 지웁니다. 되돌릴 수 없습니다.")) return;
    await createClient().from("posts").delete().eq("id", post.id);
    router.replace("/members");
  };

  if (loading || !session) return null;

  return (
    <>
      <Head>
        <title>{post ? `${post.title} | NEXT` : "글 | NEXT"}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <S.Page>
        <C.Reading>
          <C.Spread style={{ marginBottom: "1.6rem" }}>
            <C.Back type="button" onClick={() => router.push("/members")}>
              ← 게시판
            </C.Back>
            {mine || isAdmin ? (
              <C.Row>
                {mine && (
                  <C.Ghost
                    type="button"
                    onClick={() => router.push(`/members/write?id=${post!.id}`)}
                  >
                    고치기
                  </C.Ghost>
                )}
                <C.Ghost type="button" onClick={remove}>
                  지우기
                </C.Ghost>
              </C.Row>
            ) : null}
          </C.Spread>

          {missing ? (
            <C.Empty>글을 찾을 수 없습니다. 지워졌을 수 있습니다.</C.Empty>
          ) : !post ? null : (
            <>
              <C.PostHead>
                <C.BoardChip>{boardName}</C.BoardChip>
                <h1>{post.title}</h1>
                <C.Byline>
                  <b>
                    {authorText(
                      author?.name ?? null,
                      author?.generation ?? null,
                      author?.title,
                    )}
                  </b>
                  <span>{whenText(post.created_at)}</span>
                  {post.view_count > 0 && <span>조회 {post.view_count}</span>}
                  {post.company && <span>{post.company}</span>}
                  {post.deadline && <span>마감 {post.deadline}</span>}
                </C.Byline>
              </C.PostHead>

              <PostBody doc={post.content} />

              <C.Row style={{ marginTop: "clamp(2.4rem, 4vw, 3.6rem)" }}>
                <C.Like type="button" $on={liked} onClick={onLike}>
                  <svg
                    viewBox="0 0 24 24"
                    fill={liked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0112 7a4.5 4.5 0 017 3.5c0 5.15-7 9.5-7 9.5z" />
                  </svg>
                  {likes > 0 ? likes : "좋아요"}
                </C.Like>
              </C.Row>

              <CommentSection
                postId={post.id}
                comments={comments}
                loadError={commentError}
                meId={session.user.id}
                meName={profile?.name ?? ""}
                isAdmin={isAdmin}
                reload={async () => {
                  const c = await fetchComments(post.id);
                  setComments(c.rows);
                  setCommentError(c.error);
                }}
              />
            </>
          )}
        </C.Reading>
      </S.Page>
    </>
  );
}

/* ─── 댓글 ────────────────────────────────────────────────────────────── */

function CommentSection({
  postId,
  comments,
  loadError,
  meId,
  isAdmin,
  reload,
}: {
  postId: string;
  comments: Comment[] | null;
  /** 목록을 못 읽은 이유. 없으면 정상이다. */
  loadError: string | null;
  meId: string;
  meName: string;
  isAdmin: boolean;
  reload: () => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !body.trim()) return;
    setBusy(true);
    setError("");

    /*
     * 결과를 확인한다.
     *
     * 예전에는 insert 를 보내고 곧바로 입력창을 비웠다. 실패해도 화면에는
     * 아무 말이 없고 쓴 글만 사라져서, 눌렀는데 아무 일도 안 일어나는 것처럼
     * 보였다. 실패하면 쓴 글을 남겨두고 이유를 보여준다.
     */
    const { error: err } = await createClient()
      .from("post_comments")
      .insert({
        post_id: postId,
        parent_id: replyTo,
        author_id: meId,
        body: body.trim(),
      });

    if (err) {
      setError(`댓글을 올리지 못했습니다. ${err.message}`);
      setBusy(false);
      return;
    }

    setBody("");
    setReplyTo(null);
    await reload();
    setBusy(false);
  };

  /*
   * 지운 댓글은 자리를 남긴다. 통째로 없애면 그 아래 답글이 무엇에 대한
   * 답인지 알 수 없게 된다.
   */
  const remove = async (id: string) => {
    if (!window.confirm("댓글을 지웁니다.")) return;
    setError("");
    const { error: err } = await createClient()
      .from("post_comments")
      .update({ deleted_at: new Date().toISOString(), body: "" })
      .eq("id", id);
    if (err) {
      setError(`댓글을 지우지 못했습니다. ${err.message}`);
      return;
    }
    await reload();
  };

  const roots = (comments ?? []).filter((c) => !c.parent_id);
  const repliesOf = (id: string) =>
    (comments ?? []).filter((c) => c.parent_id === id);

  const one = (c: Comment, isReply: boolean) => (
    <C.Comment key={c.id} $reply={isReply}>
      <C.CommentHead>
        <b>
          {authorText(c.author?.name ?? null, c.author?.generation ?? null)}
        </b>
        <span>{whenText(c.created_at)}</span>
      </C.CommentHead>

      {c.deleted_at ? (
        <C.CommentBody style={{ color: "#a9a196" }}>
          지워진 댓글입니다.
        </C.CommentBody>
      ) : (
        <>
          <C.CommentBody>{c.body}</C.CommentBody>
          <C.CommentActions>
            {!isReply && (
              <button
                type="button"
                onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
              >
                {replyTo === c.id ? "답글 취소" : "답글"}
              </button>
            )}
            {(c.author_id === meId || isAdmin) && (
              <button type="button" onClick={() => remove(c.id)}>
                지우기
              </button>
            )}
          </C.CommentActions>
        </>
      )}

      {repliesOf(c.id).map((r) => one(r, true))}
    </C.Comment>
  );

  return (
    <C.Comments>
      <h2>댓글 {roots.length > 0 ? (comments ?? []).length : ""}</h2>

      {loadError ? (
        <C.EditorError>댓글을 불러오지 못했습니다. {loadError}</C.EditorError>
      ) : comments === null ? null : comments.length === 0 ? (
        <C.Empty style={{ padding: "2.4rem 0" }}>첫 댓글을 남겨보세요.</C.Empty>
      ) : (
        <C.CommentList>{roots.map((c) => one(c, false))}</C.CommentList>
      )}

      <C.CommentForm onSubmit={send}>
        <C.CommentInput
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={replyTo ? "답글을 적어주세요" : "댓글을 적어주세요"}
        />
        {error && <C.EditorError>{error}</C.EditorError>}
        <C.Row>
          {replyTo && (
            <C.Ghost type="button" onClick={() => setReplyTo(null)}>
              답글 취소
            </C.Ghost>
          )}
          <C.Primary type="submit" disabled={busy || !body.trim()}>
            {busy ? "올리는 중" : replyTo ? "답글 올리기" : "댓글 올리기"}
          </C.Primary>
        </C.Row>
      </C.CommentForm>
    </C.Comments>
  );
}
