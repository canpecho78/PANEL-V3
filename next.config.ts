import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_NAME_COLLECTION: process.env.MONGODB_NAME_COLLECTION,
    MONGODB_USERS: process.env.MONGODB_USERS,
  },
  transpilePackages: ['bcryptjs'],
  images: {
    domains: ["hebbkx1anhila5yf.public.blob.vercel-storage.com"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        'timers/promises': false,
        kerberos: false,
        '@mongodb-js/zstd': false,
        '@aws-sdk/credential-providers': false,
        'gcp-metadata': false,
        snappy: false,
        socks: false,
        'mongodb-client-encryption': false,
        aws4: false,
      }
    }
    return config
  }
};

export default nextConfig;