import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mysql2"],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/uploads/:path*", destination: "/api/media/file/:path*" },
      ],
    };
  },
};

export default nextConfig;
