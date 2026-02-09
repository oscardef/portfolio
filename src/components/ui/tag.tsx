import { cn } from '@/lib/utils';

interface TagProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function Tag({ label, active, onClick, size = 'sm' }: TagProps) {
  const baseClasses =
    'inline-flex items-center rounded-full font-medium transition-all duration-200';

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          baseClasses,
          sizeClasses[size],
          active
            ? 'bg-accent text-white'
            : 'bg-bg-card text-text-secondary border border-border hover:border-border-hover hover:text-text-primary'
        )}
        type="button"
      >
        {label}
      </button>
    );
  }

  return (
    <span
      className={cn(
        baseClasses,
        sizeClasses[size],
        'bg-bg-card text-text-secondary border border-border'
      )}
    >
      {label}
    </span>
  );
}
