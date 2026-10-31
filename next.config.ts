import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/projects/tutorassist', destination: '/projects/mathium', permanent: true },
      // About is a section of the home page now
      { source: '/about', destination: '/#about', permanent: true },
    ];
  },
};

export default nextConfig;
