'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { GraduationCap } from 'lucide-react';
import type { JourneyChapter, JourneyItem } from '@/lib/journey';
import type { GlobeData } from '@/lib/globe-data';
import { cn } from '@/lib/utils';

// The globe's code and map data load only when the section comes near
const Globe = dynamic(() => import('./globe/globe').then((m) => m.Globe), { ssr: false });

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const inWords = (n: number) => WORDS[n] ?? String(n);

const ORDER: Record<string, number> = { study: 0, experience: 1, project: 2 };
const typeOf = (item: JourneyItem) => item.id.split('-')[0];

export function RouteSection({ chapters, globe }: { chapters: JourneyChapter[]; globe: GlobeData }) {
  const [active, setActive] = useState(-1);
  const [near, setNear] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const introRef = useRef<HTMLDivElement>(null);

  const cities = new Set(chapters.map((c) => c.place)).size;
  const countries = new Set(chapters.map((c) => c.country)).size;

  // Load the globe a screen before it's needed
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), {
      rootMargin: '100% 0px',
    });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // The chapter crossing the middle of the screen is the one in focus
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    if (introRef.current) observer.observe(introRef.current);
    chapterRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="route" ref={sectionRef} aria-labelledby="route-title" className="relative py-24 md:py-32">
      <div className="container-page">
        <h2 id="route-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
          The route
        </h2>
        <p className="mt-4 max-w-[54ch] text-lg text-text-secondary">
          {inWords(cities).replace(/^./, (c) => c.toUpperCase())} cities in {inWords(countries)} countries so
          far, and what I did in each. Scroll to follow the route; open anything to read more.
        </p>
      </div>

      <div className="container-page mt-10 lg:mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
        {/* The globe stays in view while the chapters scroll past */}
        <div className="sticky top-14 z-20 -mx-[clamp(1.25rem,6vw,5.5rem)] bg-bg/90 backdrop-blur-md lg:top-20 lg:mx-0 lg:self-start lg:bg-transparent lg:backdrop-blur-none">
          <div className="relative h-[38vh] lg:h-[calc(100vh-9rem)]">
            {near && <Globe data={globe} mode="route" active={active} className="absolute inset-0" />}
          </div>
          <StopRail chapters={chapters} active={active} refs={chapterRefs} />
        </div>

        <div className="pt-8 lg:pt-0">
          <div ref={introRef} data-index={-1} className="flex min-h-[30vh] items-start lg:min-h-[45vh]">
            <p className="max-w-[44ch] text-text-muted">
              The whole route, from Bangkok in 2003 to Basel today. Keep scrolling to go place by place.
            </p>
          </div>
          {chapters.map((chapter, i) => (
            <Chapter
              key={chapter.id}
              chapter={chapter}
              index={i}
              ref={(el) => {
                chapterRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// A row of stops under the globe: where you are on the route, and a way to jump
function StopRail({
  chapters,
  active,
  refs,
}: {
  chapters: JourneyChapter[];
  active: number;
  refs: React.RefObject<(HTMLElement | null)[]>;
}) {
  const current = chapters[active];
  return (
    <div className="flex items-center justify-between gap-4 px-[clamp(1.25rem,6vw,5.5rem)] pb-3 pt-1 lg:px-0 lg:pb-0 lg:pt-4">
      <p className="min-w-0 truncate text-sm text-text-secondary" aria-live="polite">
        {current ? (
          <>
            <span className="place-name text-lg text-text-primary">{current.place}</span>{' '}
            <span className="tnum">{current.years}</span>
          </>
        ) : (
          <span className="tnum">2003 to today</span>
        )}
      </p>
      <ol className="flex shrink-0 items-center gap-1.5" aria-label="Places on the route">
        {chapters.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              aria-label={`${c.place}, ${c.years}`}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="group flex h-6 items-center"
              style={{ '--h': c.hue } as CSSProperties}
            >
              <span
                className={cn(
                  'hue-bg block rounded-full transition-all duration-300',
                  i === active ? 'h-2.5 w-6' : 'size-2 opacity-50 group-hover:opacity-100',
                  active >= 0 && i > active && 'opacity-25'
                )}
              />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

interface ChapterProps {
  chapter: JourneyChapter;
  index: number;
  ref: (el: HTMLElement | null) => void;
}

function Chapter({ chapter, index, ref }: ChapterProps) {
  const items = [...chapter.items].sort(
    (a, b) => ORDER[typeOf(a)] - ORDER[typeOf(b)] || a.sortKey - b.sortKey
  );
  const brief = items.length === 0;

  return (
    <article
      ref={ref}
      data-index={index}
      id={`place-${chapter.id}`}
      aria-labelledby={`place-${chapter.id}-title`}
      className={cn('scroll-mt-[calc(38vh+4rem)] lg:scroll-mt-24', brief ? 'pb-20 lg:min-h-[70vh]' : 'pb-24 lg:pb-32')}
      style={{ '--h': chapter.hue } as CSSProperties}
    >
      <figure
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border bg-bg-card',
          brief ? 'aspect-[16/8]' : 'aspect-[16/10]'
        )}
      >
        <Image
          src={chapter.photo.src}
          alt={chapter.photo.alt}
          fill
          sizes="(min-width: 1280px) 620px, (min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <p className="tnum flex items-center gap-2 text-sm text-white/80">
            <span className="hue-bg size-2 rounded-full" aria-hidden="true" />
            {chapter.country}, {chapter.years}
          </p>
          <h3 id={`place-${chapter.id}-title`} className="place-name mt-1 text-5xl leading-none text-white sm:text-6xl">
            {chapter.place}
          </h3>
        </figcaption>
        <a
          href={chapter.photo.href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2.5 top-2.5 rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] text-white/75 backdrop-blur hover:text-white"
        >
          Photo: {chapter.photo.credit}
        </a>
      </figure>

      <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-text-secondary">{chapter.note}</p>

      {items.length > 0 && (
        <ul className="mt-8 space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              {typeOf(item) === 'project' ? (
                <ProjectCard item={item} />
              ) : typeOf(item) === 'experience' ? (
                <RoleCard item={item} />
              ) : (
                <StudyCard item={item} />
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

const cardClass =
  'group block rounded-2xl border border-border bg-bg-card transition-colors hover:border-border-hover hover:bg-bg-card-hover';

function ProjectCard({ item }: { item: JourneyItem }) {
  return (
    <Link href={item.href!} scroll={false} className={cn(cardClass, 'overflow-hidden')}>
      {item.image && (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-bg-secondary">
          <Image
            src={item.image.src}
            alt=""
            fill
            sizes="(min-width: 1280px) 620px, (min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h4 className="text-xl font-semibold tracking-tight">{item.name}</h4>
          <span className="tnum shrink-0 text-sm text-text-muted">{item.period}</span>
        </div>
        {item.detail && <p className="mt-0.5 text-sm text-text-muted">{item.detail}</p>}
        <p className="mt-3 leading-relaxed text-text-secondary">{item.blurb}</p>
        {item.stack.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Built with">
            {item.stack.slice(0, 5).map((s) => (
              <li key={s} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-secondary">
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}

function RoleCard({ item }: { item: JourneyItem }) {
  return (
    <Link href={item.href!} scroll={false} className={cn(cardClass, 'flex gap-4 p-5 sm:p-6')}>
      <div className="flex h-12 w-[4.75rem] shrink-0 items-center justify-center rounded-xl bg-white px-2.5">
        {item.logo ? (
          <Image src={item.logo} alt="" width={40} height={40} className="h-full w-full object-contain" />
        ) : (
          <span className="text-lg font-semibold text-slate-900">{item.name.charAt(0)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <h4 className="text-lg font-semibold tracking-tight">
            {item.name}
            <span className="font-normal text-text-muted"> · {item.place}</span>
          </h4>
          <span className="tnum hidden shrink-0 text-sm text-text-muted sm:block">{item.period}</span>
        </div>
        <p className="text-sm text-text-muted">
          {item.detail}
          <span className="tnum sm:hidden">, {item.period}</span>
        </p>
        <p className="mt-2.5 leading-relaxed text-text-secondary">{item.blurb}</p>
      </div>
    </Link>
  );
}

function StudyCard({ item }: { item: JourneyItem }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-dashed border-border p-5 sm:p-6">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-muted text-accent-light">
        <GraduationCap size={22} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <h4 className="text-lg font-semibold tracking-tight">{item.name}</h4>
          <span className="tnum shrink-0 text-sm text-text-muted">{item.period}</span>
        </div>
        <p className="text-sm text-text-muted">{item.detail}</p>
        <p className="mt-2.5 leading-relaxed text-text-secondary">{item.blurb}</p>
      </div>
    </div>
  );
}
