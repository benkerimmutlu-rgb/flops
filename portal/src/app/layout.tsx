import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import './site.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://vivalearn.space'),
  title: { default: 'VivaLearning — Learn by Living.', template: '%s | VivaLearning' },
  description: 'Discover interactive learning through play, exploration, psychology, and technology. Explore FLOPS, LaФla, and the VivaLearning product family.',
  applicationName: 'VivaLearning',
  icons: { icon: '/viva/icon.svg' },
  openGraph: { title: 'VivaLearning — Learning is an adventure.', description: 'Play. Explore. Understand. Grow.', url: 'https://vivalearn.space', siteName: 'VivaLearning', type: 'website', locale: 'en_US' },
};
export default function Layout({children}: {children: React.ReactNode}) {
  return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a><Header/><main id="main-content">{children}</main><footer className="site-footer"><div><Link className="wordmark" href="/">viva<span>learning</span><i aria-hidden="true">.</i></Link><p>Learn by Living.</p></div><nav aria-label="Footer navigation"><Link href="/products">Products</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Use</Link></nav><small>© {new Date().getFullYear()} VivaLearning</small></footer></body></html>;
}
