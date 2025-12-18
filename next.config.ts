import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",

  async rewrites() {
    // 개발 환경: rewrites 없이 axios의 baseURL 사용 (localhost:8080)
    // 배포 환경: /api 경로를 제거하고 원래 경로로 rewrite
    if (process.env.NODE_ENV === "production") {
      return {
        beforeFiles: [
          {
            source: "/api/:path*",
            destination: "/:path*",
          },
        ],
      };
    }

    return {
      beforeFiles: [],
    };
  },
};

export default nextConfig;
