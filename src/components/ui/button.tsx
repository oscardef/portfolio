import Link from 'next/link';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  external?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
  icon?: 'arrow' | 'external';
}

export function Button({
  children,
  href,
  external,
  variant = 'primary',
  size = 'md',
  className,
  icon,
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200';

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary: 'bg-bg-card text-text-primary border border-border hover:border-border-hover hover:bg-bg-card-hover',
    ghost: 'text-text-secondary hover:text-text-primary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
  };

  const classes = cn(baseClasses, variants[variant], sizes[size], className);
  const iconEl =
    icon === 'arrow' ? (
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
    ) : icon === 'external' ? (
      <ExternalLink size={14} />
    ) : null;

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn(classes, 'group')}>
        {children}
        {iconEl}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={cn(classes, 'group')}>
        {children}
        {iconEl}
      </Link>
    );
  }

  return (
    <button className={cn(classes, 'group')} type="button">
      {children}
      {iconEl}
    </button>
  );
}
