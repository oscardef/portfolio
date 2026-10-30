'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

// Matches --paper in globals.css
const THEME_COLOURS: Record<Theme, string> = { light: '#f4f5f3', dark: '#0e1420' };

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const read = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => 'light' as Theme);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  function toggle() {
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOURS[next]);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for this visit
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      className="inline-flex size-9 items-center justify-center rounded-full text-ink-2 hover:bg-ink/5 hover:text-ink"
    >
      {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
