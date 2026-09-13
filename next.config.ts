import type { NextConfig } from "next";

const productionUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "https://git-glyph.vercel.app";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_URL: productionUrl,
  },
};

export default nextConfig;

