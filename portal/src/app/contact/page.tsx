import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'Contact', alternates: {canonical: '/contact'} };
export default function Page() {
  const email = process.env.CONTACT_EMAIL;
  return <section className="section page-section prose"><span className="eyebrow">Contact</span><h1>Let&apos;s keep<br/>the conversation going.</h1><p className="lead">Questions about our products, educational partnerships, or an idea you would like to share?</p>{email ? <a className="button" href={`mailto:${email}`}>{email} <span aria-hidden="true">↗</span></a> : <p>Our direct contact channel will be published here soon. You can already explore our available learning experiences.</p>}<p><Link className="text-link" href="/products">Explore our products →</Link></p></section>;
}
