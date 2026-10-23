import type { Metadata } from "next";
import Link from 'next/link';
import Image from 'next/image';
import { Products } from '@/components/Products';
import { Approach } from '@/components/Approach';
export const metadata: Metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return <><section className="hero section"><div className="hero-copy"><span className="eyebrow">Play · Explore · Learn</span><h1>Learning is<br/>an <em>adventure.</em></h1><p>We make learning come alive through play, exploration, psychology, and technology.</p><div className="hero-actions"><Link className="button" href="/products">Explore Our Products <span aria-hidden="true">↗</span></Link><a className="button secondary" href="/flops">Play FLOPS <span aria-hidden="true">→</span></a></div><span className="hero-note">Made for curious minds. At every age.</span></div><div className="hero-art"><div className="hero-circle" aria-hidden="true"/><Image src="/viva/flops.webp" alt="Meet Flops, the curious clay pug who helps you explore the world" width={580} height={580} priority/><span className="art-caption">Meet your next adventure.<br/><strong>Start with FLOPS.</strong></span></div></section>
    <section className="section products-section"><div className="section-heading"><span className="eyebrow">Our products</span><h2>One world.<br/>Endless ways to <em>learn.</em></h2><p>Discover the world, understand people, and build skills for real life.</p></div><Products/></section>
    <Approach/>
    <section className="vision section"><span className="eyebrow">Our vision</span><h2>A world where<br/><em>curiosity</em> never stops.</h2><p>At VivaLearn, we believe education should inspire people at every stage of life. We&apos;re building interactive experiences that make discovering the world, understanding people, and developing new skills more engaging and accessible.</p><Link className="text-link" href="/about">Get to know VivaLearn <span aria-hidden="true">↗</span></Link></section>
  </>;
}
