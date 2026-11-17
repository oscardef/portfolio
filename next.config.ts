import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Sensible defaults for every response; Vercel adds HSTS itself
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // The production build is also served at *.vercel.app; send those visits (and search
      // engines) to the real address. Previews keep their own URLs.
      ...(process.env.VERCEL_ENV === 'production'
        ? [
            {
              source: '/:path*',
              has: [{ type: 'host' as const, value: '(?<deployment>.+)\\.vercel\\.app' }],
              destination: 'https://oscar.defrancesca.com/:path*',
              permanent: true,
            },
          ]
        : []),
      { source: '/projects/tutorassist', destination: '/projects/mathium', permanent: true },
      // About is a section of the home page now
      { source: '/about', destination: '/#about', permanent: true },
    ];
  },
};

export default nextConfig;
