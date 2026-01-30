import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for shared hosting deployment
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    // Local uploads served from /public/uploads/
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sczdpueymqspwnhbuomf.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/:path*.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.css',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },

  // Compression
  compress: true,

  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['react-icons', 'date-fns'],
  },
};

export default nextConfig;
