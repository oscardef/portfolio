'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The row of logos under the hero: where I've worked and studied.
 *
 * Each logo opens what I did there: a role as a sheet, a university as its
 * chapter on the route. Pointing at a logo lights it up and names the role
 * underneath. On a phone a finger does the same: touch a logo to light it,
 * slide along the row to move the light, tap to open. The first time the
 * row comes into view on a phone, the light runs along it once, so it's
 * clear the logos do something.
 */

export interface Org {
  name: string;
  logo: string;
  width: number;
  height: number;
  href: string;
  // The role or degree, and where and when, shown under the row
  note: string;
}

// How far a finger may move and still count as a tap, in px
const TAP_SLOP = 10;

export function OrgStrip({ items }: { items: Org[] }) {
  const [lit, setLit] = useState<number | null>(null);
  const rowRef = useRef<HTMLUListElement>(null);
  const touch = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const touched = useRef(false);
  // A slide just ended: the click the browser may send after it isn't a tap
  const swallow = useRef(false);

  // The light runs along the row once, the first time a phone shows it
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!coarse || still) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let i = 0;
        timer = window.setInterval(() => {
          // Someone got there first
          if (touched.current) return window.clearInterval(timer);
          if (i < items.length) setLit(i++);
          else {
            setLit(null);
            window.clearInterval(timer);
          }
        }, 420);
      },
      { threshold: 1 }
    );
    observer.observe(row);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [items.length]);

  // The logo under a point of the screen, if any
  const at = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-org]');
    return el && rowRef.current?.contains(el) ? Number(el.dataset.org) : null;
  };

  const onDown = (event: ReactPointerEvent) => {
    if (event.pointerType === 'mouse') return;
    touched.current = true;
    touch.current = { x: event.clientX, y: event.clientY, moved: false };
    setLit(at(event.clientX, event.clientY));
  };
  const onMove = (event: ReactPointerEvent) => {
    const t = touch.current;
    if (!t) return;
    if (Math.hypot(event.clientX - t.x, event.clientY - t.y) > TAP_SLOP) t.moved = true;
    const i = at(event.clientX, event.clientY);
    if (i !== null) setLit(i);
  };
  const onUp = () => {
    if (touch.current?.moved) {
      swallow.current = true;
      window.setTimeout(() => (swallow.current = false), 400);
    }
    touch.current = null;
  };

  const shown = lit === null ? null : items[lit];

  return (
    <div>
      <ul
        ref={rowRef}
        // Sideways slides light the logos; up and down still scrolls the page
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={(event) => event.pointerType === 'mouse' && setLit(null)}
        // This row scrolls to its chapters itself (section-links.tsx leaves it alone),
        // so a slide that ends on a university doesn't scroll the page away
        data-own-clicks=""
        className="mt-5 grid grid-cols-2 items-center gap-x-4 gap-y-1 sm:mt-7 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-6 xl:gap-x-12"
      >
        {items.map((org, i) => (
          <li
            key={org.name}
            data-org={i}
            className={cn('flex justify-center', i === items.length - 1 && items.length % 2 === 1 && 'col-span-2')}
          >
            <Link
              href={org.href}
              scroll={false}
              onMouseEnter={() => setLit(i)}
              onFocus={() => setLit(i)}
              onBlur={() => setLit(null)}
              onClick={(event) => {
                if (swallow.current) {
                  event.preventDefault();
                  return;
                }
                // A university: its chapter on the route, further down this page
                const target =
                  org.href.startsWith('/#') && document.getElementById(org.href.slice(2));
                if (target) {
                  event.preventDefault();
                  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                  target.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
                }
              }}
              aria-label={`${org.name}: ${org.note}`}
              className="flex h-12 max-w-full items-center justify-center rounded-lg px-1.5 [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] focus-visible:outline-offset-2 sm:h-auto sm:py-1.5"
            >
              <Image
                src={org.logo}
                alt=""
                width={org.width}
                height={org.height}
                draggable={false}
                className={cn(
                  'org-logo select-none object-contain transition-[opacity,filter] duration-300',
                  lit === i
                    ? 'org-logo-lit opacity-100'
                    : lit === null
                      ? 'opacity-60'
                      : 'opacity-30'
                )}
                style={{ height: org.height * 0.85, width: 'auto', maxWidth: '100%' }}
              />
            </Link>
          </li>
        ))}
      </ul>

      {/* What the lit logo stands for; the same height whether empty or not, so nothing jumps */}
      <p
        aria-hidden="true"
        className="mt-5 flex min-h-[2.75rem] items-start justify-center px-2 text-center text-sm sm:mt-6 sm:min-h-6"
      >
        {shown ? (
          <span key={shown.name} className="fade-in leading-snug">
            <span className="font-semibold text-text-primary">{shown.name}</span>
            <span className="text-text-muted"> · {shown.note}</span>
            <ArrowRight
              size={14}
              aria-hidden="true"
              className="mb-0.5 ml-1.5 inline text-accent-light"
            />
          </span>
        ) : (
          <span className="text-text-muted">
            <span className="pointer-fine:hidden">Tap a logo to see what I did there</span>
            <span className="hidden pointer-fine:inline">
              Point at a logo to see what I did there
            </span>
          </span>
        )}
      </p>
    </div>
  );
}
