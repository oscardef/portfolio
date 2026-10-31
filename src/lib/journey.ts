import { getAllExperiences, getAllProjects } from './content';
import type { Experience, Project, Kind } from './schemas';
import { route, studyItems, hueOf, formatYears, type PlacePhoto } from '@/data/route';

/**
 * Projects, roles and studies as one kind of item, so the home page, the
 * route, and the /projects and /experience pages can share cards.
 */

export type ItemType = 'project' | 'experience' | 'study';

export interface JourneyItem {
  id: string;
  type: ItemType;
  slug: string;
  name: string;
  detail: string;
  place: string;
  hue: number | null;
  period: string;
  sortKey: number;
  blurb: string;
  summary: string;
  highlights: string[];
  kind: Kind;
  chapter?: string;
  href?: string;
  image?: { src: string; alt: string };
  logo?: string;
  stack: string[];
  featured: boolean;
  roleTypes: Experience['type'];
}

export interface JourneyChapter {
  id: string;
  place: string;
  country: string;
  years: string;
  // "aged 4 to 7", for the chapters before university
  ages?: string;
  note: string;
  hue: number;
  photo: PlacePhoto;
  items: JourneyItem[];
}

export const KIND_TITLES: Record<Kind, string> = {
  systems: 'Systems and infrastructure',
  ml: 'Machine learning and research',
  hardware: 'Hardware and robotics',
  products: 'Products and platforms',
  teaching: 'Teaching',
  study: 'Study',
};

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

const placeOf = (chapter?: string) => route.find((s) => s.id === chapter)?.place ?? '';

function city(location: string | undefined, chapter?: string): string {
  return location?.split(',')[0]?.trim() || placeOf(chapter);
}

function fromExperience(e: Experience): JourneyItem {
  return {
    id: `experience-${e.slug}`,
    type: 'experience',
    slug: e.slug,
    name: e.organization,
    detail: e.title,
    place: city(e.location, e.chapter),
    hue: e.chapter ? hueOf(e.chapter) : null,
    period: period(e.startDate, e.endDate),
    sortKey: Date.parse(`${e.startDate}-01`),
    blurb: e.blurb,
    summary: e.summary,
    highlights: e.highlights,
    kind: e.kind,
    chapter: e.chapter,
    href: `/experience/${e.slug}`,
    logo: e.logo,
    stack: e.stack,
    featured: false,
    roleTypes: e.type,
  };
}

function fromProject(p: Project): JourneyItem {
  const [name, ...rest] = p.title.split(':');
  return {
    id: `project-${p.slug}`,
    type: 'project',
    slug: p.slug,
    name: name.trim(),
    detail: rest.join(':').trim(),
    place: city(p.location, p.chapter),
    hue: p.chapter ? hueOf(p.chapter) : null,
    period: String(new Date(p.date).getUTCFullYear()),
    sortKey: Date.parse(p.date),
    blurb: p.blurb,
    summary: p.summary,
    highlights: p.highlights,
    kind: p.kind,
    chapter: p.chapter,
    href: `/projects/${p.slug}`,
    image: p.heroImage,
    stack: p.stack,
    featured: p.featured,
    roleTypes: [],
  };
}

const studies: JourneyItem[] = studyItems.map((s) => ({
  id: `study-${s.id}`,
  type: 'study',
  slug: s.id,
  name: s.title,
  detail: s.org,
  place: placeOf(s.chapter),
  hue: hueOf(s.chapter),
  period: s.period,
  sortKey: Date.parse(`${s.period.slice(0, 4)}-09-01`),
  blurb: s.blurb,
  summary: s.blurb,
  highlights: [],
  kind: 'study',
  chapter: s.chapter,
  stack: [],
  featured: false,
  roleTypes: [],
}));

const BORN = 2003;
const agesAt = (start: number, end: number) =>
  start === BORN ? `until age ${end - BORN}` : `aged ${start - BORN} to ${end - BORN}`;

const newestFirst = (a: JourneyItem, b: JourneyItem) => b.sortKey - a.sortKey;

export async function getProjectItems(): Promise<JourneyItem[]> {
  return (await getAllProjects()).map(fromProject).sort(newestFirst);
}

export async function getExperienceItems(): Promise<JourneyItem[]> {
  return (await getAllExperiences()).map(fromExperience).sort(newestFirst);
}

export function getStudyItems(): JourneyItem[] {
  return [...studies].sort(newestFirst);
}

// The route: one chapter per place lived, with what happened there
export async function getJourney(): Promise<{ chapters: JourneyChapter[] }> {
  const [projects, experiences] = await Promise.all([getProjectItems(), getExperienceItems()]);
  const items = [...experiences, ...projects, ...studies].filter((i) => i.chapter);

  const chapters = route.map((stop) => ({
    id: stop.id,
    place: stop.place,
    country: stop.country,
    years: formatYears(stop.start, stop.end),
    ages: stop.end !== undefined && stop.end <= 2021 ? agesAt(stop.start, stop.end) : undefined,
    note: stop.note,
    hue: hueOf(stop.id),
    photo: stop.photo,
    items: items.filter((i) => i.chapter === stop.id).sort((a, b) => a.sortKey - b.sortKey),
  }));

  return { chapters };
}
