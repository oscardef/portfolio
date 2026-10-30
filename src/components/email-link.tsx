'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function EmailLink({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked; the address stays selectable
    }
  }

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
      <a
        href={`mailto:${address}`}
        className="text-[clamp(1.25rem,3.6vw,2.5rem)] [overflow-wrap:anywhere] font-semibold leading-tight tracking-tight underline decoration-rule decoration-2 underline-offset-[0.18em] hover:decoration-ink"
      >
        {address}
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rule px-3.5 py-1.5 text-sm text-ink-2 hover:border-ink-3 hover:text-ink"
      >
        {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        <span aria-live="polite">{copied ? 'Copied' : 'Copy address'}</span>
      </button>
    </div>
  );
}
