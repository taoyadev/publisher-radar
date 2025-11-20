import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable compression for better performance
  compress: true,

  // Optimize production build
  output: 'standalone',

  // Enable strict mode for better error detection
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
    // Enable PPR (Partial Prerendering) when stable
    // ppr: true,
  },

  // Configure redirects (SEO-friendly 301 redirects)
  async redirects() {
    return [
      // Redirect old /sellers/[id] to new /publisher/[id]
      {
        source: '/sellers/:id',
        destination: '/publisher/:id',
        permanent: true, // 301 redirect
      },
      // Redirect /seller/[id] (singular) to /publisher/[id]
      {
        source: '/seller/:id',
        destination: '/publisher/:id',
        permanent: true, // 301 redirect
      },
      // Redirect old capitalized URL to lowercase
      {
        source: '/AdSense-reverse-lookup',
        destination: '/adsense-reverse-lookup',
        permanent: true, // 301 redirect
      },
    ];
  },

  // Configure headers for better caching
  async headers() {
    return [
      // API routes - short cache with stale-while-revalidate
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },

      // Static assets - long cache
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // Publisher pages - ISR cache (1 hour with 2 hour stale)
      {
        source: '/publisher/:id',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        ],
      },

      // Publisher list page - longer cache (1 hour)
      {
        source: '/publishers',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        ],
      },

      // Homepage - medium cache (5 minutes)
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },

      // Security headers for all pages
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Configure rewrites for cleaner URLs (if needed)
  async rewrites() {
    return [
      // Example: /p/123 -> /publisher/pub-123
      // Uncomment if you want short URLs
      // {
      //   source: '/p/:id',
      //   destination: '/publisher/pub-:id',
      // },
    ];
  },
};

export default nextConfig;
