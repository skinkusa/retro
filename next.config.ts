import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'export',
  // Capacitor WebView routing expects trailing slashes for static export
  trailingSlash: true,
  /* Ensure correct dependency tracing when multiple lockfiles exist (e.g. parent dir on Vercel) */
  outputFileTracingRoot: path.join(process.cwd()),
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
