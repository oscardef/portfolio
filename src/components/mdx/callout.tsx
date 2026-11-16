import { AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react';
import { type ReactNode } from 'react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'tip';
  title?: string;
  children: ReactNode;
}

// One look for every kind of note, in the site's accent; the icon says which kind it is
const icons = { info: Info, warning: AlertTriangle, success: CheckCircle, tip: Lightbulb };

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const Icon = icons[type];
  return (
    <div className="not-prose my-6 rounded-2xl border border-accent/25 bg-accent-muted p-4" role="note">
      <div className="flex items-start gap-3">
        <Icon size={19} aria-hidden="true" className="mt-0.5 shrink-0 text-accent-light" />
        <div className="min-w-0">
          {title && <p className="mb-1 font-semibold text-text-primary">{title}</p>}
          <div className="text-[0.9375rem] leading-relaxed text-text-secondary [&>p]:mb-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
