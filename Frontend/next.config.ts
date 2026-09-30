import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'https://quresight-backend.onrender.com';
    return [
      {
        source: '/auth/:path*',
        destination: `${backendUrl}/auth/:path*`,
      },
      {
        source: '/screenings/:path*',
        destination: `${backendUrl}/screenings/:path*`,
      },
      {
        source: '/notifications/:path*',
        destination: `${backendUrl}/notifications/:path*`,
      },
      {
        source: '/datasets/:path*',
        destination: `${backendUrl}/datasets/:path*`,
      },
      {
        source: '/benchmarks/:path*',
        destination: `${backendUrl}/benchmarks/:path*`,
      },
      {
        source: '/user/:path*',
        destination: `${backendUrl}/user/:path*`,
      },
    ];
  },
};

export default nextConfig;
