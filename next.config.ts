import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "*",
      },
    ],
    domains: [
      "localhost",
      "127.0.0.1",
      "172.16.21.149",
      "psba.gop.pk",
      "0.0.0.0",
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
