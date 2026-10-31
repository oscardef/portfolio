'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navItems, siteConfig } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

type NavItem = { label: string; href: string; section?: string };

const mobileItems: NavItem[] = [...navItems, { label: 'Contact', href: '/#contact', section: 'contact' }];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const pathname = usePathname();

  // On the home page, mark the section in the middle of the viewport
  useEffect(() => {
    if (pathname !== '/') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setSection(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    for (const id of ['top', 'glance', 'work', 'route', 'places', 'about', 'contact']) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [pathname]);

  const isCurrent = (item: NavItem) =>
    item.section ? pathname === '/' && section === item.section : pathname.startsWith(item.href);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main navigation">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-text-primary transition-colors hover:text-accent-light"
        >
          {siteConfig.name.split(' ')[0].toLowerCase()}
          <span className="text-accent">.</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item) ? ('section' in item ? 'location' : 'page') : undefined}
              className={cn(
                'relative py-1 text-sm transition-colors',
                isCurrent(item) ? 'font-medium text-text-primary' : 'text-text-muted hover:text-text-primary'
              )}
            >
              {item.label}
              {isCurrent(item) && (
                <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-accent" />
              )}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            href="/#contact"
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-text-secondary transition-colors hover:text-text-primary"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div id="mobile-menu" className="border-t border-border/60 bg-bg/95 backdrop-blur-xl lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {mobileItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'rounded-lg px-2 py-2.5 text-[0.9375rem] transition-colors',
                  isCurrent(item)
                    ? 'font-medium text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
