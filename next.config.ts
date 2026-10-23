import type { NextConfig } from "next";

const legacyPages = ['onboarding', 'login', 'categories', 'know', 'languages', 'world', 'shop', 'learning', 'auth', 'memory', 'room', 'capitals'];
const nextConfig: NextConfig = {
  // FLOPS is an independent zone behind the VivaLearning gateway.
  assetPrefix: '/flops-static',
  images: { path: '/flops-static/_next/image' },
  async redirects() {
    return [
      ...legacyPages.map(page => ({ source: `/${page}/:path*`, destination: `/flops/${page}/:path*`, permanent: false })),
      { source: '/flags', destination: '/flops/flags', permanent: false },
      { source: '/flags/repeat', destination: '/flops/flags/repeat', permanent: false },
      { source: '/flags/:code([A-Za-z]{2})', destination: '/flops/flags/:code', permanent: false },
    ];
  },
};
export default nextConfig;
