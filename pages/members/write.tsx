import type { JSONContent } from "@tiptap/react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

import { fetchBoards, fetchPost, type Board } from "lib/community";
import { excerptFrom, firstImage, isEmptyDoc } from "lib/editor";
import { createClient } from "lib/supabase/client";
import { useAuth } from "lib/supabase/useAuth";
import * as C from "styles/community/style";
import * as S from "styles/member/style";

/*
 * 편집기는 브라우저에서만 뜬다. 서버에서 그리면 hydration 이 어긋나고,
 * 읽기만 하는 사람에게 편집기 코드를 내려보낼 이유도 없다.
 */
const PostEditor = dynamic(() => import("components/editor/PostEditor"), {
  ssr: false,
  loading: () => <C.EditorShell aria-busy="true" />,
});

/**
 * 글쓰기 · 고치기.
 *
 * ?id= 가 있으면 고치는 것이고 없으면 새 글이다. 화면이 거의 같아서 나누면
 * 같은 코드를 두 번 손봐야 한다.
 *
 * 쓰던 글은 브라우저에 임시 저장한다. 실수로 새로고침하거나 뒤로 가면 전부
 * 사라지는데, 긴 글일수록 그 손실이 크다.
 */

const DRAFT_KEY = "nextku_draft";

export default function Write() {
  const router = useRouter();
  const { session, profile, loading, isApproved, isAdmin } = useAuth();

  const editId = (router.query.id as string) || null;
  const queryBoard = (router.query.board as string) || null;

  const [boards, setBoards] = useState<Board[]>([]);
  const [boardId, setBoardId] = useState("");
  const [title, setTitle] = useState("");
  const [doc, setDoc] = useState<JSONContent | null>(null);
  const [company, setCompany] = useState("");
  const [deadline, setDeadline] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [savedNote, setSavedNote] = useState("");
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  useEffect(() => {
    if (!isApproved) return;
    fetchBoards().then(setBoards);
  }, [isApproved]);

  // 고치는 경우에는 기존 글을, 새 글이면 남아 있던 임시 저장을 불러온다.
  useEffect(() => {
    if (!isApproved || !router.isReady || ready) return;

    if (editId) {
      fetchPost(editId).then((p) => {
        if (p) {
          setBoardId(p.board_id);
          setTitle(p.title);
          setDoc(p.content);
          setCompany(p.company ?? "");
          setDeadline(p.deadline ?? "");
        }
        setReady(true);
      });
      return;
    }

    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setTitle(d.title ?? "");
        setDoc(d.doc ?? null);
        setBoardId(d.boardId ?? "");
        setSavedNote("쓰던 글을 불러왔습니다");
      }
    } catch {
      // 저장소를 못 읽어도 새 글로 시작하면 된다.
    }
    setReady(true);
  }, [isApproved, router.isReady, editId, ready]);

  // 게시판이 아직 안 정해졌으면 주소의 값, 그것도 없으면 첫 번째.
  useEffect(() => {
    if (boardId || boards.length === 0) return;
    const found = queryBoard && boards.find((b) => b.slug === queryBoard);
    setBoardId((found || boards[0]).id);
  }, [boards, boardId, queryBoard]);

  // 임시 저장. 고치는 중일 때는 하지 않는다 — 원본과 섞이면 되돌리기 어렵다.
  useEffect(() => {
    if (!ready || editId) return;
    const t = setTimeout(() => {
      try {
        if (!title.trim() && isEmptyDoc(doc)) return;
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ title, doc, boardId }),
        );
        setSavedNote("임시 저장됨");
      } catch {
        // 저장 못 해도 글 쓰는 데는 지장이 없다.
      }
    }, 800);
    return () => clearTimeout(t);
  }, [title, doc, boardId, ready, editId]);

  // 제목 칸이 내용에 따라 늘어나게. 두 줄짜리 제목이 잘리면 안 된다.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  const board = boards.find((b) => b.id === boardId);
  const isCareer = board?.slug === "career";
  const canWrite = !board || board.write_role === "member" || isAdmin;

  const submit = async () => {
    if (busy) return;
    if (!title.trim()) {
      setError("제목을 적어주세요.");
      return;
    }
    if (isEmptyDoc(doc)) {
      setError("내용을 적어주세요.");
      return;
    }

    setBusy(true);
    setError("");

    const supabase = createClient();
    const payload = {
      board_id: boardId,
      title: title.trim(),
      content: doc,
      // 목록에서 쓸 조각은 저장할 때 만들어 둔다. 열 때마다 본문을 훑지 않도록.
      excerpt: excerptFrom(doc!),
      cover_url: firstImage(doc!),
      body: excerptFrom(doc!, 2000),
      company: company.trim() || null,
      deadline: deadline || null,
      category: (board?.slug === "career" ? "job" : "notice") as string,
    };

    const res = editId
      ? await supabase
          .from("posts")
          .update(payload)
          .eq("id", editId)
          .select("id")
          .maybeSingle()
      : await supabase
          .from("posts")
          .insert({ ...payload, author_id: session!.user.id })
          .select("id")
          .maybeSingle();

    if (res.error || !res.data) {
      setError("올리지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setBusy(false);
      return;
    }

    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* 지우지 못해도 다음 글에서 덮인다 */
    }
    router.replace(`/members/${res.data.id}`);
  };

  if (loading || !session || !profile) return null;

  if (!isApproved) {
    return (
      <S.Page>
        <S.Narrow>
          <S.Intro>
            <h1>아직 글을 쓸 수 없습니다</h1>
            <p>운영진 승인이 끝나면 글쓰기가 열립니다.</p>
          </S.Intro>
          <S.Actions>
            <S.Approve type="button" onClick={() => router.push("/members")}>
              돌아가기
            </S.Approve>
          </S.Actions>
        </S.Narrow>
      </S.Page>
    );
  }

  return (
    <>
      <Head>
        <title>{editId ? "글 고치기" : "글쓰기"} | NEXT</title>
        <meta name="robots" content="noindex" />
      </Head>

      <S.Page>
        <C.Reading>
          <C.Spread style={{ marginBottom: "1.6rem" }}>
            <C.Back type="button" onClick={() => router.back()}>
              ← 돌아가기
            </C.Back>
            <C.Row>
              <C.SaveState>{savedNote}</C.SaveState>
              <C.Primary
                type="button"
                onClick={submit}
                disabled={busy || !canWrite}
              >
                {busy ? "올리는 중" : editId ? "수정 완료" : "올리기"}
              </C.Primary>
            </C.Row>
          </C.Spread>

          <C.WriteMeta>
            <C.Field>
              <span>게시판</span>
              <C.Select
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
              >
                {boards
                  .filter((b) => b.write_role === "member" || isAdmin)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </C.Select>
            </C.Field>

            {isCareer && (
              <>
                <C.Field>
                  <span>회사 · 기관</span>
                  <C.Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="비워두어도 됩니다"
                    maxLength={40}
                  />
                </C.Field>
                <C.Field>
                  <span>마감</span>
                  <C.Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </C.Field>
              </>
            )}
          </C.WriteMeta>

          <C.TitleInput
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            rows={1}
            maxLength={120}
          />

          <div style={{ marginTop: "1.6rem" }}>
            {ready && (
              <PostEditor
                value={doc}
                onChange={setDoc}
                userId={session.user.id}
              />
            )}
          </div>

          {error && (
            <S.Notice $bad style={{ marginTop: "1.2rem" }}>
              {error}
            </S.Notice>
          )}
        </C.Reading>
      </S.Page>
    </>
  );
}
