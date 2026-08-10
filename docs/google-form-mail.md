# 구글 폼과 메일

두 가지가 붙어 있다.

- **제출 즉시** — 지원자에게 접수 확인과 선발 일정
- **하루 한 번** — 운영진에게 그날 들어온 지원자 요약

```
구글 폼 제출 ─┬─ Apps Script(제출 시) → next-ku.com/api/form-submitted → Resend → 지원자
              └─ Apps Script(매일 밤)  → Gmail                          → 운영진
```

요약 메일을 받는 사람은 스크립트에 적어두지 않는다. **사이트에 운영진으로
등록된 사람**을 보낼 때마다 물어본다. 적어두면 운영진이 바뀔 때마다 스크립트
편집기를 열어야 하고, 그러면 아무도 안 고쳐서 이미 나간 사람에게 계속 간다.

두 갈래를 다르게 보내는 이유는 한도다. Resend 무료 플랜은 **하루 100통**이고, 마감날에는
지원자 확인 메일만으로 80통 가까이 쓴다. 운영진 알림을 같은 통으로 보내면 그 통이
먼저 바닥나서 **지원자가 확인 메일을 못 받는다.** 운영진 쪽은 Gmail 이 직접 보내므로
Resend 한도와 아무 상관이 없다.

지원자 메일의 문구와 일정은 우리 레포에 있다(`pages/api/form-submitted.ts`).
스크립트에 넣어두면 문구 하나 고치자고 구글 스크립트 편집기를 열어야 하고,
그러면 아무도 안 고친다. 일정도 `constants/recruit.ts` 를 그대로 읽으므로
지원 페이지의 타임라인과 어긋나지 않는다.

## 1. Vercel 환경변수

