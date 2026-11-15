'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

// Copies the address for anyone who would rather paste it than open a mail app
export function CopyEmailButton({ address }: { address: string }) {
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
      className="inline-flex items-center gap-2 rounded-full border border-border bg-bg/60 px-5 py-3 font-medium text-text-primary transition-colors hover:border-border-hover hover:bg-bg-card-hover"
    >
      {copied ? (
        <Check size={17} aria-hidden="true" className="text-accent-light" />
      ) : (
        <Copy size={17} aria-hidden="true" className="text-text-muted" />
      )}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy address'}</span>
    </button>
  );
}
