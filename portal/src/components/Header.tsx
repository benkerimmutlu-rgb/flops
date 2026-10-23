'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
const links = [['/', 'Home'], ['/products', 'Our Products'], ['/about', 'About'], ['/contact', 'Contact']];
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="wordmark" aria-label="VivaLearn home">viva<span>learn</span><i aria-hidden="true">.</i></Link>
    <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-navigation">{open ? 'Close' : 'Menu'} <span aria-hidden="true">{open ? '×' : '☰'}</span></button>
    <nav id="site-navigation" className={open ? 'site-nav open' : 'site-nav'} aria-label="Main navigation">
      {links.map(([href, label]) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
      <a className="button small" href="/flops">Explore FLOPS <span aria-hidden="true">↗</span></a>
    </nav>
  </div></header>;
}
