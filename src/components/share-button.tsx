'use client';

import { useState, useSyncExternalStore } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { siteConfig } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * Passes a project or role on: the phone's own share sheet where there is
 * one, otherwise the link is copied. Meant for whoever reads a write-up and
 * wants to send it to a colleague.
 */

const never = () => () => {};
const canShare = () => typeof navigator.share === 'function';

export function ShareButton({
  title,
  path,
  className,
}: {
  title: string;
  path: string;
  className?: string;
}) {
  const share = useSyncExternalStore(never, canShare, () => false);
  const [copied, setCopied] = useState(false);
  const url = `${siteConfig.url}${path}`;

  async function go() {
    if (share) {
      try {
        await navigator.share({ title: `${title} · ${siteConfig.name}`, url });
        return;
      } catch (error) {
        // Closing the share sheet is not a failure; anything else falls back to copying
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked; the address bar still has the link
    }
  }

  const Icon = copied ? Check : share ? Share2 : Link2;
  return (
    <button
      type="button"
      onClick={go}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-rule px-3 py-1.5 text-sm transition-colors hover:border-ink-3',
        copied && 'border-accent/40 text-accent-light',
        className
      )}
    >
      <Icon size={15} aria-hidden="true" />
      <span aria-live="polite">{copied ? 'Link copied' : share ? 'Share' : 'Copy link'}</span>
    </button>
  );
}
