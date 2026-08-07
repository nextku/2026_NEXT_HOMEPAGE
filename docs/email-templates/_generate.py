# NEXT 메일 템플릿 생성기.
#
# 여섯 장을 손으로 쓰면 색과 여백이 조금씩 어긋난다. 뼈대를 하나 두고
# 가운데 내용만 갈아 끼운다.

import os

OUT = "docs/email-templates"

FONT = ("-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',"
        "'Malgun Gothic','Segoe UI',Roboto,sans-serif")

INK   = "#17150F"   # 제목
BODY  = "#57524A"   # 본문
MUTE  = "#8D877F"   # 잔글씨
LINE  = "#E7E2D8"   # 구분선
EDGE  = "#EFEAE0"   # 카드 테두리
CREAM = "#FBF8F3"   # 바깥 바탕
CARD  = "#FFFFFF"
FILL  = "#FDFCFA"   # 코드 상자 안
ORANGE = "#F7941E"

LOGO = "https://www.next-ku.com/assets/blackLogo.png"
SITE = "https://www.next-ku.com"


def code_block(_label=None):
    """코드 상자.

    라벨을 붙이지 않는다. 바로 위 문장이 이미 '여섯 자리 숫자' 라고 말했고,
    작고 자간 넓은 머리글을 얹으면 그 흔한 템플릿 느낌이 난다.
    색도 쓰지 않는다 — 숫자가 가장 크고 굵으면 그것으로 충분하다.
    """
    return f"""
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="border:1px solid {LINE};border-radius:10px;background:{FILL};">
                <tr>
                  <td align="center" style="padding:26px 16px;">
                    <div style="font-family:{FONT};font-size:34px;font-weight:800;letter-spacing:0.22em;color:{INK};padding-left:0.22em;">{{{{ .Token }}}}</div>
                  </td>
                </tr>
              </table>"""


def button(text, path="/reset-password", kind="recovery"):
    """링크 버튼.

    ConfirmationURL 을 쓰지 않는다. 그 주소는 PKCE 흐름이라 링크를 요청한 그
    브라우저에서만 열린다 — 컴퓨터에서 요청하고 휴대폰 메일 앱에서 여는
    흔한 경우에 반드시 실패한다.

    token_hash 를 직접 붙이면 서버가 검증하므로 어느 기기에서 열든 열린다.
    """
    url = f"{{{{ .SiteURL }}}}{path}?token_hash={{{{ .TokenHash }}}}&type={kind}"
    return f"""
              <div style="height:18px;font-size:0;line-height:0;">&nbsp;</div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-radius:8px;background:{ORANGE};">
                    <a href="{url}"
                       style="display:inline-block;padding:15px 26px;font-family:{FONT};font-size:15px;font-weight:700;letter-spacing:-0.02em;color:{INK};text-decoration:none;border-radius:8px;">{text}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-family:{FONT};font-size:12px;line-height:1.7;letter-spacing:-0.02em;color:{MUTE};word-break:break-all;">
                버튼이 눌리지 않으면 아래 주소를 브라우저에 붙여넣어 주세요.<br>
                <span style="color:{BODY};">{url}</span>
              </p>"""


def page(title, lead, middle, note):
    return f"""<!-- NEXT · {title} -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="margin:0;padding:40px 16px;background:{CREAM};">
  <tr>
    <td align="center">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="max-width:480px;background:{CARD};border:1px solid {EDGE};border-radius:14px;">
        <tr>
          <td style="padding:34px 34px 0;">
            <img src="{LOGO}" alt="NEXT" width="96"
                 style="display:block;width:96px;height:auto;border:0;outline:none;">
          </td>
        </tr>

        <tr>
          <td style="padding:26px 34px 0;">
            <h1 style="margin:0;font-family:{FONT};font-size:21px;font-weight:750;letter-spacing:-0.03em;line-height:1.35;color:{INK};">{title}</h1>
            <p style="margin:12px 0 0;font-family:{FONT};font-size:15px;line-height:1.75;letter-spacing:-0.025em;color:{BODY};word-break:keep-all;">{lead}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 34px 0;">{middle}
          </td>
        </tr>

        <tr>
          <td style="padding:24px 34px 32px;">
            <div style="height:1px;background:{LINE};font-size:0;line-height:0;">&nbsp;</div>
            <p style="margin:18px 0 0;font-family:{FONT};font-size:13px;line-height:1.75;letter-spacing:-0.02em;color:{MUTE};word-break:keep-all;">{note}</p>
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
        <tr>
          <td style="padding:20px 6px 0;">
            <p style="margin:0;font-family:{FONT};font-size:12px;line-height:1.8;letter-spacing:-0.02em;color:{MUTE};">
              고려대학교 소프트웨어 창업학회 NEXT<br>
              <a href="{SITE}" style="color:{MUTE};text-decoration:none;border-bottom:1px solid {LINE};">next-ku.com</a>
            </p>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
"""


IGNORE = "본인이 요청한 것이 아니라면 이 메일을 무시하셔도 됩니다. 아무 일도 일어나지 않습니다."

TEMPLATES = {
    "01-magic-link.html": page(
        "로그인 코드",
        "아래 여섯 자리 숫자를 로그인 화면에 입력해 주세요.",
        code_block("인증 코드"),
        "코드는 잠시 뒤 만료됩니다. " + IGNORE,
    ),
    "02-confirm-signup.html": page(
        "가입 확인",
        "이 주소로 NEXT 학회원 가입이 요청되었습니다. 아래 코드를 입력하면 확인이 끝납니다.",
        code_block("확인 코드"),
        "확인 후에는 기수와 이름을 적어 승인을 신청하게 됩니다. 학회원 명단에 있는 주소라면 그 단계 없이 바로 이용할 수 있습니다. "
        + IGNORE,
    ),
    "03-invite.html": page(
        "NEXT 학회원 초대",
        "운영진이 이 주소를 학회원으로 초대했습니다. 아래 버튼을 누르면 계정이 만들어집니다.",
        button("초대 수락하기", "/login", "invite"),
        "초대는 잠시 뒤 만료됩니다. 짐작 가는 곳이 없다면 이 메일을 무시하셔도 됩니다.",
    ),
    "04-change-email.html": page(
        "이메일 주소 변경",
        "계정에 연결된 주소를 <b style=\"color:%s;font-weight:700;\">{{ .NewEmail }}</b> 로 바꾸려 합니다. 아래 코드를 입력해 주세요."
        % INK,
        code_block("확인 코드"),
        "이 변경을 요청하지 않았다면 코드를 입력하지 마시고 학회 메일로 알려주세요. 주소는 그대로 유지됩니다.",
    ),
    # 코드를 먼저 두고 링크를 아래에 둔다. 둘 다 어느 기기에서든 통한다.
    "05-reset-password.html": page(
        "비밀번호 재설정",
        "아래 여섯 자리 숫자를 재설정 화면에 입력해 주세요.",
        code_block() + button("링크로 바로 바꾸기"),
        "코드는 잠시 뒤 만료됩니다. " + IGNORE,
    ),
    "06-reauthentication.html": page(
        "본인 확인",
        "중요한 설정을 바꾸기 전에 한 번 더 확인합니다. 아래 코드를 입력해 주세요.",
        code_block("확인 코드"),
        "코드는 잠시 뒤 만료됩니다. " + IGNORE,
    ),
}

os.makedirs(OUT, exist_ok=True)
for name, html in TEMPLATES.items():
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", name, len(html), "bytes")
