import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: 'Oscar de Francesca',
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f5f3',
    theme_color: '#f4f5f3',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/icon-192.png', type: 'image/png', sizes: '192x192', purpose: 'any' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'any' },
      {
        src: '/icon-maskable-512.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'maskable',
      },
    ],
  };
}
