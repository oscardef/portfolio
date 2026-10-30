'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { sections } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

export function SiteNav() {
  const pathname = usePathname();
  const [current, setCurrent] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30 border-b bg-paper/85 backdrop-blur-md transition-colors',
        scrolled ? 'border-rule' : 'border-transparent'
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 md:px-10">
        <Link href="/#top" className="hidden font-semibold tracking-tight sm:block">
          Oscar de Francesca
        </Link>
        <nav aria-label="Sections" className="flex items-center gap-1 sm:gap-2">
          {sections.map((s) => (
            <Link
              key={s.id}
              href={`/#${s.id}`}
              aria-current={current === s.id ? 'location' : undefined}
              className={cn(
                'rounded-full px-2.5 py-1.5 text-[0.9375rem] transition-colors sm:px-3',
                current === s.id ? 'text-ink' : 'text-ink-2 hover:text-ink'
              )}
            >
              {s.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
