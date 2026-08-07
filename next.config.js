/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    reactStrictMode: true,
    compiler: {
        styledComponents: true,
    },
    compress: true, // Gzip & Brotli 압축 활성화
    async redirects() {
        /*
         * 한때 섹션 컴포넌트가 pages/ 아래에 있었다. Next 는 pages/ 의 모든 파일을
         * 주소로 만들기 때문에 /activities/components/demoday 같은 URL 이 실제로
         * 열렸고, 그대로 색인됐다. 컴포넌트를 components/ 로 옮긴 뒤 그 주소들이
         * 404 가 되어, 검색결과의 하위 링크("최종 데모데이", "NEXT 로고")를 누르면
         * 없는 페이지로 갔다.
         *
         * 404 로 두면 구글이 지워줄 때까지 몇 주 동안 깨진 링크가 노출된다.
         * 해당 내용이 지금 어느 탭에 있는지 알고 있으므로 그 탭으로 넘긴다.
         * 탭 키는 pages/about, pages/activities 의 items 와 같아야 한다.
         */
        const gone = [
            ["/about/components/greeting", "/about?key=1"],
            ["/about/components/history", "/about?key=2"],
            ["/about/components/achievement", "/about?key=3"],
            ["/about/components/partners", "/about?key=4"],
            // introduction 탭은 지금 없다. 성격이 가장 가까운 인사말로 보낸다.
            ["/about/components/introduction", "/about?key=1"],
            ["/activities/components/curriculum", "/activities?key=1"],
            ["/activities/components/whynext", "/activities?key=5"],
            ["/activities/components/session", "/activities?key=2"],
            ["/activities/components/project", "/activities?key=3"],
            ["/activities/components/demoday", "/activities?key=4"],
        ];

        return [
            {
                source: "/",
                destination: "/home",
                permanent: true, // 301 리디렉션 (속도 & SEO 최적화)
            },
            ...gone.map(([source, destination]) => ({
                source,
                destination,
                permanent: true,
            })),
            /*
             * 위에 적지 않은 나머지(대소문자가 다른 변형, people 아래 것들)도
             * 404 로 남기지 않는다. 구체적인 규칙이 먼저 평가되므로 여기 걸리는 것은
             * 갈 곳이 정해지지 않은 주소뿐이다.
             */
            {
                source: "/people/components/:path*",
                destination: "/people",
                permanent: true,
            },
            {
                source: "/about/components/:path*",
                destination: "/about",
                permanent: true,
            },
            {
                source: "/activities/components/:path*",
                destination: "/activities",
                permanent: true,
            },
        ];
    },
    async headers() {
        return [
            {
                source: "/_next/static/:path*",
                headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
            {
                source: "/",
                headers: [{ key: "Cache-Control", value: "public, max-age=86400, must-revalidate" }],
            },
        ];
    },
};

module.exports = nextConfig;
