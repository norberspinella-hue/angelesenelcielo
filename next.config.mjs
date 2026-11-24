/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'hmfdauxrpolpvbzlxenq.supabase.co',
      },
    ],
  },
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
    const world3dOrigin = (process.env.WORLD3D_REWRITE_ORIGIN || '').replace(/\/$/, '');
    const world3dRewrites = world3dOrigin
      ? [
          { source: '/cielo3d', destination: `${world3dOrigin}/cielo3d/` },
          { source: '/cielo3d/:path*', destination: `${world3dOrigin}/cielo3d/:path*` },
          { source: '/jardin-homenajes', destination: `${world3dOrigin}/jardin-homenajes` },
          { source: '/api/jardin/:path*', destination: `${world3dOrigin}/api/jardin/:path*` },
          { source: '/api/espacios-3d', destination: `${world3dOrigin}/api/espacios-3d` },
        ]
      : [];

    return [
      ...world3dRewrites,
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
