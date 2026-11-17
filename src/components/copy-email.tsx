'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

// Copies the address for anyone who would rather paste it than open a mail app.
// Small enough to sit in the corner of the email row on the contact card.
export function CopyEmailButton({ address, className }: { address: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked; the address is written out beside the button
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      data-umami-event="Contact"
      data-umami-event-via="copy email"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        copied
          ? 'border-accent/40 bg-accent-muted text-accent-light'
          : 'border-border bg-bg-card text-text-secondary hover:border-border-hover hover:text-text-primary',
        className
      )}
    >
      {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
      <span className="sr-only"> email address</span>
    </button>
  );
}