| 이름 | 값 |
| --- | --- |
| `RESEND_API_KEY` | Resend API 키 |
| `FORM_WEBHOOK_SECRET` | 아무 긴 문자열. 아래 스크립트에도 같은 값을 넣는다 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` |

`FORM_WEBHOOK_SECRET` 을 두는 이유는 이 주소가 공개돼 있기 때문이다. 없으면
누구나 남의 주소로 NEXT 이름의 메일을 보낼 수 있다. 값은 이렇게 하나 만든다.

```
openssl rand -hex 24
```

`service_role` 키는 요약 메일의 받는 사람을 정하는 데 쓴다. 운영진 명단이 우리
데이터베이스에 있는데, `profiles` 는 본인과 운영진에게만 열려 있고 이 요청에는
로그인한 사람이 없다. 공개 키로는 한 줄도 못 읽는다.

> 이 키는 모든 정책을 지나간다. **`NEXT_PUBLIC_` 을 붙이지 않는다.** 붙이면
> 브라우저 번들에 실려 나가고, 그 순간 누구나 전체 데이터베이스를 읽고 쓸 수
> 있다. 접두사 없는 값은 서버에만 남는다.

넣은 뒤 **재배포**해야 반영된다. 환경변수는 빌드 시점에 들어간다.

## 2. Apps Script

구글 폼 → 오른쪽 위 점 세 개 → **Apps Script**.

스크립트는 하나로 둔다. 따로 만들면 폼에 붙어 있지 않아 `FormApp.getActiveForm()`
을 못 쓰고, 폼 ID 를 따로 넣고 권한도 다시 잡아야 한다.

### ① 제출 즉시 — 지원자 확인 메일

**이미 `onFormSubmit` 이 들어 있으면 이 부분은 건너뛴다.** 특히 `SECRET` 은
이미 넣어둔 값이 있으므로 덮어쓰지 않는다. 덮으면 API 가 401 로 막아
지원자 확인 메일이 그 순간부터 안 나간다.

```js
// NEXT 지원 폼
//   onFormSubmit  — 제출 즉시 지원자에게 접수 확인 (문구는 사이트 레포에 있다)
//   dailyDigest   — 매일 밤 운영진에게 그날 지원자 요약
const ENDPOINT = 'https://www.next-ku.com/api/form-submitted';
const SECRET = '여기에 FORM_WEBHOOK_SECRET 과 같은 값';
/* ─── 제출 즉시: 지원자에게 ─────────────────────────────────────────── */
function onFormSubmit(e) {
  const answers = {};
  let name = '';
  let email = '';
  e.response.getItemResponses().forEach(function (item) {
    const title = item.getItem().getTitle();
    const value = String(item.getResponse());
    answers[title] = value;
    // 문항 제목은 기수마다 바뀐다. 제목에 든 낱말로 알아본다.
    if (!name && /이름|성함|성명/.test(title)) name = value;
    if (!email && /메일|이메일|email/i.test(title)) email = value;
  });
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

### ② 하루 한 번 — 운영진 요약

위 코드는 그대로 두고, **파일 맨 아래에 이어 붙인다.**

```js
/* ─── 매일 밤: 운영진에게 ───────────────────────────────────────────── */

const STAFF_ENDPOINT = 'https://www.next-ku.com/api/staff-emails';

// 받는 사람을 여기 적어두지 않는다. 운영진이 바뀔 때마다 이 편집기를 열어야
// 하는데 그러면 아무도 안 고쳐서, 이미 나간 사람에게 계속 간다.
// 사이트에 운영진으로 등록된 사람을 그때그때 물어본다.
function staffEmails() {
  const res = UrlFetchApp.fetch(STAFF_ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-next-secret': SECRET },
    payload: '{}',
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('운영진 목록을 못 받았습니다: ' + res.getContentText());
  }
  return JSON.parse(res.getContentText()).emails || [];
}

// 문항 제목에서 무엇을 찾을지. 기수마다 제목이 조금씩 달라도 걸리게 둔다.
const FIELDS = [
  { key: 'name', label: '이름', match: /이름|성함|성명/, skip: /학과|학번|전공/ },
  { key: 'sid', label: '학번', match: /학번/ },
  { key: 'dept', label: '학과', match: /학과|전공/ },
];

function dailyDigest() {
  const form = FormApp.getActiveForm();

  // 오늘 0시 이후에 들어온 것만. getResponses(after) 는 그 시각 뒤의 응답을 준다.
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const responses = form.getResponses(since);

  // 아무도 안 냈으면 보내지 않는다. 빈 메일이 매일 오면 열어보지 않게 된다.
  if (responses.length === 0) return;

  // 받을 사람을 먼저 확인한다. 없는데 메일부터 만들면 헛일이다.
  const to = staffEmails();
  if (to.length === 0) throw new Error('운영진으로 등록된 사람이 없습니다.');

  const rows = responses.map(function (r) {
    const out = { name: '', sid: '', dept: '', files: [] };

    r.getItemResponses().forEach(function (item) {
      const it = item.getItem();
      const title = it.getTitle();

      if (it.getType() === FormApp.ItemType.FILE_UPLOAD) {
        // 파일 업로드는 답이 파일 ID 목록이다.
        [].concat(item.getResponse()).forEach(function (id) {
          try {
            const f = DriveApp.getFileById(id);
            out.files.push({ name: f.getName(), url: f.getUrl() });
          } catch (err) {
            // 권한이 없거나 지워진 파일. 나머지는 그대로 보낸다.
          }
        });
        return;
      }

      FIELDS.forEach(function (f) {
        if (out[f.key]) return;
        if (f.skip && f.skip.test(title)) return;
        if (f.match.test(title)) out[f.key] = String(item.getResponse());
      });
    });

    return out;
  });

  const when = Utilities.formatDate(now, 'Asia/Seoul', 'M월 d일');
  const html =
    '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;' +
    'font-size:15px;color:#17150F;">' +
    '<p style="margin:0 0 18px;font-size:17px;font-weight:700;">' +
    when + ' 지원 ' + rows.length + '명</p>' +
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">' +
    rows.map(function (r) {
      const files = r.files.length
        ? r.files.map(function (f) {
            return '<a href="' + f.url + '" style="color:#17150F;">지원서 →</a>';
          }).join(' ')
        : '<span style="color:#8D877F;">파일 없음</span>';
      return (
        '<tr>' +
        '<td style="padding:11px 12px 11px 0;border-top:1px solid #E7E2D8;font-weight:650;">' +
          (r.name || '이름 없음') + '</td>' +
        '<td style="padding:11px 12px;border-top:1px solid #E7E2D8;color:#57524A;">' +
          (r.sid || '-') + '</td>' +
        '<td style="padding:11px 12px;border-top:1px solid #E7E2D8;color:#57524A;">' +
          (r.dept || '-') + '</td>' +
        '<td style="padding:11px 0 11px 12px;border-top:1px solid #E7E2D8;text-align:right;">' +
          files + '</td>' +
        '</tr>'
      );
    }).join('') +
    '</table>' +
    '<p style="margin:18px 0 0;font-size:13px;color:#8D877F;">' +
    '응답 전체는 폼의 응답 탭에서 볼 수 있습니다.</p>' +
    '</div>';

  MailApp.sendEmail({
    to: to.join(','),
    subject: '[NEXT] ' + when + ' 지원 ' + rows.length + '명',
    htmlBody: html,
  });
}
```

## 3. 트리거

왼쪽 시계 아이콘(트리거) → 오른쪽 아래 **트리거 추가**.

| 함수 | 이벤트 소스 | 설정 |
| --- | --- | --- |
| `onFormSubmit` | 양식에서 | 양식 제출 시 |
| `dailyDigest` | 시간 기반 | 일 단위 타이머 · 오후 11시~자정 |

`onFormSubmit` 트리거가 이미 있으면 다시 만들지 않는다. 함수 이름이 그대로면
코드를 고쳐도 기존 트리거가 그대로 그 함수를 부른다.

### 누구 계정으로 만드느냐가 곧 보내는 사람이다

트리거는 **만든 사람의 권한으로 돌아간다.** 트리거 목록의 `소유자` 칸이 그것을
말해준다 — 다른 계정이 만든 것은 `다른 사용자` 로 보인다.

`dailyDigest` 는 `MailApp` 으로 보내는데, 그것은 **트리거를 만든 계정에서**
나간다. 그러므로 요약 메일이 학회 계정에서 나가게 하려면 **학회 계정으로
로그인한 채** 이 트리거를 추가해야 한다. 개인 계정으로 만들면 받는 곳은 같아도
보낸 사람이 개인 주소가 된다.

`onFormSubmit` 쪽은 누가 만들었든 상관없다. 그것은 메일을 직접 보내지 않고 우리
서버를 부르기만 하고, 메일은 Resend 가 `noreply@next-ku.com` 으로 보낸다.

저장할 때 구글 계정 권한을 한 번 허용한다.

> 시간대가 한국인지 확인한다. Apps Script 편집기 왼쪽 **프로젝트 설정** → 시간대가
> `(GMT+09:00) 서울` 이어야 "오늘 들어온 것" 이 맞게 잘린다.

## 4. 확인

- **지원자 메일**: 폼을 한 번 직접 제출해 본다
- **요약 메일**: 스크립트 편집기 위쪽에서 함수를 `dailyDigest` 로 고르고 **실행**을
  누르면 그 자리에서 보낸다. 오늘 지원이 없으면 아무것도 안 보내는 것이 정상이다

안 오면 왼쪽의 **실행** 목록에서 오류를 본다. 자주 나오는 것:

- `401` — `SECRET` 과 Vercel 의 `FORM_WEBHOOK_SECRET` 이 다르거나, 넣고 재배포를 안 했다
- 지원자 메일만 안 온다 — 폼에 이메일 문항이 없거나 제목에 '메일' 이 없다.
  폼 설정에서 **응답자 이메일 주소 수집**을 켜면 문항 없이도 잡힌다
- 지원자 메일이 어느 순간부터 안 온다 — Resend 하루 한도(100통)를 넘겼을 수 있다.
  Supabase 의 `mail_failures` 표에 못 보낸 사람이 적혀 있다
- 요약 메일의 이름·학번 칸이 비어 있다 — 문항 제목에 그 낱말이 없다.
  `FIELDS` 의 정규식을 문항 제목에 맞게 고친다
- 요약 메일이 `운영진 목록을 못 받았습니다` 로 멈춘다 — `SUPABASE_SERVICE_ROLE_KEY`
  가 Vercel 에 없거나, 넣고 재배포를 안 했다
- 요약 메일이 `운영진으로 등록된 사람이 없습니다` 로 멈춘다 — 사이트에서 승인된
  운영진이 아직 없다. `/admin` 의 학회원 탭에서 운영진 권한을 준다

## 왜 이 방식인가

폼을 우리 사이트로 옮기면 메일은 더 쉬워지지만, 파일 업로드·응답 시트·조건부
문항을 전부 다시 만들어야 한다. 지금 필요한 것은 "제출되면 그럴듯한 메일이
간다" 하나이므로, 폼은 두고 그 한 지점만 붙였다.

요약 메일을 우리 서버가 아니라 Apps Script 에서 보내는 이유도 같다. 우리 서버에서
보내려면 지원자 정보를 우리 데이터베이스에도 쌓아야 하는데, 지금은 통과만 시키고
저장하지 않는다. 보관하는 개인정보를 늘리지 않는 편이 낫다.
