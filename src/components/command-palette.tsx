'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { CornerDownLeft, Search } from 'lucide-react';
import { siteConfig } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * A quick way to anything on the site: press Cmd/Ctrl+K (or /), type a few
 * letters, press Enter. It lists the home page's sections, every project and
 * role, and a few actions. The search button in the menu opens it too.
 */

export interface PaletteItem {
  group: string;
  label: string;
  hint?: string;
  href: string;
  // Extra words to match on (stack, place) that aren't shown
  keywords?: string;
}

// Ask the palette to open, from anywhere (the menu's search button does)
export const openPalette = () => window.dispatchEvent(new Event('palette:open'));

const ACTIONS: PaletteItem[] = [
  {
    group: 'Actions',
    label: 'Copy email address',
    hint: siteConfig.email,
    href: 'action:copy-email',
    keywords: 'contact mail',
  },
  {
    group: 'Actions',
    label: 'Switch between dark and light',
    href: 'action:theme',
    keywords: 'theme mode appearance',
  },
  {
    group: 'Actions',
    label: 'Open GitHub',
    hint: 'github.com/oscardef',
    href: siteConfig.links.github,
    keywords: 'code source',
  },
  {
    group: 'Actions',
    label: 'Open LinkedIn',
    hint: 'linkedin.com/in/oscardef',
    href: siteConfig.links.linkedin,
  },
];

// A project's or role's own address, which opens as a sheet over the current page
const isDetail = (href: string) => /^\/(projects|experience)\/[^/]+$/.test(href);

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function CommandPalette({ items }: { items: PaletteItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const all = useMemo(() => [...items, ...ACTIONS], [items]);

  // A note for anyone who opens the console
  useEffect(() => {
    console.info(
      'Hello! This site is open source: https://github.com/oscardef/portfolio\nPress / or Ctrl/Cmd+K to search it.'
    );
  }, []);

  // Every word typed must appear somewhere in the item. Groups keep their
  // order; within a group, names that start with what was typed come first.
  const results = useMemo(() => {
    const words = fold(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return all;
    const groups = [...new Set(all.map((item) => item.group))];
    return all
      .map((item) => {
        const label = fold(item.label);
        const text = `${label} ${fold(item.hint ?? '')} ${fold(item.keywords ?? '')} ${fold(item.group)}`;
        if (!words.every((w) => text.includes(w))) return null;
        const rank = label.startsWith(words[0]) ? 0 : label.includes(words[0]) ? 1 : 2;
        return { item, rank };
      })
      .filter((r): r is { item: PaletteItem; rank: number } => r !== null)
      .sort(
        (a, b) => groups.indexOf(a.item.group) - groups.indexOf(b.item.group) || a.rank - b.rank
      )
      .map((r) => r.item);
  }, [all, query]);

  const show = useCallback(() => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery('');
    setCursor(0);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    opener.current?.focus({ preventScroll: true });
  }, []);

  // Cmd/Ctrl+K anywhere; "/" when not typing; the menu's search button
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing =
        event.target instanceof HTMLElement &&
        /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
      if (
        (event.key === 'k' && (event.metaKey || event.ctrlKey)) ||
        (event.key === '/' && !typing && !open)
      ) {
        event.preventDefault();
        if (open) hide();
        else show();
      } else if (event.key === 'Escape' && open) {
        // Ahead of the sheet's own Escape handler, so only the palette closes
        event.stopImmediatePropagation();
        hide();
      }
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('palette:open', show);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('palette:open', show);
    };
  }, [open, show, hide]);

  // Keep the highlighted result in view
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor, results]);

  const run = useCallback(
    (item: PaletteItem) => {
      setOpen(false);
      if (item.href === 'action:copy-email') {
        navigator.clipboard?.writeText(siteConfig.email).catch(() => {});
      } else if (item.href === 'action:theme') {
        document.querySelector<HTMLButtonElement>('button[aria-label^="Switch to"]')?.click();
      } else if (item.href.startsWith('http')) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else if (item.href.startsWith('/#') && pathname === '/') {
        const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        document
          .getElementById(item.href.slice(2))
          ?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      } else if (isDetail(item.href) && isDetail(pathname)) {
        // From one write-up to another: load it as a page, not as a sheet over this one
        window.location.assign(item.href);
      } else {
        router.push(item.href, { scroll: !isDetail(item.href) });
      }
    },
    [pathname, router]
  );

  if (!open) return null;

  const onInputKey = (event: ReactKeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setCursor((c) => (results.length ? (c + step + results.length) % results.length : 0));
    } else if (event.key === 'Enter' && results[cursor]) {
      event.preventDefault();
      run(results[cursor]);
    } else if (event.key === 'Tab') {
      event.preventDefault();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search the site"
      data-lightbox-open
      onClick={hide}
      className="fixed inset-0 z-[80] flex items-start justify-center bg-[var(--scrim)] px-4 pt-[12vh] backdrop-blur-sm"
      style={{ animation: 'fade 140ms ease-out' }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[min(34rem,70vh)] w-full max-w-[38rem] flex-col overflow-hidden rounded-2xl border border-border-hover bg-bg-card shadow-[0_30px_90px_-20px_rgb(0_0_0_/_0.6)]"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search size={18} aria-hidden="true" className="shrink-0 text-text-muted" />
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[cursor] ? `palette-${cursor}` : undefined}
            aria-label="Search projects, roles and sections"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search projects, roles and sections"
            style={{ outline: 'none' }}
            className="h-14 min-w-0 flex-1 bg-transparent text-[1.0625rem] placeholder:text-text-muted"
          />
          <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 text-xs text-text-muted sm:block">
            Esc
          </kbd>
        </div>

        <ul
          ref={listRef}
          id="palette-results"
          role="listbox"
          aria-label="Results"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
        >
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-text-secondary">
              Nothing matches “{query}”.
            </li>
          )}
          {results.map((item, i) => (
            <li key={`${item.group}-${item.href}-${item.label}`} role="presentation">
              {/* A group's name above its first result */}
              {(i === 0 || results[i - 1].group !== item.group) && (
                <p className="px-3 pb-1 pt-3 text-xs font-medium text-text-muted">{item.group}</p>
              )}
              <button
                type="button"
                id={`palette-${i}`}
                role="option"
                aria-selected={i === cursor}
                tabIndex={-1}
                onClick={() => run(item)}
                onMouseMove={() => setCursor(i)}
                className={cn(
                  'flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left',
                  i === cursor && 'bg-accent-muted'
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{item.label}</span>
                  {item.hint && (
                    <span className="block truncate text-sm text-text-muted">{item.hint}</span>
                  )}
                </span>
                {i === cursor && (
                  <CornerDownLeft
                    size={15}
                    aria-hidden="true"
                    className="shrink-0 text-accent-light"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
