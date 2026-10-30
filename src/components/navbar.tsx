'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { sections, siteConfig } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const pathname = usePathname();

  // Mark the section in the middle of the viewport as current
  useEffect(() => {
    if (pathname !== '/') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main navigation">
        <Link
          href="/#top"
          className="text-lg font-semibold tracking-tight text-text-primary transition-colors hover:text-accent-light"
        >
          {siteConfig.name.split(' ')[0].toLowerCase()}
          <span className="text-accent">.</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {sections.map((s) => (
            <Link
              key={s.id}
              href={`/#${s.id}`}
              aria-current={current === s.id ? 'location' : undefined}
              className={cn(
                'relative py-1 text-sm transition-colors',
                current === s.id ? 'font-medium text-text-primary' : 'text-text-muted hover:text-text-primary'
              )}
            >
              {s.label}
              {current === s.id && (
                <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-accent" />
              )}
            </Link>
          ))}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-1 md:hidden">
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
        <div id="mobile-menu" className="border-t border-border/60 bg-bg/95 backdrop-blur-xl md:hidden">
          <div className="container-page flex flex-col gap-4 py-4">
            {sections.map((s) => (
              <Link
                key={s.id}
                href={`/#${s.id}`}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'py-1 text-sm transition-colors',
                  current === s.id ? 'font-medium text-text-primary' : 'text-text-muted hover:text-text-primary'
                )}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
