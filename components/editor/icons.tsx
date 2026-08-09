import React from "react";

/**
 * 도구 막대 아이콘.
 *
 * 낱말로만 세워두었더니 "사진" 이 누를 수 있는 것인지조차 알아보지 못했다.
 * 모양이 있으면 도구라는 것이 먼저 읽힌다.
 *
 * 아이콘 묶음을 새로 받지 않는다. 열 몇 개 쓰자고 꾸러미를 하나 더 얹으면
 * 글쓰기 화면만 무거워진다. 선 굵기와 끝 모양을 한곳에서 맞춰 직접 그린다.
 */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconBold = () => (
  <svg {...base}>
    <path d="M7 5h6.5a3.5 3.5 0 010 7H7zM7 12h7.5a3.5 3.5 0 010 7H7z" />
  </svg>
);

export const IconItalic = () => (
  <svg {...base}>
    <path d="M15 5h-5M14 19H9M14.5 5l-4 14" />
  </svg>
);

export const IconStrike = () => (
  <svg {...base}>
    <path d="M4 12h16M16.5 7A4 4 0 0013 5h-1.5C9.6 5 8 6.3 8 8s1.6 2.7 3.5 3M7.5 17A4 4 0 0011 19h1.5c1.9 0 3.5-1.3 3.5-3" />
  </svg>
);

export const IconCode = () => (
  <svg {...base}>
    <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
  </svg>
);

export const IconH1 = () => (
  <svg {...base}>
    <path d="M4 6v12M12 6v12M4 12h8M17 18v-7l-2 1.4" />
  </svg>
);

export const IconH2 = () => (
  <svg {...base}>
    <path d="M4 6v12M11 6v12M4 12h7M15 11a2 2 0 113.6 1.2L15 18h4" />
  </svg>
);

export const IconH3 = () => (
  <svg {...base}>
    <path d="M4 6v12M11 6v12M4 12h7M15 10.6A2 2 0 1116.8 14M16 14a2 2 0 11-1 3.7" />
  </svg>
);

export const IconBulletList = () => (
  <svg {...base}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="18" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconOrderedList = () => (
  <svg {...base}>
    <path d="M10 6h10M10 12h10M10 18h10M4 7V4.2L3 5M3 10h2.5L3 13.2h2.6M3 16h2.4L3 19h2.6" />
  </svg>
);

export const IconTaskList = () => (
  <svg {...base}>
    <path d="M11 6h9M11 12h9M11 18h9M3 6l1.6 1.6L7.5 4.6M3 16.4L4.6 18l2.9-3" />
  </svg>
);

export const IconQuote = () => (
  <svg {...base}>
    <path d="M5 6v12M10 8.5c-1.7 0-2.8 1.1-2.8 2.6M10 8.5h3.5v3.5H10zM17.5 8.5H21V12h-3.5z" />
  </svg>
);

export const IconCodeBlock = () => (
  <svg {...base}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <path d="M9.5 9.5L7 12l2.5 2.5M14.5 9.5L17 12l-2.5 2.5" />
  </svg>
);

export const IconDivider = () => (
  <svg {...base}>
    <path d="M3 12h18M6 7h12M6 17h12" opacity="0.55" />
    <path d="M3 12h18" />
  </svg>
);

export const IconLink = () => (
  <svg {...base}>
    <path d="M10.5 13.5a4 4 0 005.7 0l2.6-2.6a4 4 0 00-5.7-5.7l-1.3 1.3" />
    <path d="M13.5 10.5a4 4 0 00-5.7 0l-2.6 2.6a4 4 0 005.7 5.7l1.3-1.3" />
  </svg>
);

export const IconImage = () => (
  <svg {...base}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <circle cx="8.6" cy="9.8" r="1.5" />
    <path d="M3.5 16.5l4.4-4a2 2 0 012.7 0l3 2.8M14 15l1.6-1.5a2 2 0 012.7 0l2.2 2" />
  </svg>
);
