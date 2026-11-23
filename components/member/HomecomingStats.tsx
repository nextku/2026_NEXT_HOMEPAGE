import React, { useEffect, useState } from "react";

import DailyChart from "components/member/DailyChart";
import { createClient } from "lib/supabase/client";
import * as S from "styles/member/style";

/**
 * 홈커밍 신청 사이트(next-homecoming.vercel.app)의 통계.
 *
 * 그 사이트는 이 홈페이지와 따로 배포되지만 기록은 여기 데이터베이스의
 * homecoming_events 에 쌓인다. 세는 일은 admin_homecoming_stats() 가 하고 이
 * 화면은 그 결과를 읽기 쉬운 말로 바꿔 보여준다.
 *
 * 사람 수는 브라우저 수다. 한 사람이 폰과 노트북으로 들어오면 둘로 센다.
 */

type Action = {
  name: string;
  place: string | null;
  detail: string | null;
  count: number;
  people: number;
};

type HomecomingStatsData = {
  days: number;
  events: number;
  funnel: { visitors: number; touched: number; seat: number; signup: number };
  signers: number;
  devices: { device: string; visitors: number }[];
  sources: { source: string; visitors: number }[];
  campaigns: { campaign: string; visitors: number }[];
  actions: Action[];
  cohorts: { cohort: number; views: number; people: number }[];
  shared_in: { cohort: number; visitors: number }[];
  daily: { day: string; visitors: number }[];
};

const RANGES = [
  { days: 1, label: "오늘" },
  { days: 7, label: "최근 7일" },
  { days: 14, label: "최근 14일" },
  { days: 30, label: "최근 30일" },
];

const DEVICE: Record<string, string> = {
  mobile: "모바일",
  tablet: "태블릿",
  desktop: "PC",
  unknown: "알 수 없음",
};

/** 사이트 쪽에서 보내는 위치·결과 값을 사람이 읽는 말로 */
const PLACE: Record<string, string> = {
  intro: "소개",
  join: "하단 안내",
  bar: "하단 고정 바",
  seat: "자리 카드",
  hall: "3D 테이블",
  chip: "기수 칩",
  roster: "명단",
  link: "공유 링크",
  mine: "내 자리",
  picker: "기수 고르기",
  first: "첫 방문",
  plan: "2D 배치도",
  key: "키보드",
};
const DETAIL: Record<string, string> = {
  sheet: "공유 창",
  copy: "링크 복사",
  reset: "홀 전체 보기",
  zoom_in: "확대 버튼",
  zoom_out: "축소 버튼",
  help: "조작 방법 열기",
  mode_model: "실내 보기로 전환",
  mode_sensor: "센서 보기로 전환",
  night_play: "타임라인 재생",
  night_pause: "타임라인 멈춤",
  seat_back: "홀 전체로 돌아가기",
  open: "확인 창 열기",
  ok: "확인됨",
  fail: "일치하는 신청 없음",
  limited: "시도 제한에 걸림",
};

const say = (dict: Record<string, string>, v: string | null) =>
  v ? (dict[v] ?? v) : null;

const cohortLabel = (n: number) => (n === 16 ? "15기 운영진" : `${n}기`);

function actionLabel(a: Action) {
  const place = say(PLACE, a.place);
  const detail = say(DETAIL, a.detail);
  const join = (...parts: (string | null)[]) =>
    parts.filter(Boolean).join(" · ");
  switch (a.name) {
    case "signup_click":
      return join("신청하기", place);
    case "share_click":
      return join("링크 공유", place, detail);
    case "seat_view":
      return join("기수 자리 보기", place);
    case "walk_start":
      return join("입구에서 걸어가기", place);
    case "walk_skip":
      return "걷기 건너뛰기";
    case "hall_touch":
      return join("3D 직접 조작 시작", detail);
    case "hall_control":
      return detail ?? "3D 버튼";
    case "signer_check":
      return join("신청자 확인", detail);
    default:
      return join(a.name, place, detail);
  }
}

/** 화면의 묶음. 같은 묶음 안에서는 많이 일어난 순서다(서버가 정렬해서 준다). */
const GROUPS: { title: string; names: string[] }[] = [
  { title: "신청·공유 버튼", names: ["signup_click", "share_click"] },
  {
    title: "3D 홀",
    names: ["seat_view", "walk_start", "walk_skip", "hall_touch", "hall_control"],
  },
  { title: "신청자 확인", names: ["signer_check"] },
];

function Rows({
  rows,
  unit = "명",
}: {
  rows: { key: string; label: string; value: number; sub?: string }[];
  unit?: string;
}) {
  if (rows.length === 0) return <S.Empty>기록 없음</S.Empty>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <S.StatRows>
      {rows.map((r) => (
        <S.StatRow key={r.key} $ratio={r.value / max}>
          <span>{r.label}</span>
          <strong>
            {r.value.toLocaleString()}
            <em>{r.sub ?? unit}</em>
          </strong>
        </S.StatRow>
      ))}
    </S.StatRows>
  );
}

