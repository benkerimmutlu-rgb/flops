import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots { return { rules: {userAgent: '*', allow: '/', disallow: ['/flops/login', '/flops/onboarding', '/flops/auth/']}, sitemap: 'https://vivalearn.space/sitemap.xml' }; }
