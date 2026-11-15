'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap, MapPin } from 'lucide-react';
import type { JourneyChapter, JourneyItem } from '@/lib/journey';
import type { GlobeData, GlobeTrip } from '@/lib/globe-data';
import { cn } from '@/lib/utils';

// The globe's code and map data load only when the section comes near
const Globe = dynamic(() => import('./globe/globe').then((m) => m.Globe), { ssr: false });

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const inWords = (n: number) => WORDS[n] ?? String(n);
const typeOf = (item: JourneyItem) => item.type;

// Where the globe's column sticks, in px from the top of the viewport (lg:top-20)
const STICKY_TOP = 80;

// How long a side trip's row must be rested on (scrolling) or pointed at
// (hovering) before the globe flies out to it, in ms
const TRIP_DWELL = 500;
const TRIP_HOVER = 220;

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

  // A side trip shows on the globe when its row rests in the middle of the
  // screen for a moment; rows scrolled straight past leave the globe alone
  useEffect(() => {
    const beats = sectionRef.current?.querySelectorAll<HTMLElement>('[data-beat]') ?? [];
    let pending: Element | null = null;
    let timer = 0;
    const cancel = () => {
      window.clearTimeout(timer);
      pending = null;
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            if (entry.target === pending) cancel();
            continue;
          }
          cancel();
          const trip = (entry.target as HTMLElement).dataset.trip;
          if (trip === undefined) {
            setScrollTrip(null);
          } else {
            pending = entry.target;
            timer = window.setTimeout(() => setScrollTrip(Number(trip)), TRIP_DWELL);
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    beats.forEach((el) => observer.observe(el));
    return () => {
      cancel();
      observer.disconnect();
    };
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
      // Above the first chapter the whole route shows, however the page got
      // here (a jump from the menu doesn't pass the intro through the middle)
      const first = chapterRefs.current[0];
      if (first && first.getBoundingClientRect().top > window.innerHeight / 2) setActive(-1);
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
    <section id="route" ref={sectionRef} aria-labelledby="route-title" className="section relative">
      <div className="container-page text-left lg:text-center">
        <h2 id="route-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
          The route
        </h2>
        <p className="mt-4 max-w-[56ch] text-lg text-text-secondary lg:mx-auto">
          Everywhere I’ve lived: {inWords(cities)} cities in {inWords(countries)} countries so far. Scroll to
          follow it from one home to the next, with what I studied, built and worked on in each.
        </p>
      </div>

      <div
        ref={gridRef}
        className="container-page mt-8 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14"
      >
        {/* The globe stays in view while the chapters scroll past */}
        <div
          ref={columnRef}
          className="sticky top-16 z-20 -mx-[var(--gutter)] bg-bg lg:top-20 lg:mx-0 lg:self-start lg:bg-transparent"
        >
          {/* On small screens the chapters slide under the globe; a short fade softens the edge
              (a solid panel scrolls more smoothly on phones than a blurred one) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-full h-5 bg-gradient-to-b from-bg to-transparent lg:hidden"
          />
          <div ref={stageRef} className="will-change-transform">
            <div className="relative h-[36vh] lg:-mx-[14%] lg:h-[calc(100vh-9rem)]">
              {/* A faint disc marks where the globe appears while its code loads */}
              {!near && (
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 aspect-square h-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/60 bg-bg-card/40"
                />
              )}
              {near && (
                <Globe data={globe} mode="route" active={active} detour={detour} className="absolute inset-0" />
              )}
              {/* Once the globe has settled, lines heading off-screen fade out before the chapters */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 hidden w-[30%] bg-[linear-gradient(to_right,transparent,var(--bg)_70%)] lg:block lg:opacity-[var(--settled,0)]"
              />
            </div>
            <StopRail chapters={chapters} active={active} refs={chapterRefs} />
          </div>
        </div>

        <div className="lg:relative lg:z-30">
          {/* The intro stretch: the whole route stays up while the globe settles */}
          <div
            ref={introRef}
            data-index={-1}
            className="flex h-[24vh] items-end pb-10 lg:h-[64vh] lg:pb-[16vh]"
          >
            <p className="max-w-[40ch] text-text-muted lg:[opacity:calc((var(--settled,1)-0.75)*4)]">
              Every place I’ve lived, in order, from Bangkok in 2003 to Basel today. Keep scrolling to go
              place by place.
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
    <div className="flex items-center justify-between gap-4 px-[var(--gutter)] pb-3 pt-1 lg:px-0 lg:pb-0 lg:pt-4 lg:opacity-[var(--settled,1)]">
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
      <ol className="flex shrink-0 items-center gap-1.5" aria-label="Places I’ve lived, in order">
        {chapters.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              aria-label={`${c.place}, ${c.years}`}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="group flex h-6 items-center"
            >
              <span
                className={cn(
                  'block h-2 rounded-full transition-all duration-500 ease-out',
                  i === active
                    ? 'w-6 bg-accent-light'
                    : 'w-2 bg-text-muted group-hover:bg-text-primary',
                  i !== active && (active >= 0 && i > active ? 'opacity-35' : 'opacity-80')
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
        brief ? 'pb-14 lg:min-h-[48vh]' : 'pb-20 lg:pb-28',
        last && 'pb-0 lg:min-h-0 lg:pb-0'
      )}
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
          sizes="(min-width: 1280px) 720px, (min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="tnum text-sm text-white/80">
            {chapter.country}, {chapter.years}
            {chapter.ages && <span className="text-white/60">· {chapter.ages}</span>}
          </p>
          <h3
            id={`place-${chapter.id}-title`}
            className="place-name mt-1 text-[2.75rem] leading-none text-white sm:text-[3.25rem]"
          >
            {chapter.place}
          </h3>
        </figcaption>
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
  'group flex items-center gap-4 rounded-2xl border border-border bg-bg-card p-3.5 pr-4 transition-colors duration-300 hover:border-border-hover hover:bg-bg-card-hover sm:p-4';

function RoleRow({
  item,
  trip,
  onTrip,
}: {
  item: JourneyItem;
  trip: number | null;
  onTrip: (trip: number | null) => void;
}) {
  // Pointing at a side trip flies the globe out to it, but only once the
  // pointer has settled: a cursor passing over while scrolling doesn't count
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const show = (delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onTrip(trip), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    onTrip(null);
  };
  const hover =
    trip === null
      ? {}
      : { onMouseEnter: () => show(TRIP_HOVER), onMouseLeave: hide, onFocus: () => show(0), onBlur: hide };
  return (
    <Link href={item.href!} scroll={false} className={rowClass} {...hover}>
      <LogoTile item={item} />
      <RowText item={item} away={trip !== null} />
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
      <LogoTile item={item} />
      <RowText item={item} />
    </div>
  );
}

// The organisation's logo on a white tile, so logos drawn for light pages stay legible
function LogoTile({ item }: { item: JourneyItem }) {
  if (!item.logo) {
    return (
      <div className="flex h-11 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-muted text-accent-light sm:w-[4.25rem]">
        {item.type === 'study' ? (
          <GraduationCap size={20} aria-hidden="true" />
        ) : (
          <span className="text-lg font-semibold">{item.name.charAt(0)}</span>
        )}
      </div>
    );
  }
  return (
    <div className="flex h-11 w-12 shrink-0 items-center justify-center rounded-xl bg-white px-1.5 sm:w-[4.25rem] sm:px-2">
      <Image src={item.logo} alt="" width={56} height={32} className="h-auto max-h-8 w-full object-contain" />
    </div>
  );
}

function RowText({ item, away = false }: { item: JourneyItem; away?: boolean }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{item.name}</p>
          <p className="text-sm text-text-muted">
            {item.detail}
            {away && (
              <span className="whitespace-nowrap">
                {' '}
                in <MapPin size={12} aria-hidden="true" className="mb-0.5 inline text-accent-light" /> {item.place}
              </span>
            )}
            <span className="tnum sm:hidden">, {item.period}</span>
          </p>
        </div>
        <span className="tnum hidden shrink-0 pt-0.5 text-sm text-text-muted sm:block">{item.period}</span>
      </div>
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
        className="mt-3 flex snap-x snap-proximity gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={fade ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
      >
        {items.map((item) => (
          <li key={item.id} className="w-[80%] shrink-0 snap-start sm:w-[17.5rem]">
            <Link
              href={item.href!}
              scroll={false}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-card transition-colors duration-300 hover:border-border-hover hover:bg-bg-card-hover"
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
