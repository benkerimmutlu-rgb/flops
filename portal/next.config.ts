import type { NextConfig } from 'next';
const origin = (process.env.FLOPS_ORIGIN || 'https://flops-one.vercel.app').replace(/\/$/, '');
// Префиксы зоны FLOPS, которые портал проксирует на источник.
const prefixes = ['/flops', '/flops-static', '/assets', '/flags-clay', '/flags', '/icons'];
const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Сначала голый путь зоны (без хвоста): /flops → origin/flops. Без этого
        // wildcard отдаёт пустой :path* как /flops/ и источник делает слеш-редирект
        // на /flops — получается бесконечная петля на входе в приложение.
        ...prefixes.map(source => ({ source, destination: `${origin}${source}` })),
        // Затем вложенные пути: /flops/anything → origin/flops/anything.
        ...prefixes.map(source => ({ source: `${source}/:path*`, destination: `${origin}${source}/:path*` })),
      ],
    };
  },
};
export default nextConfig;
