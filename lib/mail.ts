/**
 * 메일 보내기.
 *
 * Supabase 가 보내는 인증 메일과 같은 껍데기를 쓴다. 지원자 입장에서는 둘 다
 * "NEXT 가 보낸 메일" 이라, 생김새가 다르면 하나는 가짜처럼 보인다.
 *
 * 서버에서만 부른다. RESEND_API_KEY 는 브라우저에 나가면 안 된다.
 * SDK 를 쓰지 않는 이유: 하는 일이 POST 한 번이라 의존성을 늘릴 이유가 없다.
 */

const FONT =
  "-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic','Segoe UI',Roboto,sans-serif";

const INK = "#17150F";
const BODY = "#57524A";
const MUTE = "#8D877F";
const LINE = "#E7E2D8";
const EDGE = "#EFEAE0";
const CREAM = "#FBF8F3";
const FILL = "#FDFCFA";

const LOGO = "https://www.next-ku.com/assets/blackLogo.png";
const SITE = "https://www.next-ku.com";

/** 사람이 넣은 값이 그대로 메일 HTML 이 되지 않게 한다. */
export function esc(v: unknown) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function shell({
  title,
  lead,
  middle = "",
  note,
}: {
  title: string;
  lead: string;
  middle?: string;
  note: string;
}) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="margin:0;padding:40px 16px;background:${CREAM};">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="max-width:480px;background:#FFFFFF;border:1px solid ${EDGE};border-radius:14px;">
      <tr><td style="padding:34px 34px 0;">
        <img src="${LOGO}" alt="NEXT" width="96" style="display:block;width:96px;height:auto;border:0;outline:none;">
      </td></tr>
      <tr><td style="padding:26px 34px 0;">
        <h1 style="margin:0;font-family:${FONT};font-size:21px;font-weight:750;letter-spacing:-0.03em;line-height:1.35;color:${INK};">${title}</h1>
        <p style="margin:12px 0 0;font-family:${FONT};font-size:15px;line-height:1.75;letter-spacing:-0.025em;color:${BODY};word-break:keep-all;">${lead}</p>
      </td></tr>
      ${middle ? `<tr><td style="padding:24px 34px 0;">${middle}</td></tr>` : ""}
      <tr><td style="padding:24px 34px 32px;">
        <div style="height:1px;background:${LINE};font-size:0;line-height:0;">&nbsp;</div>
        <p style="margin:18px 0 0;font-family:${FONT};font-size:13px;line-height:1.75;letter-spacing:-0.02em;color:${MUTE};word-break:keep-all;">${note}</p>
      </td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
      <tr><td style="padding:20px 6px 0;">
        <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.8;letter-spacing:-0.02em;color:${MUTE};">
          고려대학교 소프트웨어 창업학회 NEXT<br>
          <a href="${SITE}" style="color:${MUTE};text-decoration:none;border-bottom:1px solid ${LINE};">next-ku.com</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>`;
}

/** 이름-값 목록. 일정이나 제출 내용처럼 짝으로 읽는 것에 쓴다. */
export function rows(pairs: [string, string][]) {
  if (pairs.length === 0) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
     style="border:1px solid ${LINE};border-radius:10px;background:${FILL};">
  ${pairs
    .map(
      ([k, v], i) => `<tr>
    <td style="padding:${i === 0 ? "16px" : "10px"} 18px ${i === pairs.length - 1 ? "16px" : "10px"} 18px;font-family:${FONT};font-size:13px;letter-spacing:-0.02em;color:${MUTE};white-space:nowrap;vertical-align:top;">${esc(k)}</td>
    <td style="padding:${i === 0 ? "16px" : "10px"} 18px ${i === pairs.length - 1 ? "16px" : "10px"} 0;font-family:${FONT};font-size:14px;font-weight:650;letter-spacing:-0.02em;color:${INK};text-align:right;word-break:break-all;">${esc(v)}</td>
  </tr>`,
    )
    .join("")}
</table>`;
}

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendMail({ to, subject, html, replyTo }: SendArgs) {
  const key = process.env.RESEND_API_KEY;
  if (!key)
    return { ok: false, error: "RESEND_API_KEY 가 설정되지 않았습니다." };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "고려대학교 소프트웨어 창업학회 NEXT <noreply@next-ku.com>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    // 본문에 실패 이유가 들어 있다. 삼키면 원인을 찾을 수 없다.
    const detail = await res.text().catch(() => "");
    return { ok: false, error: `${res.status} ${detail}`.trim() };
  }
  return { ok: true, error: null };
}
