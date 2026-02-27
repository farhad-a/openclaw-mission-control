import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // BACKEND_URL is a server-side runtime env var (no NEXT_PUBLIC_ prefix), so it
    // is read from the container environment at startup — not baked at build time.
    // Default works for local dev; override via BACKEND_URL=http://backend:8000 in Docker.
    const backendUrl = (
      process.env.BACKEND_URL ?? "http://localhost:8000"
    ).replace(/\/+$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
  // In dev, Next may proxy requests based on the request origin/host.
  // Allow common local origins so `next dev --hostname 127.0.0.1` works
  // when users access via http://localhost:3000 or http://127.0.0.1:3000.
  // Keep the LAN IP as well for dev on the local network.
  allowedDevOrigins: ["192.168.1.101", "localhost", "127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
