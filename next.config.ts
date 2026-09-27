import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - To allow ngrok hot-reloading
  allowedDevOrigins: [
    "blizzard-entangled-expiring.ngrok-free.dev",
    "palmer-foster-somewhere-enhancing.trycloudflare.com",
    "floppy-rivers-move.loca.lt"
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default withPWA(nextConfig);
