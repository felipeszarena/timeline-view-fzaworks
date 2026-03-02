import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Turbopack: força a raiz do projeto a ser este diretório,
  // evitando que ele suba para diretórios pai (OneDrive / workspace).
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
