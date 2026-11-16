'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Makes links to a section of the home page (/#work) scroll there every
 * time. Left to the browser and the router, a second click on the same link
 * does nothing, because the address already ends in that hash. The logo
 * (a link to /) scrolls back to the top in the same way.
 *
 * The address is left without a hash afterwards. A hash that stays behind
 * pulls the page back to its section whenever a project or role sheet
 * closes, because going back in history scrolls to the hash again.
 *
 * Only acts on the home page itself; anywhere else the link navigates as usual.
 */

// Through the router's own history hook (state null), so it keeps track of the address
const clearHash = () => window.history.replaceState(null, '', '/');

export function SectionLinks() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.location.pathname !== '/') return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      const href = link?.getAttribute('href');
      if (!href || link?.getAttribute('target') === '_blank') return;
      // Parts of the page that handle their own links (the logo row)
      if (link?.closest('[data-own-clicks]')) return;

      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth';
      if (href === '/') {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior });
        if (window.location.hash) clearHash();
        return;
      }
      const id = /^\/#([\w-]+)$/.exec(href)?.[1];
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior, block: 'start' });
      if (window.location.hash) clearHash();
    };
    // In the capture phase, so the router's own link handling sees the click as dealt with
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // Arriving on the home page with a hash (a shared link, or a section link
  // on another page): the page scrolls there, then the hash is dropped
  useEffect(() => {
    if (pathname !== '/' || !window.location.hash) return;
    const timer = window.setTimeout(() => {
      if (window.location.pathname === '/' && window.location.hash) clearHash();
    }, 800);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
