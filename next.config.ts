import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage 공개 이미지 도메인 (배포 시 자신의 프로젝트 도메인으로 자동 매칭)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
