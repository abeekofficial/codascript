import type { NextConfig } from "next";
import path from "path";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/~offline",
  },
});

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn("⚠️ WARNING: NEXT_PUBLIC_API_URL is not set, falling back to localhost - this will fail in production ⚠️");
}

const nextConfig: NextConfig = {
  transpilePackages: ["@codascript/types"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  async rewrites() {
    // Ensure we don't duplicate /api in the destination
    let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    if (backendUrl.endsWith('/')) {
      backendUrl = backendUrl.slice(0, -1);
    }
    const backendBase = backendUrl.replace(/\/api$/, ''); // e.g. http://localhost:5000

    return {
      beforeFiles: [
        // Ensure explicit backend auth routes are proxied to backend FIRST
        // before NextAuth's [...nextauth] catch-all intercepts them.
        {
          source: "/api/auth/register",
          destination: `${backendBase}/api/auth/register`,
        },
        {
          source: "/api/auth/login",
          destination: `${backendBase}/api/auth/login`,
        },
        {
          source: "/api/auth/refresh",
          destination: `${backendBase}/api/auth/refresh`,
        },
        {
          source: "/api/auth/oauth",
          destination: `${backendBase}/api/auth/oauth`,
        },
        {
          source: "/api/auth/me",
          destination: `${backendBase}/api/auth/me`,
        },
        {
          source: "/api/auth/leaderboard",
          destination: `${backendBase}/api/auth/leaderboard`,
        },
        {
          source: "/api/auth/profile",
          destination: `${backendBase}/api/auth/profile`,
        },
        {
          source: "/api/auth/password",
          destination: `${backendBase}/api/auth/password`,
        },
        {
          source: "/api/auth/account",
          destination: `${backendBase}/api/auth/account`,
        },
        {
          source: "/api/auth/forgot-password",
          destination: `${backendBase}/api/auth/forgot-password`,
        },
        {
          source: "/api/auth/reset-password",
          destination: `${backendBase}/api/auth/reset-password`,
        },
      ],
      fallback: [
        // Catch all other /api routes and send to backend
        // (NextAuth routes like /api/auth/signin will naturally take precedence over this)
        {
          source: "/api/:path*",
          destination: `${backendBase}/api/:path*`,
        },
      ]
    };
  },
};

export default withPWA(nextConfig);
