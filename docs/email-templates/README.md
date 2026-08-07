# 메일 템플릿

Supabase → Authentication → Emails 의 각 템플릿에 붙여넣는다. HTML 본문을
통째로 바꾸면 된다.

| 파일 | Supabase 템플릿 | 제목(Subject) |
| --- | --- | --- |
| `01-magic-link.html` | Magic Link | `NEXT 로그인 코드 {{ .Token }}` |
| `02-confirm-signup.html` | Confirm signup | `NEXT 가입 확인 코드 {{ .Token }}` |
| `03-invite.html` | Invite user | `NEXT 학회원으로 초대되었습니다` |
| `04-change-email.html` | Change Email Address | `NEXT 이메일 변경 확인 코드 {{ .Token }}` |
| `05-reset-password.html` | Reset Password | `NEXT 비밀번호 재설정` |
| `06-reauthentication.html` | Reauthentication | `NEXT 본인 확인 코드 {{ .Token }}` |

제목에 코드를 넣어두면 메일함 목록에서 열지 않고도 읽을 수 있다.

**Magic Link 는 반드시 바꿔야 한다.** 기본 템플릿에는 링크만 있고 `{{ .Token }}`
이 없어서, 지금 로그인 화면이 요구하는 여섯 자리 코드가 오지 않는다.

## 디자인

사이트와 같은 값을 쓴다. 새로 만들지 말고 여기서 가져다 쓴다.

| 쓰임 | 값 |
| --- | --- |
| 바깥 바탕 | `#FBF8F3` |
| 카드 | `#FFFFFF` / 테두리 `#EFEAE0` |
| 제목 | `#17150F` |
| 본문 | `#57524A` |
| 잔글씨·구분선 | `#8D877F` / `#E7E2D8` |
| 버튼 | `#F7941E` 채움 + `#17150F` 글자 |

- 오렌지는 **누를 수 있는 것에만** 쓴다. 코드 상자에는 색을 쓰지 않는다 —
  숫자가 가장 크고 굵으면 그것으로 충분하다.
- 코드 위에 `인증 코드` 같은 작은 머리글을 얹지 않는다. 바로 위 문장이 이미
  설명하고 있고, 자간 넓은 소형 라벨은 흔한 템플릿 티가 난다.
- 로고는 `blackLogo.png` (검정 워드마크 + 오렌지 로켓). 배경이 투명해서
  크림 바탕에 그대로 얹힌다.
- 웹폰트는 걸지 않는다. 메일 클라이언트 상당수가 무시하고, 그때 대체 글꼴로
  떨어지면 오히려 흐트러진다. 기기에 있는 한글 글꼴을 순서대로 지정했다.

## 고칠 때

`docs/email-templates/*.html` 을 직접 고쳐도 되지만, 여섯 장이 서로 어긋나기
쉽다. 색이나 여백처럼 공통인 것을 바꿀 때는 생성 스크립트 쪽을 고치는 편이
안전하다 (`scratchpad/gen_mail.py` 참고, 뼈대 하나에서 여섯 장을 뽑는다).

이미지 주소는 절대 경로여야 한다. 메일에는 사이트의 상대 경로가 통하지 않는다.
