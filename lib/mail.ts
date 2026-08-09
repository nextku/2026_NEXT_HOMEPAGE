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
  signature,
}: {
  title: string;
  lead: string;
  middle?: string;
  note: string;
  /** 사람이 보낸 메일로 읽히게 하는 서명. 자동 발송 알림에는 붙이지 않는다. */
  signature?: { role: string; name: string };
}) {
  /*
    카드가 아니라 편지지로 둔다.

    색 바탕에 흰 카드를 얹는 형태는 서비스 알림의 틀이다. 본문이 "대표
    아무개입니다" 로 시작하는 편지인데 그 틀에 넣으면 사람이 쓴 글로 읽히지
    않는다. 흰 바탕에 로고와 글만 두면 기관이 보낸 서한에 가까워진다.

    일정 표는 남긴다. 그것은 장식이 아니라 정보이고, 날짜 다섯 줄을 문장으로
    풀어 쓰면 오히려 읽기 어렵다. 다만 상자를 걷고 가는 선만 남긴다.
  */
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="margin:0;padding:48px 20px;background:#FFFFFF;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

      <tr><td style="padding-bottom:36px;">
        <img src="${LOGO}" alt="NEXT" width="92" style="display:block;width:92px;height:auto;border:0;outline:none;">
      </td></tr>

      <tr><td>
        <h1 style="margin:0 0 22px;font-family:${FONT};font-size:19px;font-weight:750;letter-spacing:-0.03em;line-height:1.45;color:${INK};">${title}</h1>
        <div style="font-family:${FONT};font-size:15px;line-height:1.9;letter-spacing:-0.025em;color:${BODY};word-break:keep-all;">${lead}</div>
      </td></tr>

      ${middle ? `<tr><td style="padding-top:30px;">${middle}</td></tr>` : ""}

      ${
        signature
          ? `<tr><td style="padding-top:34px;">
        <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.9;letter-spacing:-0.025em;color:${BODY};">
          <span style="color:${INK};font-weight:700;">${esc(signature.role)} ${esc(signature.name)}</span> 드림
        </p>
      </td></tr>`
          : ""
      }

      <tr><td style="padding-top:36px;">
        <div style="height:1px;background:${LINE};font-size:0;line-height:0;">&nbsp;</div>
        <p style="margin:16px 0 0;font-family:${FONT};font-size:12.5px;line-height:1.8;letter-spacing:-0.02em;color:${MUTE};word-break:keep-all;">${note}</p>
        <p style="margin:14px 0 0;font-family:${FONT};font-size:12.5px;line-height:1.8;letter-spacing:-0.02em;color:${MUTE};">
          고려대학교 소프트웨어 창업학회 NEXT ·
          <a href="${SITE}" style="color:${MUTE};text-decoration:none;border-bottom:1px solid ${LINE};">next-ku.com</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>`;
}

/**
 * 이름-값 목록.
 *
 * 상자에 담지 않는다. 본문이 편지인데 가운데만 카드가 되면 그 부분만 붙여넣은
 * 것처럼 보인다. 가로선만 남겨 표라는 것을 알리고 나머지는 여백에 맡긴다.
 */
export function rows(pairs: [string, string][]) {
  if (pairs.length === 0) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  ${pairs
    .map(
      ([k, v], i) => `<tr>
    <td style="padding:13px 0;border-top:1px solid ${LINE};${i === pairs.length - 1 ? `border-bottom:1px solid ${LINE};` : ""}font-family:${FONT};font-size:14px;letter-spacing:-0.02em;color:${MUTE};white-space:nowrap;vertical-align:top;">${esc(k)}</td>
    <td style="padding:13px 0;border-top:1px solid ${LINE};${i === pairs.length - 1 ? `border-bottom:1px solid ${LINE};` : ""}font-family:${FONT};font-size:14px;font-weight:650;letter-spacing:-0.02em;color:${INK};text-align:right;word-break:break-all;">${esc(v)}</td>
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
