import Link from 'next/link';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface CardLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * Accessible clickable card wrapper.
 * Uses a single <a> that covers the entire card surface.
 * Any internal interactive elements should use `relative z-10` and stopPropagation.
 */
export function CardLink({ href, children, className }: CardLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-xl border border-border bg-bg-card p-6',
        'transition-all duration-200',
        'hover:border-border-hover hover:bg-bg-card-hover hover:shadow-lg hover:shadow-accent/5',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className
      )}
    >
      {children}
    </Link>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-bg-card p-6', className)}
    >
      {children}
    </div>
  );
}
