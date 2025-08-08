import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost", "127.0.0.1", "172.16.21.168", "psba.gop.pk","172.16.21.143"],
  },
  reactStrictMode: true,
};

export default nextConfig;
