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
};

export default nextConfig;
