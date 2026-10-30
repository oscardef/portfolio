import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/projects/tutorassist', destination: '/projects/mathium', permanent: true },
      // The site became one page; the old index pages point at their sections
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/experience', destination: '/#journey', permanent: true },
      { source: '/projects', destination: '/#journey', permanent: true },
    ];
  },
};

export default nextConfig;
