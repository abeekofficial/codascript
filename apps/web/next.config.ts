import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@codascript/types"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
