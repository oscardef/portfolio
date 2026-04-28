'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEY = 'wip-banner-dismissed';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) !== '1';
}

function getServerSnapshot() {
  return false;
}

export function WipBanner() {
  const shouldShow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  }, []);

  const visible = shouldShow && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mx-auto max-w-6xl px-6 pt-20"
        >
          <div className="flex items-center justify-between gap-3 rounded-lg border border-accent/20 bg-accent/[0.06] px-4 py-2.5">
            <p className="text-xs text-text-secondary">
              This site is a work in progress — some content is still being updated.
            </p>
            <button
              onClick={dismiss}
              className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
