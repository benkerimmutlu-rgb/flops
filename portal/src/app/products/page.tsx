import type { Metadata } from 'next';
import { Products } from '@/components/Products';
export const metadata: Metadata = { title: 'Our Products', alternates: {canonical: '/products'} };
export default function Page() { return <section className="section page-section"><div className="section-heading"><span className="eyebrow">Our products</span><h1>Find your next<br/>learning adventure.</h1><p>Play. Explore. Understand. Grow.</p></div><Products/></section>; }
