# 이메일 로그인 설정

메일로 여섯 자리 코드를 보내고 그 코드로 로그인한다. 구글 OAuth 는 쓰지 않는다.

메일을 보내는 주체는 **Supabase Auth** 다. 우리 앱이 아니다. 그래서 Resend
API 키는 Vercel 이 아니라 Supabase 에 넣는다. (Vercel 에 넣은 `RESEND_API_KEY`
는 지금 아무것도 쓰지 않으니 지워도 된다.)

## 1. Resend — 도메인

Resend → Domains → Add domain

| 항목 | 값 |
| --- | --- |
| Name | `next-ku.com` |
| Region | Tokyo (ap-northeast-1) |
| Custom Return-Path | `send` (기본값) |
| Tracking Subdomain | 비움 |
| Enable click tracking | **끔** |
| Enable open tracking | 끔 |

클릭 추적을 켜면 메일 속 링크를 Resend 도메인으로 바꿔 쓴다. 인증 메일에서
그러면 스팸 판정 확률이 올라간다.

도메인을 만들면 DNS 레코드를 준다. **가비아**의 next-ku.com 레코드에 그대로
넣는다. 보통 세 줄이다.

- `send` MX — 반송 처리
- `send` TXT — SPF
- `resend._domainkey` TXT — DKIM

전부 초록불이 될 때까지 기다린다. 보통 몇 분, 길면 한 시간.

## 2. Resend — API 키

Resend → API Keys → Create. 권한은 **Sending access** 면 충분하다.
이 키를 다음 단계에서 SMTP 비밀번호로 쓴다. 화면을 벗어나면 다시 못 보니
그 자리에서 옮겨 적는다.

## 3. Supabase — SMTP

Supabase → Project Settings → Authentication → SMTP Settings → Enable custom SMTP

| 항목 | 값 |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | 위에서 만든 Resend API 키 |
| Sender email | `noreply@next-ku.com` |
| Sender name | `고려대학교 소프트웨어 창업학회 NEXT` |

이걸 안 하면 Supabase 기본 발송기를 쓰는데, 시간당 몇 통으로 막혀 있고
스팸함으로 잘 간다. 실사용은 불가능하다.

## 4. Supabase — 메일 본문에 코드 넣기

Supabase → Authentication → Emails → **Magic Link** 템플릿

기본 템플릿에는 링크만 있다. **`{{ .Token }}` 이 없으면 코드가 가지 않는다.**
아래로 바꾼다.

```html
<h2>NEXT 학회원 로그인</h2>
<p>아래 여섯 자리 코드를 로그인 화면에 입력해 주세요.</p>
<p style="font-size:28px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
<p>코드는 잠시 뒤 만료됩니다. 본인이 요청한 것이 아니면 이 메일을 무시하세요.</p>
```

Subject 는 `NEXT 로그인 코드 {{ .Token }}` 처럼 두면 메일함 목록에서 바로
보여 편하다.

## 5. Supabase — 나머지 설정

- Authentication → Providers → **Email** 켜기. Google 은 꺼도 된다.
- Authentication → URL Configuration
  - Site URL: `https://www.next-ku.com`
  - Redirect URLs: `https://www.next-ku.com/**`, `http://localhost:3000/**`
- Authentication → Rate limits → 메일 발송 한도가 기본 시간당 30 통이다.
  기수 전체가 한꺼번에 가입하는 날에는 올려둔다.

## 확인

1. `/login` 에서 본인 메일 입력 → 코드 받기
2. 메일 도착 (스팸함도 확인)
3. 코드 입력 → `/members` 로 이동
4. 명단에 있는 주소면 바로 라운지, 없으면 기수·학과 입력 후 승인 대기

## 왜 코드인가

매직 링크는 메일 앱이 자체 브라우저로 열어서, 로그인은 됐는데 원래 보던
창에는 세션이 안 붙는 일이 잦다. 코드는 어디서 열든 옮겨 적으면 된다.

비밀번호를 받지 않는 이유는 받는 순간 학회가 그것을 보관하고 재설정까지
책임져야 하기 때문이다. 코드를 옮겨 적었다는 사실이 그 주소의 주인이라는
증명이므로, 별도의 인증 메일 확인 단계도 필요 없다.
