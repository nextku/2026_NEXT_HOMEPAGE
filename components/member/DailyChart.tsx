import React, { useEffect, useMemo, useRef, useState } from "react";

import * as S from "styles/member/style";

/**
 * 일별 방문자 추이.
 *
 * 합계만 보면 "지원 기간에 사람이 몰렸는지" 를 알 수 없다. 날짜별로 늘어놓으면
 * 홍보를 한 날과 아무 일 없던 날이 눈에 보인다.
 *
 * 라이브러리를 쓰지 않는다. 필요한 것은 선 하나와 값 하나라, 차트 라이브러리를
 * 얹으면 번들만 커지고 기본 스타일을 되돌리는 데 더 손이 간다.
 *
 * 기록이 없는 날은 서버가 아예 행을 주지 않는다. 그대로 그리면 빈 날이 접혀
 * 가로축이 거짓말을 한다. 여기서 0 으로 채워 날짜 간격을 고르게 만든다.
 */

type Point = { day: string; visitors: number };

const H = 160;
const PAD_T = 16;
const PAD_B = 26;

function fillDays(rows: Point[], days: number): Point[] {
  const map = new Map(rows.map((r) => [r.day.slice(0, 10), r.visitors]));
  const out: Point[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    out.push({ day: key, visitors: map.get(key) ?? 0 });
  }
  return out;
}

function label(day: string) {
  const [, m, d] = day.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
}

export default function DailyChart({
  rows,
  days,
}: {
  rows: Point[];
  days: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  // viewBox 를 늘려 맞추면 선 굵기와 점이 함께 찌그러진다. 실제 폭을 재서 그린다.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setWidth(Math.floor(e.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => fillDays(rows, days), [rows, days]);
  const max = Math.max(1, ...data.map((d) => d.visitors));

  const x = (i: number) =>
    data.length <= 1 ? width / 2 : (i / (data.length - 1)) * width;
  const y = (v: number) => PAD_T + (1 - v / max) * (H - PAD_T - PAD_B);

  const line = data
    .map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.visitors)}`)
    .join(" ");
  const area = `${line} L${x(data.length - 1)},${H - PAD_B} L${x(0)},${H - PAD_B} Z`;

  const pick = (clientX: number) => {
    const el = wrapRef.current;
    if (!el || data.length === 0) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const i = Math.round(ratio * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  };

  const at = hover === null ? null : data[hover];

  return (
    <S.Chart
      ref={wrapRef}
      onMouseMove={(e) => pick(e.clientX)}
      onMouseLeave={() => setHover(null)}
      onTouchStart={(e) => pick(e.touches[0].clientX)}
      onTouchMove={(e) => pick(e.touches[0].clientX)}
      onTouchEnd={() => setHover(null)}
    >
      {width > 0 && (
        <svg width={width} height={H} role="img" aria-label="일별 방문자 추이">
          <path d={area} fill="#f1ece2" />
          <path
            d={line}
            fill="none"
            stroke="#17150f"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {at && hover !== null && (
            <>
              <line
                x1={x(hover)}
                y1={PAD_T - 8}
                x2={x(hover)}
                y2={H - PAD_B}
                stroke="#cfc8bc"
                strokeWidth="1"
              />
              <circle
                cx={x(hover)}
                cy={y(at.visitors)}
                r="4"
                fill="#fbf8f3"
                stroke="#17150f"
                strokeWidth="1.8"
              />
            </>
          )}
        </svg>
      )}

      <S.ChartAxis>
        <span>{data[0] ? label(data[0].day) : ""}</span>
        <span>{data.length ? label(data[data.length - 1].day) : ""}</span>
      </S.ChartAxis>

      {at && hover !== null && width > 0 && (
        <S.ChartTip
          style={{
            left: `${(x(hover) / width) * 100}%`,
            // 양 끝에서는 말풍선이 잘리므로 안쪽으로 붙인다.
            transform:
              hover === 0
                ? "translateX(0)"
                : hover === data.length - 1
                  ? "translateX(-100%)"
                  : "translateX(-50%)",
          }}
        >
          <strong>{at.visitors.toLocaleString()}명</strong>
          <span>{label(at.day)}</span>
        </S.ChartTip>
      )}
    </S.Chart>
  );
}
