import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "localhost",
      "127.0.0.1",
      "172.16.21.168",
      "psba.gop.pk",
      "0.0.0.0",
      "172.16.21.109"
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
