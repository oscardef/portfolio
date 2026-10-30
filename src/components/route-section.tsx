'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap, Plane } from 'lucide-react';
import type { JourneyChapter, JourneyItem } from '@/lib/journey';
import type { GlobeData, GlobeTrip } from '@/lib/globe-data';
import { cn } from '@/lib/utils';

// The globe's code and map data load only when the section comes near
const Globe = dynamic(() => import('./globe/globe').then((m) => m.Globe), { ssr: false });

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const inWords = (n: number) => WORDS[n] ?? String(n);
const typeOf = (item: JourneyItem) => item.id.split('-')[0];

// Where the globe's column sticks, in px from the top of the viewport (lg:top-20)
const STICKY_TOP = 80;

export function RouteSection({ chapters, globe }: { chapters: JourneyChapter[]; globe: GlobeData }) {
  const [active, setActive] = useState(-1);
  const [near, setNear] = useState(false);
  // A side trip in view (from scrolling) or pointed at (hover/focus)
  const [scrollTrip, setScrollTrip] = useState<number | null>(null);
  const [hoverTrip, setHoverTrip] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  const trip = hoverTrip ?? scrollTrip;
  const detour = trip !== null && globe.trips[trip]?.from === active ? trip : null;

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

  // The chapter crossing the middle of the screen is the one in focus;
  // the intro stretch above the first chapter keeps the whole route in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    if (introRef.current) observer.observe(introRef.current);
    chapterRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const beats = sectionRef.current?.querySelectorAll<HTMLElement>('[data-beat]') ?? [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const trip = (entry.target as HTMLElement).dataset.trip;
          setScrollTrip(trip === undefined ? null : Number(trip));
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    beats.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // On wide screens the globe starts centred under the heading and slides
  // left into its column as the intro stretch scrolls past
  useEffect(() => {
    const grid = gridRef.current!;
    const column = columnRef.current!;
    const stage = stageRef.current!;
    const intro = introRef.current!;
    const wide = window.matchMedia('(min-width: 1024px)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let shift = 0;
    let frame = 0;

    const measure = () => {
      const g = grid.getBoundingClientRect();
      const c = column.getBoundingClientRect();
      shift = wide.matches ? g.left + g.width / 2 - (c.left + c.width / 2) : 0;
    };

    const update = () => {
      frame = 0;
      let p = 1;
      if (wide.matches && !motion.matches) {
        const r = intro.getBoundingClientRect();
        p = Math.min(1, Math.max(0, (STICKY_TOP + 40 - r.top) / (r.height * 0.6)));
      }
      const k = p * p * (3 - 2 * p); // smoothstep
      stage.style.transform = `translateX(${(shift * (1 - k)).toFixed(1)}px)`;
      grid.style.setProperty('--settled', k.toFixed(3));
      stage.style.setProperty('--globe-boost', (0.22 * (1 - k)).toFixed(3));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    wide.addEventListener('change', onResize);
    motion.addEventListener('change', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      wide.removeEventListener('change', onResize);
      motion.removeEventListener('change', onResize);
    };
  }, []);

  return (
    <section id="route" ref={sectionRef} aria-labelledby="route-title" className="relative pt-24 md:pt-32">
      <div className="container-page text-left lg:text-center">
        <h2 id="route-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
          The route
        </h2>
        <p className="mt-4 max-w-[54ch] text-lg text-text-secondary lg:mx-auto">
          {inWords(cities).replace(/^./, (c) => c.toUpperCase())} cities in {inWords(countries)} countries so
          far, and what I did in each. Scroll to follow it place by place; open anything to read more.
        </p>
      </div>

      <div
        ref={gridRef}
        className="container-page mt-8 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14"
      >
        {/* The globe stays in view while the chapters scroll past */}
        <div
          ref={columnRef}
          className="sticky top-16 z-20 -mx-[clamp(1.25rem,6vw,5.5rem)] bg-bg/90 backdrop-blur-md lg:top-20 lg:mx-0 lg:self-start lg:bg-transparent lg:backdrop-blur-none"
        >
          <div ref={stageRef} className="will-change-transform">
            <div className="relative h-[36vh] lg:-mx-[14%] lg:h-[calc(100vh-9rem)]">
              {near && (
                <Globe data={globe} mode="route" active={active} detour={detour} className="absolute inset-0" />
              )}
            </div>
            <StopRail chapters={chapters} active={active} refs={chapterRefs} />
          </div>
        </div>

        <div className="lg:relative lg:z-30">
          {/* The intro stretch: the whole route stays up while the globe settles */}
          <div
            ref={introRef}
            data-index={-1}
            className="flex h-[28vh] items-end pb-10 lg:h-[105vh] lg:pb-[30vh]"
          >
            <p className="max-w-[40ch] text-text-muted lg:[opacity:calc((var(--settled,1)-0.75)*4)]">
              The whole route, from Bangkok in 2003 to Basel today. Keep scrolling to go place by place.
            </p>
          </div>
          {chapters.map((chapter, i) => (
            <Chapter
              key={chapter.id}
              chapter={chapter}
              index={i}
              last={i === chapters.length - 1}
              trips={globe.trips}
              onTrip={setHoverTrip}
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
  refs: RefObject<(HTMLElement | null)[]>;
}) {
  const current = chapters[active];
  return (
    <div className="flex items-center justify-between gap-4 px-[clamp(1.25rem,6vw,5.5rem)] pb-3 pt-1 lg:px-0 lg:pb-0 lg:pt-4 lg:opacity-[var(--settled,1)]">
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
  last: boolean;
  trips: GlobeTrip[];
  onTrip: (trip: number | null) => void;
  ref: (el: HTMLElement | null) => void;
}

function Chapter({ chapter, index, last, trips, onTrip, ref }: ChapterProps) {
  const byDate = (a: JourneyItem, b: JourneyItem) => a.sortKey - b.sortKey;
  const studies = chapter.items.filter((i) => typeOf(i) === 'study');
  const roles = chapter.items.filter((i) => typeOf(i) === 'experience').sort(byDate);
  const projects = chapter.items.filter((i) => typeOf(i) === 'project').sort(byDate);
  const brief = chapter.items.length === 0;

  return (
    <article
      ref={ref}
      data-index={index}
      id={`place-${chapter.id}`}
      aria-labelledby={`place-${chapter.id}-title`}
      className={cn(
        'scroll-mt-[calc(36vh+5rem)] lg:scroll-mt-24',
        brief ? 'pb-16 lg:min-h-[62vh]' : 'pb-20 lg:pb-28',
        last && 'pb-24 lg:min-h-0 lg:pb-32'
      )}
      style={{ '--h': chapter.hue } as CSSProperties}
    >
      <figure
        data-beat
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border bg-bg-card',
          brief ? 'aspect-[5/2]' : 'aspect-[2/1]'
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
        <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="tnum flex items-center gap-2 text-sm text-white/80">
            <span className="hue-bg size-2 rounded-full" aria-hidden="true" />
            {chapter.country}, {chapter.years}
          </p>
          <h3
            id={`place-${chapter.id}-title`}
            className="place-name mt-1 text-[2.75rem] leading-none text-white sm:text-[3.25rem]"
          >
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

      <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-text-secondary">{chapter.note}</p>

      {(studies.length > 0 || roles.length > 0) && (
        <ul className="mt-6 space-y-2.5">
          {studies.map((item) => (
            <li key={item.id} data-beat>
              <StudyRow item={item} />
            </li>
          ))}
          {roles.map((item) => {
            // A role somewhere other than this chapter's place is a side trip
            const trip = item.place === chapter.place ? -1 : trips.findIndex((t) => t.place === item.place);
            return (
              <li key={item.id} data-beat {...(trip >= 0 ? { 'data-trip': trip } : {})}>
                <RoleRow item={item} trip={trip >= 0 ? trip : null} onTrip={onTrip} />
              </li>
            );
          })}
        </ul>
      )}

      {projects.length > 0 && (
        <div data-beat>
          <ProjectStrip items={projects} place={chapter.place} />
        </div>
      )}
    </article>
  );
}

const rowClass =
  'group flex items-center gap-4 rounded-2xl border border-border bg-bg-card p-3.5 pr-4 transition-colors hover:border-border-hover hover:bg-bg-card-hover sm:p-4';

function RoleRow({
  item,
  trip,
  onTrip,
}: {
  item: JourneyItem;
  trip: number | null;
  onTrip: (trip: number | null) => void;
}) {
  const hover =
    trip === null
      ? {}
      : {
          onMouseEnter: () => onTrip(trip),
          onMouseLeave: () => onTrip(null),
          onFocus: () => onTrip(trip),
          onBlur: () => onTrip(null),
        };
  return (
    <Link href={item.href!} scroll={false} className={rowClass} {...hover}>
      <div className="flex h-11 w-12 shrink-0 items-center justify-center rounded-xl bg-white px-1.5 sm:w-[4.25rem] sm:px-2">
        {item.logo ? (
          <Image src={item.logo} alt="" width={56} height={32} className="h-auto max-h-7 w-full object-contain" />
        ) : (
          <span className="text-lg font-semibold text-slate-900">{item.name.charAt(0)}</span>
        )}
      </div>
      <RowText item={item}>
        {trip !== null && (
          <p className="hue mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium">
            <Plane size={13} aria-hidden="true" />
            Side trip to {item.place}
          </p>
        )}
      </RowText>
      <ChevronRight
        size={18}
        aria-hidden="true"
        className="hidden shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary sm:block"
      />
    </Link>
  );
}

function StudyRow({ item }: { item: JourneyItem }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-dashed border-border p-3.5 pr-4 sm:p-4">
      <div className="flex h-11 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-muted sm:w-[4.25rem] text-accent-light">
        <GraduationCap size={20} aria-hidden="true" />
      </div>
      <RowText item={item} />
    </div>
  );
}

function RowText({ item, children }: { item: JourneyItem; children?: React.ReactNode }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{item.name}</p>
          <p className="text-sm text-text-muted">
            {item.detail}
            <span className="tnum sm:hidden">, {item.period}</span>
          </p>
        </div>
        <span className="tnum hidden shrink-0 pt-0.5 text-sm text-text-muted sm:block">{item.period}</span>
      </div>
      {children}
      <p className="mt-1.5 line-clamp-2 text-[0.9375rem] leading-snug text-text-secondary">{item.blurb}</p>
    </div>
  );
}

// Projects in a row you can swipe or step through, instead of a long stack
function ProjectStrip({ items, place }: { items: JourneyItem[]; place: string }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: items.length <= 1 });

  useEffect(() => {
    const list = listRef.current!;
    const update = () => {
      const max = list.scrollWidth - list.clientWidth;
      setEdges({ start: list.scrollLeft <= 4, end: list.scrollLeft >= max - 4 });
    };
    update();
    list.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      list.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  function step(direction: 1 | -1) {
    const list = listRef.current!;
    const card = list.querySelector('li');
    const distance = card ? card.getBoundingClientRect().width + 16 : list.clientWidth * 0.8;
    list.scrollBy({ left: direction * distance, behavior: 'smooth' });
  }

  const fade =
    edges.start && edges.end
      ? undefined
      : `linear-gradient(to right, ${edges.start ? '#000' : 'transparent'}, #000 6%, #000 88%, ${edges.end ? '#000' : 'transparent'})`;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-medium text-text-muted">
          Projects in {place} <span className="tnum">({items.length})</span>
        </h4>
        {items.length > 1 && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={edges.start}
              aria-label="Previous projects"
              className="flex size-8 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary disabled:opacity-30"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={edges.end}
              aria-label="Next projects"
              className="flex size-8 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary disabled:opacity-30"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <ul
        ref={listRef}
        className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={fade ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
      >
        {items.map((item) => (
          <li key={item.id} className="w-[80%] shrink-0 snap-start sm:w-[17.5rem]">
            <Link
              href={item.href!}
              scroll={false}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-card transition-colors hover:border-border-hover hover:bg-bg-card-hover"
            >
              {item.image && (
                <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-bg-secondary">
                  <Image
                    src={item.image.src}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 280px, 80vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h5 className="font-semibold leading-snug">{item.name}</h5>
                  <span className="tnum shrink-0 text-xs text-text-muted">{item.period}</span>
                </div>
                <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-text-secondary">{item.blurb}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
