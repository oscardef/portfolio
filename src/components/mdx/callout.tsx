import { Info, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { type ReactNode } from 'react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'tip';
  title?: string;
  children: ReactNode;
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  tip: Lightbulb,
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const Icon = icons[type];

  return (
    <div className="not-prose my-6 flex items-start gap-3 rounded-[3px] border border-rule bg-paper p-4" role="note">
      <Icon size={18} className="mt-1 shrink-0 text-ink-2" aria-hidden="true" />
      <div className="min-w-0 text-[0.9375rem] text-ink-2">
        {title && <p className="mb-1 font-semibold text-ink">{title}</p>}
        <div className="[&>p]:mb-0">{children}</div>
      </div>
    </div>
  );
}
