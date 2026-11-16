'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * The row of logos under the hero: where I've worked and studied. With a
 * mouse, the logo pointed at brightens; on a phone, a tap does the same
 * (and a second tap, or a tap on another logo, lets it go).
 */

export interface Org {
  name: string;
  logo: string;
  width: number;
  height: number;
}

export function OrgStrip({ items }: { items: Org[] }) {
  const [lit, setLit] = useState<number | null>(null);

  return (
    <ul className="mt-6 grid grid-cols-2 items-center gap-x-4 gap-y-2 sm:mt-7 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-14 sm:gap-y-7">
      {items.map((org, i) => (
        <li
          key={org.name}
          title={org.name}
          onClick={() => setLit(lit === i ? null : i)}
          className={cn(
            'flex h-12 items-center justify-center [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] sm:h-auto',
            // On a phone's two-column grid, the odd one out sits in the middle
            i === items.length - 1 && items.length % 2 === 1 && 'col-span-2'
          )}
        >
          <Image
            src={org.logo}
            alt={org.name}
            width={org.width}
            height={org.height}
            draggable={false}
            className={cn(
              'select-none object-contain brightness-0 invert transition-opacity duration-300 hover:opacity-100 [[data-theme=light]_&]:invert-0',
              lit === i ? 'opacity-100' : 'opacity-60'
            )}
            style={{ height: org.height * 0.85, width: 'auto', maxWidth: '100%' }}
          />
        </li>
      ))}
    </ul>
  );
}
