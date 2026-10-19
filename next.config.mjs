/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp']
  },
  async redirects() {
    return [
      {
        source: '/transparencia',
        destination: '/desde-el-corazon',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/reels',
        destination: '/reels-tiktok-ghibli.html',
      },
      {
        source: '/reels-tiktok',
        destination: '/reels-tiktok-ghibli.html',
      },
      {
        source: '/carrusel',
        destination: '/carrusel-27-octubre.html',
      },
    ];
  },
};

export default nextConfig;
