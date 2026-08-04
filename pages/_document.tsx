import Document, { DocumentContext, Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;
    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        });
      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles} {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="ko">
        <Head>
          {/* Preconnect & Preload (폰트 & CDN 리소스 최적화) */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
          <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />

          {/*
            Pretendard.
            styles/globals.css 에 @font-face 9종이 선언돼 있지만 그 파일을 어디서도
            import 하지 않아 지금까지 한 번도 로드된 적이 없다. public/font 의 16MB 는
            배포만 되고 아무도 받아가지 않는 죽은 용량이다.

            여기서는 dynamic subset 판을 쓴다. unicode-range 로 쪼개져 있어 실제로
            화면에 나온 글자가 속한 조각만 내려받는다. 통짜 woff2 한 벌이 790KB 인 것과
            달리 수십 KB 수준이고, 가변 폰트라 weight 를 자유롭게 쓸 수 있다.
          */}
          <link
            rel="stylesheet"
            as="style"
            crossOrigin=""
            href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          />

          {/* Canonical URL */}
          <link rel="canonical" href="https://www.next-ku.com/" />

          {/* Google Site Verification */}
          <meta
            name="google-site-verification"
            content="YdrWjel7OcCUGNmuvaV86uwaB_ZEqJsOqOoV-rKi6vA"
          />

          {/* SEO Meta Tags */}
          <meta name="keywords" content="NEXT, 고려대학교, 창업, 학회, 소프트웨어" />
          <meta
            name="description"
            content="고려대 소프트웨어 창업 학회 | NEXT 개발자 & 스타트업 창업의 허브 🚀 혁신적인 아이디어를 현실로 만들어 보세요."
          />

          {/* Lazy load external styles */}
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"
            defer
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
            defer
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
            defer
          />

          {/* Favicon */}
          <link rel="icon" href="/favicon.svg" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
