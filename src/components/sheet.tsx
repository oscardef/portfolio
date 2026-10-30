'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, ViewTransition, type ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * A project or role opened over the page. The URL is the item's own page,
 * so closing goes back in history and the page underneath keeps its place.
 */
export function Sheet({ label, href, children }: { label: string; href: string; children: ReactNode }) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const close = useCallback(() => router.back(), [router]);

  useEffect(() => {
    const page = document.getElementById('page');
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    page?.setAttribute('inert', '');
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      page?.removeAttribute('inert');
      opener?.focus({ preventScroll: true });
    };
  }, [close]);

  return (
    <>
      <ViewTransition enter="fade-in" exit="fade-out" default="none">
        <div aria-hidden="true" onClick={close} className="fixed inset-0 z-40 bg-[var(--scrim)]" />
      </ViewTransition>
      <ViewTransition enter="sheet-in" exit="sheet-out" default="none">
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          data-sheet-open
          className="fixed inset-y-0 right-0 z-50 w-full max-w-[800px] overflow-y-auto overscroll-contain bg-paper-raised shadow-[0_0_0_1px_var(--rule)] outline-none"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-rule bg-paper-raised/95 px-5 py-3 backdrop-blur sm:px-10">
            <a href={href} className="text-sm text-ink-2 underline decoration-ink-3 underline-offset-4 hover:text-ink">
              Open as a page
            </a>
            <button
              type="button"
              onClick={close}
              className="inline-flex items-center gap-1.5 rounded-full border border-rule px-3 py-1.5 text-sm hover:border-ink-3"
            >
              <X size={16} aria-hidden="true" />
              Close
            </button>
          </div>
          {children}
        </div>
      </ViewTransition>
    </>
  );
}
