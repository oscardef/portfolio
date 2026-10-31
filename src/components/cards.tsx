import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ChevronRight, GraduationCap } from 'lucide-react';
import type { JourneyItem } from '@/lib/journey';
import { cn } from '@/lib/utils';

/**
 * Cards for projects, roles and studies, shared by the home page and the
 * /projects and /experience pages. Links open the item as a sheet.
 */

const surface =
  'border border-border bg-bg-card transition-colors hover:border-border-hover hover:bg-bg-card-hover';

function Where({ item }: { item: JourneyItem }) {
  return (
    <p className="tnum flex items-center gap-2 text-sm text-text-muted" style={{ '--h': item.hue ?? 0 } as CSSProperties}>
      {item.hue !== null && <span aria-hidden="true" className="hue-bg size-2 rounded-full" />}
      {[item.place, item.period].filter(Boolean).join(', ')}
    </p>
  );
}

export function Stack({ items, max = 5 }: { items: string[]; max?: number }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Built with">
      {items.slice(0, max).map((s) => (
        <li key={s} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-secondary">
          {s}
        </li>
      ))}
    </ul>
  );
}

export function ProjectCard({ item, priority = false }: { item: JourneyItem; priority?: boolean }) {
  return (
    <Link href={item.href!} scroll={false} className={cn(surface, 'group flex h-full flex-col overflow-hidden rounded-3xl')}>
      {item.image && (
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-bg-secondary">
          <Image
            src={item.image.src}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 34rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <Where item={item} />
        <h3 className="mt-2 text-xl font-semibold tracking-tight">{item.name}</h3>
        {item.detail && <p className="text-sm text-text-muted">{item.detail}</p>}
        <p className="mt-3 line-clamp-3 leading-relaxed text-text-secondary">{item.blurb}</p>
        <div className="mt-auto pt-5">
          <Stack items={item.stack} max={4} />
        </div>
      </div>
    </Link>
  );
}

export function Logo({ item, large = false }: { item: JourneyItem; large?: boolean }) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl bg-white',
        large ? 'h-14 w-20 px-2.5' : 'h-11 w-[4.25rem] px-2'
      )}
    >
      {item.logo ? (
        <Image
          src={item.logo}
          alt=""
          width={64}
          height={36}
          className={cn('h-auto w-full object-contain', large ? 'max-h-9' : 'max-h-7')}
        />
      ) : (
        <span className="text-lg font-semibold text-slate-900">{item.name.charAt(0)}</span>
      )}
    </div>
  );
}

// One line per role: logo, role, company, dates
export function RoleRow({ item }: { item: JourneyItem }) {
  return (
    <Link href={item.href!} scroll={false} className={cn(surface, 'group flex items-center gap-4 rounded-2xl p-3.5 pr-4 sm:p-4')}>
      <Logo item={item} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="min-w-0 font-semibold leading-snug">
            {item.detail}
            <span className="font-normal text-text-muted"> at {item.name}</span>
          </p>
          <span className="tnum hidden shrink-0 text-sm text-text-muted sm:block">{item.period}</span>
        </div>
        <p className="text-sm text-text-muted">
          {item.place}
          <span className="tnum sm:hidden">, {item.period}</span>
        </p>
      </div>
      <ChevronRight
        size={18}
        aria-hidden="true"
        className="hidden shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary sm:block"
      />
    </Link>
  );
}

// A role with its summary and main highlights, for the experience page
export function RoleCard({ item }: { item: JourneyItem }) {
  return (
    <Link href={item.href!} scroll={false} className={cn(surface, 'group block rounded-3xl p-6 sm:p-7')}>
      <div className="flex flex-col gap-5 sm:flex-row">
        <Logo item={item} large />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{item.detail}</h3>
              <p className="text-text-secondary">{item.name}</p>
            </div>
            <p className="tnum text-sm text-text-muted sm:text-right">
              {item.period}
              <br className="hidden sm:block" />
              <span className="sm:hidden">, </span>
              {item.place}
            </p>
          </div>
          <p className="mt-4 leading-relaxed text-text-secondary">{item.summary}</p>
          {item.highlights.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {item.highlights.slice(0, 3).map((h) => (
                <li key={h} className="flex gap-2.5 text-[0.9375rem] leading-relaxed text-text-secondary">
                  <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent" />
                  {h}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 flex items-center justify-between gap-4">
            <Stack items={item.stack} />
            <span className="hidden shrink-0 items-center gap-1 text-sm text-text-muted transition-colors group-hover:text-text-primary sm:flex">
              Read more
              <ChevronRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function StudyCard({ item }: { item: JourneyItem }) {
  return (
    <div className="flex gap-4 rounded-3xl border border-dashed border-border p-6">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-muted text-accent-light">
        <GraduationCap size={22} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>
        <p className="text-text-secondary">{item.detail}</p>
        <p className="tnum mt-0.5 text-sm text-text-muted">
          {item.period}, {item.place}
        </p>
        <p className="mt-3 leading-relaxed text-text-secondary">{item.blurb}</p>
      </div>
    </div>
  );
}
