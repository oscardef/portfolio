import { getAllExperiences, getAllProjects } from './content';
import type { Kind } from './schemas';
import { route, studyItems, hueOf, formatYears, type PlacePhoto } from '@/data/route';

export interface JourneyItem {
  id: string;
  name: string;
  detail: string;
  place: string;
  hue: number;
  period: string;
  sortKey: number;
  blurb: string;
  kind: Kind;
  chapter: string;
  href?: string;
  image?: { src: string; alt: string };
  logo?: string;
  stack: string[];
  featured: boolean;
}

export interface JourneyChapter {
  id: string;
  place: string;
  country: string;
  years: string;
  note: string;
  hue: number;
  photo: PlacePhoto;
  items: JourneyItem[];
}

export interface KindGroup {
  kind: Kind;
  title: string;
  items: JourneyItem[];
}

const KIND_TITLES: Record<Kind, string> = {
  systems: 'Systems and infrastructure',
  ml: 'Machine learning and research',
  hardware: 'Hardware and robotics',
  products: 'Products and platforms',
  teaching: 'Teaching',
  study: 'Study',
};

const KIND_ORDER: Kind[] = ['systems', 'ml', 'hardware', 'products', 'teaching', 'study'];

const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' });

function monthYear(date: string): { month: string; year: number } {
  const d = new Date(`${date.length === 7 ? `${date}-01` : date}T00:00:00Z`);
  return { month: MONTH.format(d), year: d.getUTCFullYear() };
}

// "Feb–Sep 2023", or "Apr 2023 – Jul 2024" across years
function period(start: string, end: string): string {
  const a = monthYear(start);
  const b = monthYear(end);
  if (a.year === b.year) return a.month === b.month ? `${a.month} ${a.year}` : `${a.month}–${b.month} ${a.year}`;
  return `${a.month} ${a.year} – ${b.month} ${b.year}`;
}

function city(location: string | undefined, fallback: string): string {
  return location?.split(',')[0]?.trim() || fallback;
}

export async function getJourney(): Promise<{ chapters: JourneyChapter[]; groups: KindGroup[] }> {
  const [projects, experiences] = await Promise.all([getAllProjects(), getAllExperiences()]);
  const placeOf = (chapter: string) => route.find((s) => s.id === chapter)?.place ?? '';

  const items: JourneyItem[] = [
    ...experiences
      .filter((e) => e.chapter)
      .map((e) => ({
        id: `experience-${e.slug}`,
        name: e.organization,
        detail: e.title,
        place: city(e.location, placeOf(e.chapter!)),
        hue: hueOf(e.chapter!),
        period: period(e.startDate, e.endDate),
        sortKey: Date.parse(`${e.startDate}-01`),
        blurb: e.blurb,
        kind: e.kind,
        chapter: e.chapter!,
        href: `/experience/${e.slug}`,
        logo: e.logo,
        stack: e.stack,
        featured: false,
      })),
    ...projects
      .filter((p) => p.chapter)
      .map((p) => {
        const [name, ...rest] = p.title.split(':');
        return {
          id: `project-${p.slug}`,
          name: name.trim(),
          detail: rest.join(':').trim(),
          place: city(p.location, placeOf(p.chapter!)),
          hue: hueOf(p.chapter!),
          period: String(new Date(p.date).getUTCFullYear()),
          sortKey: Date.parse(p.date),
          blurb: p.blurb,
          kind: p.kind,
          chapter: p.chapter!,
          href: `/projects/${p.slug}`,
          image: p.heroImage,
          stack: p.stack,
          featured: p.featured,
        };
      }),
    ...studyItems.map((s) => ({
      id: `study-${s.id}`,
      name: s.title,
      detail: s.org,
      place: placeOf(s.chapter),
      hue: hueOf(s.chapter),
      period: s.period,
      sortKey: Date.parse(`${s.period.slice(0, 4)}-09-01`),
      blurb: s.blurb,
      kind: 'study' as const,
      chapter: s.chapter,
      stack: [],
      featured: false,
    })),
  ];

  // By place: studies open each chapter, then everything else in order
  const chapters = route.map((stop) => ({
    id: stop.id,
    place: stop.place,
    country: stop.country,
    years: formatYears(stop.start, stop.end),
    note: stop.note,
    hue: hueOf(stop.id),
    photo: stop.photo,
    items: items
      .filter((i) => i.chapter === stop.id)
      .sort((a, b) => Number(b.kind === 'study') - Number(a.kind === 'study') || a.sortKey - b.sortKey),
  }));

  // By kind: newest first
  const groups = KIND_ORDER.map((kind) => ({
    kind,
    title: KIND_TITLES[kind],
    items: items.filter((i) => i.kind === kind).sort((a, b) => b.sortKey - a.sortKey),
  })).filter((g) => g.items.length > 0);

  return { chapters, groups };
}
