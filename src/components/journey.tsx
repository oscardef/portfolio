'use client';

import Image from 'next/image';
import Link from 'next/link';
import { startTransition, useState, ViewTransition, type CSSProperties } from 'react';
import type { JourneyChapter, JourneyItem, KindGroup } from '@/lib/journey';
import { cn } from '@/lib/utils';

type View = 'place' | 'kind';

interface JourneyProps {
  chapters: JourneyChapter[];
  groups: KindGroup[];
}

export function Journey({ chapters, groups }: JourneyProps) {
  const [view, setView] = useState<View>('place');

  const cities = new Set(chapters.map((c) => c.place)).size;
  const countries = new Set(chapters.map((c) => c.country)).size;

  function show(next: View) {
    if (next !== view) startTransition(() => setView(next));
  }

  return (
    <section id="journey" aria-labelledby="journey-title" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6 md:px-10 md:py-32">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="journey-title" className="section-title">
            The route
          </h2>
          <p className="mt-4 max-w-[52ch] text-ink-2">
            {capitalise(inWords(cities))} cities in {inWords(countries)} countries so far, and what I did in each.
            Open anything to read more.
          </p>
        </div>
        <div role="group" aria-label="Arrange by" className="flex items-center gap-3">
          <span className="text-sm text-ink-2">Arrange by</span>
          <div className="inline-flex rounded-full border border-rule p-1">
            {(['place', 'kind'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => show(v)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm transition-colors',
                  view === v ? 'bg-ink text-paper' : 'text-ink-2 hover:text-ink'
                )}
              >
                {v === 'place' ? 'Place' : 'Kind of work'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 md:mt-20">
        {view === 'place' ? <PlaceView chapters={chapters} /> : <KindView groups={groups} />}
      </div>
    </section>
  );
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

function inWords(n: number): string {
  return WORDS[n] ?? String(n);
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PlaceView({ chapters }: { chapters: JourneyChapter[] }) {
  return (
    <ol>
      {chapters.map((chapter, i) => {
        const next = chapters[i + 1];
        const last = i === chapters.length - 1;
        return (
          <li
            key={chapter.id}
            className="grid grid-cols-[1.75rem_1fr] gap-x-4 md:grid-cols-[8rem_1fr] md:gap-x-8"
            style={{ '--h': chapter.hue, '--h2': next?.hue ?? chapter.hue } as CSSProperties}
          >
            {/* The spine: one segment per chapter, shading into the next stop's colour */}
            <div className="relative">
              {!last && (
                <span
                  aria-hidden="true"
                  className="absolute left-[0.4375rem] top-4 bottom-0 w-0.5 md:left-auto md:right-[0.4375rem]"
                  style={{
                    background:
                      'linear-gradient(to bottom, oklch(var(--route-l) var(--route-c) var(--h)), oklch(var(--route-l) var(--route-c) var(--h2)))',
                  }}
                />
              )}
              <span
                aria-hidden="true"
                className="route-dot hue-bg absolute left-0.5 top-2.5 md:left-auto md:right-0.5"
              />
              <span className="tnum absolute right-7 top-1.5 hidden text-sm text-ink-2 md:block">
                {chapter.years}
              </span>
            </div>

            <div
              className={cn(
                last ? 'pb-0' : chapter.items.length > 0 ? 'pb-14 md:pb-20' : 'pb-10 md:pb-12',
                chapter.items.length === 0 && 'md:grid md:grid-cols-[minmax(0,22rem)_1fr] md:gap-x-10'
              )}
            >
              <div>
                <h3 className="place-name text-[2.25rem] leading-none md:text-[3.25rem]">{chapter.place}</h3>
                <p className="tnum mt-2 text-sm text-ink-2">
                  {chapter.country}
                  <span className="md:hidden">, {chapter.years}</span>
                </p>
              </div>
              <p className={cn('mt-3 max-w-[56ch] text-ink-2', chapter.items.length === 0 && 'md:mt-3.5')}>
                {chapter.note}
              </p>
              {chapter.items.length > 0 && (
                <ul className="mt-8">
                  {chapter.items.map((item) => (
                    <Row key={item.id} item={item} showPlace={item.place !== chapter.place} />
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function KindView({ groups }: { groups: KindGroup[] }) {
  return (
    <div className="space-y-16 md:space-y-20">
      {groups.map((group) => (
        <section key={group.kind} aria-labelledby={`kind-${group.kind}`} className="md:grid md:grid-cols-[8rem_1fr] md:gap-x-8">
          <div aria-hidden="true" />
          <div>
            <h3 id={`kind-${group.kind}`} className="text-2xl font-semibold tracking-tight">
              {group.title}
            </h3>
            <ul className="mt-6">
              {group.items.map((item) => (
                <Row key={item.id} item={item} showPlace />
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}

function Row({ item, showPlace }: { item: JourneyItem; showPlace: boolean }) {
  return (
    <ViewTransition name={item.id} default="none" share="auto">
      <li
        className="group relative grid grid-cols-1 gap-x-6 gap-y-3 border-t border-rule py-5 sm:grid-cols-[1fr_auto]"
        style={{ '--h': item.hue } as CSSProperties}
      >
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-4">
            <h4 className="text-lg font-semibold leading-snug tracking-tight">
              {item.href ? (
                <Link
                  href={item.href}
                  scroll={false}
                  className="after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:decoration-ink-3 group-hover:underline-offset-4"
                >
                  {item.name}
                </Link>
              ) : (
                item.name
              )}
            </h4>
            <span className="tnum shrink-0 text-sm text-ink-2 sm:hidden">{item.period}</span>
          </div>
          {(item.detail || showPlace) && (
            <p className="mt-0.5 text-[0.9375rem] text-ink-2">
              {item.detail}
              {showPlace && (
                <span className={cn('whitespace-nowrap', item.detail && 'ml-3')}>
                  <span aria-hidden="true" className="hue-bg mr-1.5 inline-block size-2 rounded-full align-middle" />
                  {item.place}
                </span>
              )}
            </p>
          )}
          <p className="mt-2 max-w-[60ch] text-ink-2">{item.blurb}</p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className="tnum hidden text-sm text-ink-2 sm:block">{item.period}</span>
          {item.image && (
            <Image
              src={item.image.src}
              alt=""
              width={item.featured ? 240 : 168}
              height={item.featured ? 150 : 105}
              sizes={item.featured ? '240px' : '168px'}
              className={cn(
                'rounded-[3px] border border-rule bg-paper-raised object-cover',
                item.featured ? 'h-[150px] w-[240px]' : 'h-[105px] w-[168px]'
              )}
            />
          )}
        </div>
      </li>
    </ViewTransition>
  );
}
