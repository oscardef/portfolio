import { Info, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'tip';
  title?: string;
  children: ReactNode;
}

const calloutConfig = {
  info: {
    icon: Info,
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-500/5',
    iconColor: 'text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-amber-500/5',
    iconColor: 'text-amber-400',
  },
  success: {
    icon: CheckCircle,
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-500/5',
    iconColor: 'text-green-400',
  },
  tip: {
    icon: Lightbulb,
    borderColor: 'border-l-purple-500',
    bgColor: 'bg-purple-500/5',
    iconColor: 'text-purple-400',
  },
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'my-6 rounded-r-lg border-l-4 p-4',
        config.borderColor,
        config.bgColor
      )}
      role="note"
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className={cn('mt-0.5 shrink-0', config.iconColor)} />
        <div className="min-w-0">
          {title && <p className="font-semibold text-text-primary mb-1">{title}</p>}
          <div className="text-text-secondary text-sm [&>p]:mb-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
