import type {NextConfig} from 'next';
import path from 'path';

const isGhPages = process.env.DEPLOY_TARGET === 'ghpages';

const nextConfig: NextConfig = {
  output: isGhPages ? 'export' : 'standalone',
  // GitHub Pages serves from /retro (the repo name)
  basePath: isGhPages ? '/retro' : '',
  /* Ensure correct dependency tracing when multiple lockfiles exist */
  outputFileTracingRoot: path.join(process.cwd()),
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    // GH Pages can't use Next.js image optimisation (requires a server)
    unoptimized: isGhPages ? true : false,
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
