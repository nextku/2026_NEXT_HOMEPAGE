/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: "https://www.next-ku.com", // 실제 도메인
    generateRobotsTxt: true, // robots.txt 자동 생성
    sitemapSize: 5000, // 한 개의 sitemap 파일에 들어갈 최대 URL 수 (기본값: 5000)
    changefreq: "daily", // 검색 엔진에 URL 변경 빈도 알림
    priority: 0.7, // 기본 우선순위 (홈페이지는 자동으로 1.0으로 설정됨)
    // 로그인해야 볼 수 있는 화면은 색인 대상이 아니다. 각 페이지의 noindex 와
    // 짝을 맞춰 sitemap 에서도 뺀다.
    exclude: ["/login", "/members", "/admin"],
    robotsTxtOptions: {
        policies: [
            { userAgent: "*", allow: "/" },
            { userAgent: "*", disallow: ["/login", "/members", "/admin"] },
        ],
    },
};
