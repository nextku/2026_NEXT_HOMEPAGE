import React, { useCallback, useEffect, useRef } from "react";

/**
 * NEXT 워드마크를 입자로 그리고 포인터에 반응시킨다.
 *
 * docs/reference.md 의 interactive-text-particle / particle-text-effect 를 가져오되
 * 그대로는 못 쓴다. 원본에서 고친 것:
 *
 * 1. SSR 크래시 — 원본은 useState 초기값에서 window.innerWidth 를 읽는다.
 *    Next 는 서버에서 렌더하므로 그 자리에서 ReferenceError 가 난다.
 * 2. 팔레트 — 원본 기본값이 b38dca / 9c76db / 705cb5 보라 계열이다.
 *    브랜드 오렌지와 흰색만 쓴다.
 * 3. 고해상도 — devicePixelRatio 를 반영하지 않아 레티나에서 뭉갠다.
 * 4. 리사이즈 — window resize 만 듣는데 컨테이너 크기 변화를 놓친다. ResizeObserver 로.
 * 5. 접근성 — 캔버스에는 텍스트가 없다. 실제 제목은 DOM 에 두고 캔버스는 숨긴다.
 *    prefers-reduced-motion 이면 입자를 흩지 않고 가만히 둔다.
 * 6. 정리 — 원본은 resize 시 RAF 가 중복 실행된다.
 */

type Props = {
  /**
   * 입자로 분해할 로고 이미지 경로.
   * 글자를 타이핑해서 그리면 워드마크의 X 자리에 있는 오렌지 로켓이 사라진다.
   * 그 로켓이 NEXT 워드마크에서 가장 특징적인 부분이므로 실제 로고를 샘플링한다.
   */
  src: string;
  /** 입자 간격. 작을수록 촘촘하고 무겁다. */
  density?: number;
  className?: string;
};

type P = {
  ox: number;
  oy: number;
  x: number;
  y: number;
  r: number;
  fill: string;
};

