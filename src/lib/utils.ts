import { clsx, type ClassValue } from 'clsx';

// Minimal utility – no need for tailwind-merge in most cases
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
