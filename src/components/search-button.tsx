'use client';

import { Search } from 'lucide-react';
import { openPalette } from './command-palette';

// Opens the site's search, from a page that wants to offer it as a button (the 404)
export function SearchButton() {
  return (
    <button
      type="button"
      onClick={openPalette}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-border-hover hover:bg-bg-card-hover"
    >
      <Search size={15} aria-hidden="true" />
      Search the site
      <kbd className="hidden rounded border border-border px-1 text-xs text-text-muted sm:inline">
        /
      </kbd>
    </button>
  );
}
