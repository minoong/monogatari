import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '가현쨩과 미누쿤의 모노가타리 🇹🇭',
    short_name: '현쨩❤️미누쿤',
    description: '가현쨩과 미누쿤의 모노가타리 🇹🇭',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
