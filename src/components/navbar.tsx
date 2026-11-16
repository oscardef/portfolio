'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronRight, Menu, Search, X } from 'lucide-react';
import { navItems, siteConfig } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { openPalette } from './command-palette';
import { ThemeToggle } from './theme-toggle';

type NavItem = { label: string; href: string; section: string; page?: string };

// What the phone header calls the section in view (the menu's names)
const SECTION_NAMES: Record<string, string> = {
  glance: 'At a glance',
  work: 'Projects',
  experience: 'Experience',
  route: 'The route',
  places: 'Places',
  about: 'About',
  contact: 'Contact',
};

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
    for (const id of [
      'top',
      'glance',
      'work',
      'experience',
      'route',
      'places',
      'about',
      'contact',
    ]) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [pathname]);

  // Escape closes the phone menu
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const isCurrent = (item: NavItem) =>
    pathname === '/' ? section === item.section : !!item.page && pathname.startsWith(item.page);

  return (
    <>
      {/* Tapping the page behind the phone menu closes it */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-[var(--scrim)] lg:hidden"
        />
      )}
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
        <nav
          className="container-page flex h-16 items-center justify-between"
          aria-label="Main navigation"
        >
          <div className="flex min-w-0 items-baseline gap-2">
            <Link
              href="/"
              className="shrink-0 text-lg font-semibold tracking-tight text-text-primary transition-colors hover:text-accent-light"
            >
              {siteConfig.name.split(' ')[0].toLowerCase()}
              <span className="text-accent">.</span>
            </Link>
            {/* On a phone, where the menu is folded away: which part of the page this is */}
            {pathname === '/' && section && SECTION_NAMES[section] && (
              <span
                key={section}
                aria-hidden="true"
                className="fade-in min-w-0 truncate text-sm text-text-muted lg:hidden"
              >
                <span className="mr-2 text-border-hover">/</span>
                {SECTION_NAMES[section]}
              </span>
            )}
          </div>

          <div className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent(item) ? 'location' : undefined}
                className={cn(
                  'relative py-1 text-sm transition-colors',
                  isCurrent(item)
                    ? 'font-medium text-text-primary'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {item.label}
                {isCurrent(item) && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-accent" />
                )}
              </Link>
            ))}
            <button
              type="button"
              onClick={openPalette}
              aria-label="Search the site"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-3 text-sm text-text-muted transition-colors hover:border-border-hover hover:text-text-primary"
            >
              <Search size={15} aria-hidden="true" />
              <span className="hidden xl:inline">Search</span>
              <kbd className="hidden rounded border border-border px-1 text-xs xl:inline">/</kbd>
            </button>
            <ThemeToggle />
            <Link
              href="/#contact"
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={openPalette}
              aria-label="Search the site"
              className="inline-flex size-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-card hover:text-text-primary"
            >
              <Search size={17} aria-hidden="true" />
            </button>
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
          <div id="mobile-menu" className="border-t border-border/60 bg-bg lg:hidden">
            <div className="container-page flex flex-col pb-5 pt-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isCurrent(item) ? 'location' : undefined}
                  className={cn(
                    'flex items-center justify-between border-b border-border/60 py-3.5 text-[1.0625rem] font-medium transition-colors',
                    isCurrent(item) ? 'text-accent-light' : 'text-text-primary'
                  )}
                >
                  {item.label}
                  <ChevronRight size={17} aria-hidden="true" className="text-text-muted" />
                </Link>
              ))}
              <Link
                href="/#contact"
                onClick={() => setIsOpen(false)}
                className="mt-5 flex items-center justify-center rounded-full bg-accent py-3 font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Get in touch
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
