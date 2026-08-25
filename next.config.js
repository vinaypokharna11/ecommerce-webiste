/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/inquire',
        destination: '/contact?tab=inquire',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
