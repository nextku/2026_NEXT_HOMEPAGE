import type { NextApiRequest, NextApiResponse } from "next";

import { RECRUIT, RECRUIT_STAGES } from "constants/recruit";
import { esc, rows, sendMail, shell } from "lib/mail";

/**
 * 구글 폼이 제출되면 부르는 자리.
 *
 * 폼 자체는 구글에 그대로 둔다. 옮기면 이미 만들어둔 문항과 응답 시트를 다시
 * 만들어야 하는데 그럴 이유가 없다. 대신 제출 순간에 스크립트가 여기를 부르고,
 * 여기서 두 통을 보낸다 — 지원자에게 접수 확인, 운영진에게 알림.
 *
 * 메일 문구를 스크립트가 아니라 여기 두는 이유: 문구 하나 고치자고 구글
 * 스크립트 편집기를 열게 되면 아무도 안 고친다. 일정도 constants/recruit 를
 * 그대로 읽으므로 지원 페이지와 어긋나지 않는다.
 *
 * 아무나 부르면 남의 주소로 메일을 보낼 수 있으므로 공유 비밀로 막는다.
 */

type Body = {
  /** 지원자 이름. 없으면 확인 메일의 인사말만 빠진다. */
  name?: string;
  /** 지원자 메일. 없으면 지원자에게는 보내지 않고 운영진 알림만 간다. */
  email?: string;
  /** 나머지 응답 전부. 운영진 알림에 그대로 옮겨 적는다. */
  answers?: Record<string, string>;
};

const STAFF_TO = "nextku.contact@gmail.com";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }

  const secret = process.env.FORM_WEBHOOK_SECRET;
  if (!secret || req.headers["x-next-secret"] !== secret) {
    // 무엇이 틀렸는지 알려주지 않는다. 맞출 실마리가 된다.
    return res.status(401).json({ error: "unauthorized" });
  }

  const { name, email, answers = {} } = (req.body ?? {}) as Body;

  const applicant = (email ?? "").trim();
  const who = (name ?? "").trim();
  const gen = RECRUIT.generation;

  // 지원자 확인 메일
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicant)) {
    const schedule = rows(
      RECRUIT_STAGES.map((s) => [s.label, s.display] as [string, string]),
    );

    /*
       접수 확인 메일의 문구.

       대표가 직접 쓴 편지로 읽히게 둔다. 선발 절차 설명은 넣지 않는다 —
       지원서를 낸 직후에 알고 싶은 것이 아니고, 아래 일정 표가 이미 말한다.
    */
    const html = shell({
      title: `${gen}기 지원이 완료되었습니다`,
      lead: [
        `안녕하세요, ${who ? `${esc(who)}님` : "지원자님"}.`,
        `NEXT ${gen}기 대표 ${esc(RECRUIT.leader)}입니다.`,
        "",
        `먼저 NEXT ${gen}기에 관심을 가지고 지원해주셔서 감사합니다.`,
        "",
        "NEXT는 좋은 아이디어를 이야기하는 데서 그치지 않고, 직접 만들고 세상에 내놓는 사람들을 위한 곳입니다.",
        "",
        "지금 보내주신 한 장의 지원서도 그 시작점이라고 생각합니다.",
        "",
        "지원해주신 모든 분들의 이야기를 꼼꼼히 살펴보고, 좋은 인연으로 이어갈 수 있기를 기대하겠습니다.",
        "",
        "아래 일정에 따라 이후 전형이 진행됩니다.",
      ].join("<br>"),
      middle: schedule,
      signature: { role: `NEXT ${gen}기 대표`, name: RECRUIT.leader },
      note: `모든 안내는 이 주소로 드립니다. 제출 내용을 고치시려면 접수 마감 전에 다시 제출해 주세요. 문의는 nextku.contact@gmail.com 으로 보내주세요.`,
    });

    const sent = await sendMail({
      to: applicant,
      subject: `[NEXT] ${gen}기 지원이 완료되었습니다`,
      html,
      // 지원자가 답장하면 학회 메일로 간다. noreply 로 가면 아무도 못 본다.
      replyTo: STAFF_TO,
    });

    if (!sent.ok) {
      // 지원자 메일이 실패해도 운영진 알림은 보낸다. 접수 사실이 더 중요하다.
      console.error("[form-submitted] 지원자 메일 실패:", sent.error);
    }
  }

  // 운영진 알림
  const pairs: [string, string][] = [];
  if (who) pairs.push(["이름", who]);
  if (applicant) pairs.push(["이메일", applicant]);
  Object.entries(answers).forEach(([k, v]) => {
    const value = String(v ?? "").trim();
    if (value)
      pairs.push([k, value.length > 120 ? `${value.slice(0, 120)}…` : value]);
  });

  const staff = await sendMail({
    to: STAFF_TO,
    subject: `[NEXT] ${gen}기 새 지원서${who ? ` — ${who}` : ""}`,
    html: shell({
      title: "새 지원서가 들어왔습니다",
      lead: "구글 폼에 방금 제출된 내용입니다. 전체 응답은 응답 시트에서 볼 수 있습니다.",
      middle: rows(pairs),
      note: "이 메일은 폼이 제출될 때마다 자동으로 갑니다.",
    }),
    replyTo: applicant || undefined,
  });

  if (!staff.ok) {
    console.error("[form-submitted] 운영진 알림 실패:", staff.error);
    return res.status(502).json({ error: "mail failed" });
  }

  return res.status(200).json({ ok: true });
}
