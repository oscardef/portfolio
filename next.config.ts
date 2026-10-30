import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/projects/tutorassist', destination: '/projects/mathium', permanent: true },
    ];
  },
};

export default nextConfig;
