import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { keyframes } from "styled-components";
import { THEME } from "styles/theme";

export const smoothAppear = keyframes`
from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const GlobalStyleWrapper = createGlobalStyle`


  /*
   * 서체는 html 에서 한 번 선언하고 나머지는 상속시킨다.
   * antd 5 는 CSS-in-JS 를 런타임에 주입해서 styled-components 보다 늦게 들어오는데,
   * body 셀렉터(0,0,1)가 * (0,0,0) 를 이겨 시스템 폰트로 되돌려버린다.
   * html body 로 특이도를 한 단계 올려 그 되돌림을 막는다.
   */
  html,
  html body {
    font-family: 'Pretendard Variable', Pretendard, 'Spoqa Han Sans Neo',
      -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
      "Malgun Gothic", system-ui, sans-serif;
  }

  * {
    padding: 0px;
    margin: 0px;
    /* box-sizing: border-box; */
    font-family: inherit;
    /* 요청받은 기본 자간. 한글은 이 정도 조여야 덩어리가 흩어지지 않는다. */
    letter-spacing: -0.025em;
  }
  body, button, form, h1, h2, h3, h4, h5, h6, p, input, legend, li, ol, ul, select, table, td, textarea, th {
    margin:0;
    padding:0;
    /* background-color: #1D1D1D; */
  }
  ::-webkit-scrollbar {
  display: none;
}
.pnlm-about-msg {
  visibility: hidden;
}
.pnlm-about-msg a {
  visibility: hidden;
}
  a {
    color: inherit;
    text-decoration: none;
  }
  button {
    background:none;
    border:0;
    cursor:pointer;

    &:disabled {
      cursor: default;
    }
  }

  /*
   * 전역 outline: none 은 키보드 사용자를 사이트에서 쫓아낸다.
   * 마우스 클릭 때는 안 보이고 키보드 이동 때만 보이는 :focus-visible 로 되살린다.
   */
  :where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
    outline: 2px solid #F7941E;
    outline-offset: 2px;
    border-radius: 2px;
  }

  html {
    /* 헤더가 fixed 라 앵커로 이동하면 제목이 헤더 밑에 가린다. */
    scroll-padding-top: 12rem;
    font-size: 62.5%;
    -webkit-tap-highlight-color: transparent;
  }
  body {
  padding: 0;
  margin: 0;
  /* keep-all 은 어절 중간에서 끊기는 걸 막고, overflow-wrap 은 끊을 데가 없는
     긴 이메일·URL 이 컨테이너를 뚫는 걸 막는다. 둘은 반드시 짝으로 쓴다. */
  word-break: keep-all;
  overflow-wrap: break-word;
  /* user-select: none 을 걷어낸다. 지원자가 모집 일정과 이메일을 복사할 수 있어야 한다. */
 -ms-overflow-style: none;
  /* overflow-x: hidden; */
  }

  /* 모션을 줄이라고 설정한 사용자에게는 애니메이션을 전부 죽인다. */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }


  --antd-wave-shadow-color: ${THEME.ORANGE} !important;
  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: ${THEME.ORANGE} !important;
  }
  .ant-tabs-tab:hover,
  .ant-tabs-tab-btn:focus,
  .ant-tabs-tab-remove:focus,
  .ant-tabs-tab-btn:active,
  .ant-tabs-tab-remove:active {
    color: ${THEME.ORANGE} !important;
  }
  .ant-tabs-ink-bar {
    background: ${THEME.ORANGE} !important;
  }


  .ant-tabs-tab {
    margin: 0 3.2rem 0 3.2rem !important;
    @media screen and (max-width: 820px) {
      margin: 0 1.6rem !important;
    }
  }

  @media screen and (max-width:820px) {
    .ant-tabs-top >.ant-tabs-nav {
         margin: 0 !important;
      }
  }

  a:hover,
  a:active {
    color: ${THEME.ORANGE};
  }

@font-face {
    font-family: 'NanumSquareNeo-Variable';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_11-01@1.0/NanumSquareNeo-Variable.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
}
@font-face {
    font-family: 'GmarketSansMedium';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
  @media screen and (max-width: 415px) {
    html {
      font-size: 9.375px;
    }
  }

  @media screen and (max-width: 413px) {
    html {
      font-size: 8.75px;
    }
  }

  @media screen and (max-width: 361px) {
    html {
      font-size: 8.125px;
    }
  }

  @media screen and (max-width: 321px) {
    html {
      font-size: 7.5px;
    }
  }

  .mount {
    animation: ${smoothAppear} 0.5s;
  }
`;

const Container = styled.div`
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  /* max-width: 1920px; */
  /* 100vw 는 스크롤바 폭을 포함해 가로 스크롤을 만든다 */
  width: 100%;
  /* overflow: hidden; */
  margin: 0 auto;
  font-size: 1.6rem;
  color: #222222;
`;

const GlobalStyle = ({ children }) => {
  return (
    <>
      <GlobalStyleWrapper />
      <Container>{children}</Container>
    </>
  );
};

export default GlobalStyle;
