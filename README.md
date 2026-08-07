고려대학교 소프트웨어벤처 학회 NEXT
https://next-ku.com

![image](https://github.com/Kim-Jiseong/KU_NEXT_FE/assets/35622664/b1b39b48-8537-4773-a100-448dc3cdd9a1)

---

## 처음 받았다면

```bash
npm install
cp .env.example .env.local   # 값은 아래 참고
npm run dev
```

`.env.local` 없이 실행하면 Supabase 클라이언트가 바로 오류를 던진다. 빌드가 조용히
통과한 뒤 런타임에 터지는 것보다 낫기 때문에 일부러 그렇게 두었다.

## 환경변수

`.env.example` 을 복사해서 채운다. 실제 값은 운영진에게 요청한다.

| 키 | 어디서 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 대시보드 > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 같은 화면 |
| `AWS_*` | 지원서 파일 업로드(S3) |
| `MAIL_USER` / `MAIL_PASSWORD` | 문의 메일 발송 |

`NEXT_PUBLIC_` 이 붙은 값은 **브라우저 번들에 그대로 실려 나간다.** 공개되는 것이
전제이므로 비밀이 아니다. 데이터를 지키는 것은 이 키가 아니라 RLS 정책이다.
`.env.local` 은 `.gitignore` 에 걸려 있으니 절대 커밋하지 않는다.

## 구조

```
pages/          라우트만 둔다. 여기 파일을 두면 Next 가 전부 페이지로 취급한다.
components/     섹션 컴포넌트. about / activities / people 로 나뉜다.
constants/      부원 명단, 파트너, 모집 일정 등 데이터
styles/         styled-components. shared.ts 에 공통 레이아웃이 있다.
lib/supabase/   Supabase 클라이언트
supabase/       DB 마이그레이션 SQL
```

`pages/` 아래에는 실제 라우트만 둔다. 컴포넌트를 넣으면 가짜 주소가 생기고
sitemap 에도 올라간다(예전에 `/about/components/greeting` 같은 URL 이 검색엔진에
노출된 적이 있다).

## 디자인 규칙

- 섹션 제목은 검정(밝은 면) 또는 흰색(어두운 면), 왼쪽 정렬. 위계는 크기와 굵기로 만든다.
- 오렌지(`#F7941E`)는 **채움 전용**이다. 흰 바탕에 텍스트로 쓰면 대비 2.28:1 로
  WCAG 미달이고, 오렌지 채움 위 흰 텍스트도 마찬가지다. 텍스트에는 `#95500A` 를 쓴다.
- 오렌지 채움 면적은 페이지당 3% 이하. 예외는 지원 CTA 한 곳이다.
- 이미지 모서리와 그림자는 `styles/surface.ts` 의 `squircle` / `lift` 를 쓴다.
- 본문 자간 `-2.5%`, 한글 본문은 모바일에서도 16px 아래로 내리지 않는다.

## 회원 시스템

### 왜 승인이 필요한가

구글 로그인은 "이 사람이 이 메일의 주인이다" 까지만 증명한다. "이 사람이 12기
김철수다" 는 증명하지 못한다. 졸업하면 학교 메일이 사라져 도메인 제한도 쓸 수
없으므로, 예외 없이 모든 가입이 운영진 승인을 거친다.

```
구글 로그인 → 기수·이름 입력 → 승인 대기 → 운영진 승인 → 학회원 탭 접근
```

### DB 적용

`supabase/migrations/` 의 SQL 을 순서대로 실행한다. Supabase 대시보드의
SQL Editor 에 붙여넣으면 된다.

### 첫 운영진 등록

승인할 사람이 없으면 아무도 승인될 수 없다. 최초 1회만 SQL 로 직접 지정한다.

```sql
-- 본인이 먼저 구글 로그인으로 가입한 뒤 실행
update public.profiles
set role = 'admin', status = 'approved'
where email = '본인메일@gmail.com';
```

이후 운영진 추가는 대시보드에서 한다.

### RLS 주의

`Enable automatic RLS` 를 켜두었기 때문에 **새 테이블은 만들자마자 모든 조회가
막힌다.** 데이터가 안 나오면 버그가 아니라 정책을 아직 안 쓴 것이다. 테이블마다
`select` / `insert` 정책을 명시적으로 작성해야 한다.

`profiles` 정책 안에서 `profiles` 를 조회하면 정책이 자기 자신을 다시 평가해
무한 재귀에 빠진다. `is_admin()` / `is_approved()` 는 이 고리를 끊기 위한
`security definer` 함수다.

## 배포

`main` 머지가 배포 트리거다. Vercel 이 자동으로 받아 약 90초 뒤 반영된다.

```
작업 브랜치 → PR → dev → PR → main(배포)
```

`dev` 와 `main` 은 직접 push 하지 않는다.

## 빌드 확인

CSS 를 크게 고쳤거나 의존성을 바꿨다면 커밋 전에 확인한다.

```bash
rm -rf .next && npm run build
```

`.next` 를 지운 뒤에는 dev 서버를 반드시 재시작한다. 캐시가 깨진 채로 두면
`Cannot find module './xxx.js'` 나 빈 화면이 나온다.
