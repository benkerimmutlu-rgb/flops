import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import './site.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://vivalearn.space'),
  title: { default: 'VivaLearn — Learn by Living.', template: '%s | VivaLearn' },
  description: 'Discover interactive learning through play, exploration, psychology, and technology. Explore FLOPS, LaФla, and the VivaLearn product family.',
  applicationName: 'VivaLearn',
  icons: { icon: '/viva/icon.svg' },
  openGraph: { title: 'VivaLearn — Learning is an adventure.', description: 'Play. Explore. Understand. Grow.', url: 'https://vivalearn.space', siteName: 'VivaLearn', type: 'website', locale: 'en_US' },
};
export default function Layout({children}: {children: React.ReactNode}) {
  return <html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"/>
    <meta name="theme-color" content="#006B65"/>
  </head><body><a href="#main-content" className="skip-link">Skip to content</a><Header/><main id="main-content">{children}</main><footer className="site-footer"><div><Link className="logo" href="/" aria-label="VivaLearn home"><span className="logo-arrows" aria-hidden="true"><i className="chev"/><i className="chev"/></span><span className="logo-word"><b>viva</b><i>learning</i></span></Link><p>Learn by Living.</p></div><nav aria-label="Footer navigation"><Link href="/products">Products</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Use</Link></nav><small>© {new Date().getFullYear()} VivaLearn</small></footer></body></html>;
}
