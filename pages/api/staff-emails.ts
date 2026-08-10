import type { NextApiRequest, NextApiResponse } from "next";

/**
 * 운영진 메일 주소 목록.
 *
 * 하루 한 번 지원자 요약을 보내는 구글 폼 스크립트가 부른다. 받는 사람을
 * 스크립트에 적어두면 운영진이 바뀔 때마다 스크립트 편집기를 열어야 하고,
 * 그러면 아무도 안 고쳐서 이미 나간 사람에게 계속 간다. 명단은 우리 쪽에
 * 있으므로 여기서 준다.
 *
 * 주소가 공개돼 있으므로 공유 비밀로 막는다. 폼 스크립트와 같은 값을 쓴다.
 *
 * 서비스 키로 읽는다. profiles 의 정책은 본인과 운영진에게만 열려 있는데, 이
 * 요청에는 로그인한 사람이 없다. 공개 키로는 한 줄도 못 읽는다.
 *
 * 서비스 키는 절대 브라우저로 나가면 안 되므로 NEXT_PUBLIC_ 접두사를 붙이지
 * 않는다. 그 접두사가 없는 값은 서버 번들에만 들어간다.
 */

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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return res.status(500).json({ error: "server not configured" });
  }

  /*
     승인된 운영진과 관리자. 승인 전인 계정은 아직 운영진이 아니다.
     or 조건은 PostgREST 문법이라 괄호 안에 쉼표로 잇는다.
  */
  const query =
    `${url}/rest/v1/profiles` +
    `?select=email,name` +
    `&status=eq.approved` +
    `&or=(role.eq.admin,is_owner.eq.true)`;

  const r = await fetch(query, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });

  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    console.error("[staff-emails] 조회 실패:", r.status, detail);
    return res.status(502).json({ error: "lookup failed" });
  }

  const rows = (await r.json()) as { email: string | null }[];
  const emails = rows
    .map((x) => (x.email ?? "").trim())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

  return res.status(200).json({ emails });
}
