import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap { return ['', '/products', '/about', '/contact', '/privacy', '/terms', '/flops'].map(path => ({url: `https://vivalearn.space${path}`, changeFrequency: 'monthly', priority: path === '' ? 1 : 0.7})); }
