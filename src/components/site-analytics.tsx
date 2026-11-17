'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics, siteConfig } from '@/lib/constants';

/**
 * Visitor analytics (Umami, cookieless). Loads the tracker from this site and adds
 * what it doesn't record by itself:
 *
 * - contact clicks (email, LinkedIn, GitHub) and links out to other sites
 * - which home page sections were reached, once per visit to the page
 * - `?ref=<name>` on a shared link, kept with the visit, to see who opened it
 *
 * `?notrack` on any page stops counting this browser (for Oscar's own devices);
 * `?track` turns it back on.
 */

type Umami = {
  track: (name: string, data?: Record<string, string>) => void;
  identify: (data: Record<string, string>) => void;
};
declare global {
  interface Window {
    umami?: Umami;
  }
}

let loaded = false;
// Events from before the tracker has loaded, sent once it has
const queue: [string, Record<string, string> | undefined][] = [];
// Sections already counted; a section counts again only when the page is opened again
const counted = new WeakSet<Element>();

function track(name: string, data?: Record<string, string>) {
  if (window.umami) window.umami.track(name, data);
  else queue.push([name, data]);
}

function onClick(event: MouseEvent) {
  const link = (event.target as Element | null)?.closest?.('a[href]');
  if (!(link instanceof HTMLAnchorElement) || link.closest('[data-umami-event]')) return;
  const href = link.href;
  if (href.startsWith('mailto:')) return track('Contact', { via: 'email' });
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return;
  }
  if (url.host === location.host) return;
  const bare = href.replace(/\/$/, '');
  if (bare === siteConfig.links.linkedin) return track('Contact', { via: 'linkedin' });
  if (bare === siteConfig.links.github) return track('Contact', { via: 'github' });
  track('Outbound', { url: `${url.host}${url.pathname}`.replace(/\/$/, '') });
}

export function SiteAnalytics() {
  const pathname = usePathname();

  // Load the tracker once
  useEffect(() => {
    if (loaded) return;
    loaded = true;
    const params = new URLSearchParams(location.search);
    try {
      if (params.has('notrack')) localStorage.setItem('umami.disabled', '1');
      if (params.has('track')) localStorage.removeItem('umami.disabled');
    } catch {
      // Storage can be blocked; counting then stays as it was
    }
    const ref = (params.get('ref') ?? params.get('utm_source'))?.trim().slice(0, 50);

    const script = document.createElement('script');
    script.src = '/v/s.js';
    script.defer = true;
    script.dataset.websiteId = analytics.websiteId;
    script.dataset.domains = analytics.domain;
    script.onload = () => {
      if (ref) window.umami?.identify({ ref });
      for (const [name, data] of queue.splice(0)) window.umami?.track(name, data);
    };
    document.head.appendChild(script);
    document.addEventListener('click', onClick, true);
  }, []);

  // Sections of the page reached, counted when their top passes the middle of the screen
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('main section[id]:not(#top)');
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || counted.has(entry.target)) continue;
          counted.add(entry.target);
          track('Section', { name: entry.target.id });
        }
      },
      { rootMargin: '0px 0px -50% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