export default function ParticleWordmark({ src, density = 3, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const bitmap = useRef<HTMLImageElement | null>(null);
  const particles = useRef<P[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const raf = useRef(0);
  const radius = useRef(90);
  const reduced = useRef(false);
  /** 원본 이미지를 그린 위치와 크기. 매 프레임 선명한 바탕을 다시 그리는 데 쓴다. */
  const drawBox = useRef({ x: 0, y: 0, w: 0, h: 0 });
  /** 커서가 빠진 뒤에도 입자가 제자리로 돌아올 때까지 도려낼 지점이 필요하다. */
  const lastPointer = useRef({ x: 0, y: 0 });
  /** 모든 입자가 제자리면 원본만 그리고 입자 계산을 건너뛴다. */
  const settled = useRef(true);

  /** 로고를 한 번 그린 뒤 픽셀을 읽어 입자 좌표와 색으로 바꾼다. */
  const build = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const logo = bitmap.current;
    if (!canvas || !wrap || !logo || !logo.complete) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) return;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // 로고를 컨테이너에 맞춰 비율 유지하며 그린다.
    const ratio = logo.naturalWidth / logo.naturalHeight;
    let dw = w;
    let dh = w / ratio;
    if (dh > h) {
      dh = h;
      dw = h * ratio;
    }
    const bx = (w - dw) / 2;
    const by = (h - dh) / 2;
    ctx.drawImage(logo, bx, by, dw, dh);
    drawBox.current = { x: bx, y: by, w: dw, h: dh };

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const step = Math.max(2, Math.round(density * dpr));
    const next: P[] = [];

    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const i = (y * canvas.width + x) * 4;
        const a = img.data[i + 3];
        if (a < 128) continue;
        // 로고 자체의 색을 그대로 쓴다. 흰 글자와 오렌지 로켓이 모두 보존된다.
        const rr = img.data[i];
        const gg = img.data[i + 1];
        const bb = img.data[i + 2];
        next.push({
          ox: x / dpr,
          oy: y / dpr,
          x: x / dpr,
          y: y / dpr,
          r: step / dpr / 2,
          fill: `rgb(${rr},${gg},${bb})`,
        });
      }
    }

    particles.current = next;
    radius.current = Math.max(70, dh * 0.55);
    ctx.clearRect(0, 0, w, h);
  }, [density]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const logo = bitmap.current;
    if (!canvas || !wrap || !logo) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    ctx.clearRect(0, 0, w, h);

    /*
     * 전체를 입자로만 그리면 쉬고 있을 때도 로고가 계단처럼 깨져 보인다.
     * 그래서 바탕은 항상 원본 이미지를 그대로 그려 선명하게 두고,
     * 커서 근처만 도려내 그 자리의 입자를 밀린 위치에 다시 그린다.
     * 움직이는 입자 수가 커서 주변으로 한정돼 프레임도 훨씬 가볍다.
     */
    const box = drawBox.current;
    ctx.drawImage(logo, box.x, box.y, box.w, box.h);

    const p = pointer.current;
    const rad = radius.current;
    // 커서가 없고 입자가 전부 제자리면 선명한 원본만 남기고 끝낸다.
    if (!p && settled.current) {
      raf.current = requestAnimationFrame(draw);
      return;
    }

    const cx = p ? p.x : lastPointer.current.x;
    const cy = p ? p.y : lastPointer.current.y;

    /*
     * 원본을 원으로 잘라내면 그 원의 경계가 그대로 눈에 보인다.
     * 가장자리를 서서히 흐리게 지워 경계선을 없앤다.
     */
    const eraseR = rad * 1.28;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    const fade = ctx.createRadialGradient(cx, cy, eraseR * 0.7, cx, cy, eraseR);
    fade.addColorStop(0, "rgba(0,0,0,1)");
    fade.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fade;
    ctx.beginPath();
    ctx.arc(cx, cy, eraseR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    /* 지운 범위보다 넓게 그린다. 경계 바로 바깥 입자까지 채워야 이음새가 안 생긴다. */
    const drawR = rad * 2;
    let moving = false;

    for (const s of particles.current) {
      // 그리기 범위 밖은 원본 이미지가 이미 그려주고 있다.
      const hx = s.ox - cx;
      const hy = s.oy - cy;
      if (hx * hx + hy * hy > drawR * drawR) continue;

      if (p && !reduced.current) {
        const dx = s.x - p.x;
        const dy = s.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < rad && dist > 0.01) {
          const push = ((rad - dist) / dist) * 0.9;
          s.x += dx * push * 0.16;
          s.y += dy * push * 0.16;
        }
      }
      // 항상 원래 자리로 되돌아온다. 이 복원력이 "다시 모이는" 느낌을 만든다.
      s.x += (s.ox - s.x) * 0.12;
      s.y += (s.oy - s.y) * 0.12;

      if (Math.abs(s.x - s.ox) > 0.3 || Math.abs(s.y - s.oy) > 0.3) moving = true;

      ctx.fillStyle = s.fill;
      ctx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
    }

    settled.current = !moving;
    raf.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let alive = true;
    const start = () => {
      if (!alive) return;
      build();
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(draw);
    };

    // 로고를 먼저 받아온 뒤에야 픽셀을 읽을 수 있다.
    const logo = new window.Image();
    logo.crossOrigin = "anonymous";
    logo.onload = () => {
      bitmap.current = logo;
      start();
    };
    logo.src = src;

    const wrap = wrapRef.current;
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => build())
        : null;
    if (ro && wrap) ro.observe(wrap);

    return () => {
      alive = false;
      cancelAnimationFrame(raf.current);
      ro?.disconnect();
    };
  }, [build, draw, src]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const next = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    pointer.current = next;
    lastPointer.current = next;
    settled.current = false;
  };

  return (
    <div
      ref={wrapRef}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={() => (pointer.current = null)}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
