# 구글 폼 제출 시 메일 보내기

폼이 제출되면 두 통이 나간다.

- 지원자에게 — 접수 확인과 선발 일정
- 운영진에게 — 방금 들어온 응답 요약

폼은 구글에 그대로 둔다. 문항과 응답 시트를 다시 만들 이유가 없다. 제출
순간에만 우리 서버를 부른다.

```
구글 폼 제출
  → Apps Script 트리거
  → https://www.next-ku.com/api/form-submitted
  → Resend
  → 지원자 · 운영진
```

메일 문구와 일정은 우리 레포에 있다(`pages/api/form-submitted.ts`).
스크립트에 넣어두면 문구 하나 고치자고 구글 스크립트 편집기를 열어야 하고,
그러면 아무도 안 고친다. 일정도 `constants/recruit.ts` 를 그대로 읽으므로
지원 페이지의 타임라인과 어긋나지 않는다.

## 1. Vercel 환경변수

| 이름 | 값 |
| --- | --- |
| `RESEND_API_KEY` | Resend API 키 (이미 넣어둠) |
| `FORM_WEBHOOK_SECRET` | 아무 긴 문자열. 아래 스크립트에도 같은 값을 넣는다 |

비밀을 두는 이유는 이 주소가 공개돼 있기 때문이다. 없으면 누구나 남의 주소로
NEXT 이름의 메일을 보낼 수 있다.

값은 이렇게 하나 만들어 쓰면 된다.

```
openssl rand -hex 24
```

넣은 뒤 **재배포**해야 반영된다. 환경변수는 빌드 시점에 들어간다.

## 2. Apps Script

구글 폼 → 오른쪽 위 점 세 개 → **Apps Script** → 아래를 붙여넣는다.

```js
// NEXT 지원 폼 → 접수 메일
// 문구와 일정은 사이트 레포에 있다. 여기서는 응답을 넘기기만 한다.

const ENDPOINT = 'https://www.next-ku.com/api/form-submitted';
const SECRET = '여기에 FORM_WEBHOOK_SECRET 과 같은 값';

function onFormSubmit(e) {
  const answers = {};
  let name = '';
  let email = '';

  e.response.getItemResponses().forEach(function (item) {
    const title = item.getItem().getTitle();
    const value = String(item.getResponse());
    answers[title] = value;

    // 문항 제목은 기수마다 바뀐다. 제목에 든 낱말로 알아본다.
    if (!name && /이름|성명/.test(title)) name = value;
    if (!email && /메일|이메일|email/i.test(title)) email = value;
  });

  // 폼에서 응답자 이메일을 수집하도록 켜두었다면 그 값이 더 정확하다.
  if (!email && e.response.getRespondentEmail) {
    email = e.response.getRespondentEmail() || '';
  }

  UrlFetchApp.fetch(ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-next-secret': SECRET },
    payload: JSON.stringify({ name: name, email: email, answers: answers }),
    muteHttpExceptions: true,
  });
}
```

저장한 뒤 **트리거**를 건다.

1. 왼쪽 시계 아이콘(트리거) → **트리거 추가**
2. 실행할 함수 `onFormSubmit`
3. 이벤트 소스 **양식에서**
4. 이벤트 유형 **양식 제출 시**
5. 저장 → 구글 계정 권한 허용

## 3. 확인

폼을 직접 한 번 제출해 본다. 두 통이 오면 끝이다.

안 오면 Apps Script 왼쪽의 **실행** 목록에서 오류를 본다. 자주 나오는 것:

- `401` — `SECRET` 과 Vercel 의 `FORM_WEBHOOK_SECRET` 이 다르거나, 넣고 재배포를 안 했다
- 지원자 메일만 안 온다 — 폼에 이메일 문항이 없거나 제목에 '메일' 이 없다.
  폼 설정에서 **응답자 이메일 주소 수집**을 켜면 문항 없이도 잡힌다
- 둘 다 안 온다 — Resend 대시보드 → Logs 에서 발송 기록을 확인한다

## 왜 이 방식인가

폼을 우리 사이트로 옮기면 메일은 더 쉬워지지만, 파일 업로드·응답 시트·조건부
문항을 전부 다시 만들어야 한다. 지금 필요한 것은 "제출되면 그럴듯한 메일이
간다" 하나이므로, 폼은 두고 그 한 지점만 붙였다.
