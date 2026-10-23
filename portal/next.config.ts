import type { NextConfig } from 'next';
const origin = (process.env.FLOPS_ORIGIN || 'https://flops-one.vercel.app').replace(/\/$/, '');
const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        ...['/flops/:path*', '/flops-static/:path*', '/assets/:path*', '/flags-clay/:path*', '/flags/:path*', '/icons/:path*'].map(source => ({ source, destination: `${origin}${source}` })),
      ],
    };
  },
};
export default nextConfig;