export default function HomecomingStats() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<HomecomingStatsData | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    setFailed(null);
    createClient()
      .rpc("admin_homecoming_stats", { p_days: days })
      .then(({ data: d, error }) => {
        if (!alive) return;
        if (error) setFailed(error.message);
        else setData(d as HomecomingStatsData);
      });
    return () => {
      alive = false;
    };
  }, [days]);

  const f = data?.funnel;
  const steps = f
    ? [
        { label: "사이트 방문", value: f.visitors },
        { label: "3D 홀 조작", value: f.touched },
        { label: "기수 자리까지", value: f.seat },
        { label: "신청하기 클릭", value: f.signup },
      ]
    : [];
  const top = steps[0]?.value ?? 0;
  const deviceTotal = (data?.devices ?? []).reduce((n, d) => n + d.visitors, 0);

  return (
    <>
      <S.StatBar>
        {RANGES.map((r) => (
          <S.Chip
            key={r.days}
            type="button"
            $on={days === r.days}
            onClick={() => setDays(r.days)}
          >
            {r.label}
          </S.Chip>
        ))}
      </S.StatBar>

      {failed ? (
        <S.Empty>홈커밍 통계를 불러오지 못했습니다. {failed}</S.Empty>
      ) : !data ? null : data.events === 0 ? (
        <S.Empty>이 기간에 쌓인 홈커밍 기록이 없습니다.</S.Empty>
      ) : (
        <>
          <S.Funnel>
            {steps.map((s, i) => {
              const prev = i === 0 ? null : steps[i - 1];
              const rate =
                prev && prev.value > 0
                  ? Math.round((s.value / prev.value) * 100)
                  : null;
              return (
                <S.FunnelStep
                  key={s.label}
                  $ratio={top > 0 ? s.value / top : 0}
                  $last={i === steps.length - 1}
                >
                  <div>
                    <span className="label">{s.label}</span>
                    <span className="count">
                      {s.value.toLocaleString()}
                      <small>명</small>
                    </span>
                  </div>
                  <div className="track">
                    <span className="fill" />
                  </div>
                  {rate !== null && (
                    <S.FunnelDrop>
                      앞 단계에서 <b>{rate}%</b> 이어짐
                    </S.FunnelDrop>
                  )}
                </S.FunnelStep>
              );
            })}
          </S.Funnel>

          <S.StatBlock style={{ marginBottom: "clamp(2.4rem, 4vw, 3.6rem)" }}>
            <h2>일별 방문자</h2>
            <DailyChart rows={data.daily ?? []} days={data.days} />
            {data.signers > 0 && (
              <S.Notice style={{ marginTop: "0.8rem" }}>
                신청자로 확인한 브라우저 {data.signers}곳의 방문이 포함되어 있습니다.
              </S.Notice>
            )}
          </S.StatBlock>

          <S.StatGrid>
            <S.StatBlock>
              <h2>기기</h2>
              <Rows
                rows={data.devices.map((d) => ({
                  key: d.device,
                  label: DEVICE[d.device] ?? d.device,
                  value: d.visitors,
                  sub: `명 · ${
                    deviceTotal > 0
                      ? Math.round((d.visitors / deviceTotal) * 100)
                      : 0
                  }%`,
                }))}
              />
            </S.StatBlock>

            <S.StatBlock>
              <h2>유입 경로</h2>
              <Rows
                rows={data.sources.map((s) => ({
                  key: s.source,
                  label: s.source,
                  value: s.visitors,
                }))}
              />
            </S.StatBlock>

            {data.campaigns.length > 0 && (
              <S.StatBlock>
                <h2>캠페인 (utm)</h2>
                <Rows
                  rows={data.campaigns.map((c) => ({
                    key: c.campaign,
                    label: c.campaign,
                    value: c.visitors,
                  }))}
                />
              </S.StatBlock>
            )}

            {GROUPS.map((g) => (
              <S.StatBlock key={g.title}>
                <h2>{g.title}</h2>
                <Rows
                  rows={data.actions
                    .filter((a) => g.names.includes(a.name))
                    .map((a) => ({
                      key: `${a.name}-${a.place}-${a.detail}`,
                      label: actionLabel(a),
                      value: a.count,
                      sub: `회 · ${a.people.toLocaleString()}명`,
                    }))}
                />
              </S.StatBlock>
            ))}

            <S.StatBlock>
              <h2>많이 본 기수 자리</h2>
              <Rows
                rows={data.cohorts.map((c) => ({
                  key: String(c.cohort),
                  label: cohortLabel(c.cohort),
                  value: c.views,
                  sub: `회 · ${c.people.toLocaleString()}명`,
                }))}
              />
            </S.StatBlock>

            <S.StatBlock>
              <h2>기수 공유 링크로 들어온 사람</h2>
              <Rows
                rows={data.shared_in.map((c) => ({
                  key: String(c.cohort),
                  label: cohortLabel(c.cohort),
                  value: c.visitors,
                }))}
              />
            </S.StatBlock>
          </S.StatGrid>
        </>
      )}
    </>
  );
}
