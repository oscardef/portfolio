'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navLinks, siteConfig } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-bg/80 backdrop-blur-xl">
      <nav
        className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="text-text-primary font-semibold text-lg tracking-tight hover:text-accent transition-colors"
        >
          {siteConfig.name.split(' ')[0].toLowerCase()}
          <span className="text-accent">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                isActive(link.href)
                  ? 'text-text-primary font-medium'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors p-2"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/50 bg-bg/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm transition-colors py-1 ${
                    isActive(link.href)
                      ? 'text-text-primary font-medium'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
