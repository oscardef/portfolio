'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Wraps an image in a write-up so a click opens it large over the page.
 * Screenshots and diagrams sit small beside the text; this is how a reader
 * gets to actually read them. Click anywhere, or press Escape, to close.
 */
export function Zoomable({
  src,
  alt,
  caption,
  children,
}: {
  src: string;
  alt: string;
  caption?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // Ahead of the sheet's own Escape handler, so only the picture closes
      event.stopImmediatePropagation();
      close();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, close]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          setLoaded(false);
          setOpen(true);
        }}
        aria-label={`Enlarge image: ${alt}`}
        className="block w-full cursor-zoom-in"
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            data-lightbox-open
            onClick={close}
            className="fixed inset-0 z-[70] flex cursor-zoom-out flex-col items-center justify-center gap-3 bg-black/90 p-4 sm:p-8"
            style={{ animation: 'fade 160ms ease-out' }}
          >
            <div className="relative min-h-0 w-full flex-1">
              {/* Shown until the large version has arrived */}
              {!loaded && (
                <p className="absolute inset-0 flex items-center justify-center text-sm text-white/60">
                  Loading…
                </p>
              )}
              <Image
                src={src}
                alt={alt}
                fill
                sizes="100vw"
                loading="eager"
                unoptimized={src.endsWith('.gif')}
                onLoad={() => setLoaded(true)}
                className="object-contain"
              />
            </div>
            {caption && <p className="max-w-[80ch] text-center text-sm text-white/80">{caption}</p>}
            <button
              type="button"
              autoFocus
              onClick={close}
              aria-label="Close image"
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
