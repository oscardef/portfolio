import { clsx, type ClassValue } from 'clsx';

// Minimal utility – no need for tailwind-merge in most cases
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const startStr = startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });

  if (end === 'present') {
    return `${startStr} — Present`;
  }

  const endDate = new Date(end);
  const endStr = endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });

  return `${startStr} — ${endStr}`;
}
