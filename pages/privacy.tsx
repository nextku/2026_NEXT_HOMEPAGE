import Head from "next/head";
import React from "react";
import * as S from "styles/legal/style";

/**
 * 개인정보처리방침.
 *
 * 실제로 무엇을 받아 어디에 두는지 적는 것이 목적이다. 아래 내용은 코드에서
 * 확인한 실제 수집 항목을 그대로 옮긴 것이다.
 *   지원 폼   components/s3upload      이름 · 학번 · 이메일 · 전화번호 · 파일
 *   로그인    lib/supabase             이메일 주소, 기수 · 학과
 *   방문 기록 pages/_app.tsx (GA4)
 *
 * 수집 항목이 바뀌면 이 문서도 함께 고쳐야 한다.
 */

const UPDATED = "2026년 8월 8일";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>개인정보처리방침 | 고려대학교 소프트웨어 창업학회 NEXT</title>
        <meta
          name="description"
          content="고려대학교 소프트웨어 창업학회 NEXT가 수집하는 개인정보의 항목과 이용 목적, 보관 기간을 안내합니다."
        />
      </Head>

      <S.Page>
        <S.Wrap>
          <S.Head>
            <h1>개인정보처리방침</h1>
            <p>최종 개정 {UPDATED}</p>
          </S.Head>

          <S.Section>
            <p>
              고려대학교 소프트웨어 창업학회 NEXT(이하 &lsquo;학회&rsquo;)는
              학회 지원과 학회원 서비스 제공에 필요한 최소한의 개인정보만
              수집합니다. 이 문서는 학회가 수집하는 항목과 그 이용 목적, 보관
              기간을 설명합니다.
            </p>
          </S.Section>

          <S.Section>
            <h2>1. 수집하는 항목과 이용 목적</h2>
            <S.Table>
              <table>
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>항목</th>
                    <th>목적</th>
                    <th>보관 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>학회 지원</td>
                    <td>이름, 학번, 이메일, 전화번호, 지원서 파일</td>
                    <td>서류 심사, 면접 일정 안내, 합격 여부 통보</td>
                    <td>해당 기수 선발 종료 후 3개월 이내 파기</td>
                  </tr>
                  <tr>
                    <td>로그인</td>
                    <td>이메일 주소, 비밀번호</td>
                    <td>본인 확인 및 로그인</td>
                    <td>회원 탈퇴 시 즉시 파기</td>
                  </tr>
                  <tr>
                    <td>학회원 확인</td>
                    <td>기수, 학과</td>
                    <td>학회원 여부 확인 및 승인</td>
                    <td>회원 탈퇴 시 즉시 파기</td>
                  </tr>
                  <tr>
                    <td>방문 기록</td>
                    <td>접속 기기·브라우저 정보, 방문 경로</td>
                    <td>사이트 이용 현황 파악</td>
                    <td>수집일로부터 14개월</td>
                  </tr>
                  <tr>
                    <td>이용 기록</td>
                    <td>
                      조회한 페이지, 누른 버튼, 브라우저가 만든 임의 식별자
                    </td>
                    <td>지원 절차에서 어디가 막히는지 확인</td>
                    <td>수집일로부터 12개월</td>
                  </tr>
                </tbody>
              </table>
            </S.Table>
            <p>
              학회는 위 항목 외에{" "}
              <b>
                주민등록번호, 계좌번호, 사상·신념, 건강 정보 등 민감정보를
                수집하지 않습니다.
              </b>
            </p>
            <p>
              이용 기록의 식별자는 브라우저가 스스로 만든 임의의 문자열이며
              이름·이메일 등 개인을 알아볼 수 있는 정보와 연결되지 않습니다. IP
              주소는 저장하지 않습니다.
            </p>
          </S.Section>

          <S.Section>
            <h2>2. 로그인 방식</h2>
            <p>
              가입할 때 이메일 주소와 비밀번호를 받습니다. 아무 주소나 적어
              가입하는 것을 막기 위해, 가입 직후 그 주소로 여섯 자리 코드를 보내
              주인임을 확인합니다. 확인 전에는 로그인되지 않습니다.
            </p>
            <p>
              <b>
                비밀번호는 되돌릴 수 없는 형태로 저장되어 학회도 알 수 없습니다.
              </b>{" "}
              잊으신 경우 재설정 링크를 보내드릴 뿐, 기존 비밀번호를 알려드릴
              수는 없습니다.
            </p>
            <p>
              이메일 주소는 학회원 여부를 확인하고 학회원 전용 화면에 접근
              권한을 부여하는 데에만 사용합니다. 광고나 마케팅 목적으로 사용하지
              않습니다.
            </p>
          </S.Section>

          <S.Section>
            <h2>3. 처리 위탁</h2>
            <p>
              학회는 서비스 운영을 위해 아래 사업자에게 개인정보 처리 업무를
              위탁하고 있습니다.
            </p>
            <ul>
              <li>
                Supabase — 회원 정보 저장 및 인증 메일 발송 (데이터 보관 위치:
                대한민국 서울)
              </li>
              <li>Amazon Web Services — 지원서 파일 보관</li>
              <li>Vercel — 웹사이트 호스팅</li>
              <li>Resend — 인증 코드 메일 발송</li>
              <li>Google — 방문 통계(Google Analytics)</li>
            </ul>
          </S.Section>

          <S.Section>
            <h2>4. 제3자 제공</h2>
            <p>
              학회는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만
              법령에 따라 수사기관 등이 적법한 절차로 요청하는 경우에는 예외로
              합니다.
            </p>
          </S.Section>

          <S.Section>
            <h2>5. 이용자의 권리</h2>
            <p>
              이용자는 언제든지 자신의 개인정보에 대해{" "}
              <b>열람, 정정, 삭제, 처리 정지</b>를 요청할 수 있습니다. 아래
              연락처로 요청하면 지체 없이 처리합니다.
            </p>
            <p>
              회원 탈퇴를 요청하면 계정과 프로필 정보가 즉시 삭제되며, 삭제된
              정보는 복구되지 않습니다.
            </p>
          </S.Section>

          <S.Section>
            <h2>6. 쿠키 사용</h2>
            <p>
              로그인 상태를 유지하기 위해 쿠키를 사용합니다. 이 쿠키를 거부하면
              로그인 기능을 이용할 수 없습니다.
            </p>
            <p>
              방문 통계를 위해 Google Analytics 쿠키도 사용합니다. 이는 브라우저
              설정에서 거부할 수 있으며, 거부해도 사이트 이용에는 지장이
              없습니다.
            </p>
          </S.Section>

          <S.Section>
            <h2>7. 개정</h2>
            <p>
              이 방침이 바뀌는 경우 웹사이트에 변경 내용과 시행일을 공지합니다.
            </p>
          </S.Section>

          <S.Contact>
            <strong>개인정보 보호 책임자</strong>
            고려대학교 소프트웨어 창업학회 NEXT 대표
            <br />
            <a href="mailto:nextku.contact@gmail.com">
              nextku.contact@gmail.com
            </a>
          </S.Contact>
        </S.Wrap>
      </S.Page>
    </>
  );
}
