import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/data/route';
import { siteConfig } from '@/lib/constants';
import { getExperienceBySlug, getProjectBySlug, type Heading } from '@/lib/content';
import { getExperienceItems, getProjectItems, type JourneyItem } from '@/lib/journey';
import { cn } from '@/lib/utils';

/**
 * The full write-up for a project or role. Rendered inside the sheet when
 * opened from the page, and on its own at /projects/<slug> or
 * /experience/<slug> when visited directly.
 */

const linkLabels: Record<string, string> = {
  github: 'Source code on GitHub',
  demo: 'Live demo',
  paper: 'Paper (PDF)',
  video: 'Video',
  blog: 'Blog post',
  company: 'Website',
};

const statusLabels: Record<string, string> = {
  shipped: 'Shipped',
  prototype: 'Prototype',
  research: 'Research',
  coursework: 'Coursework',
};

function monthYear(date: string): string {
  const d = new Date(`${date.length === 7 ? `${date}-01` : date}T00:00:00Z`);
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

interface DetailProps {
  slug: string;
  headingLevel?: 1 | 2;
  // On its own page rather than in the sheet: title first, facts in a side column when there's room
  page?: boolean;
}

// What to read after this: other things from the same place on the route
// (newest first), and the item that follows this one in its own list
async function onward(type: 'project' | 'experience', slug: string, chapter?: string): Promise<Onward> {
  const [projects, roles] = await Promise.all([getProjectItems(), getExperienceItems()]);
  const list = type === 'project' ? projects : roles;
  const next = list[(list.findIndex((item) => item.slug === slug) + 1) % list.length];
  const same = chapter
    ? [...roles, ...projects]
        .filter((item) => item.chapter === chapter && item !== next && !(item.type === type && item.slug === slug))
        .sort((a, b) => b.sortKey - a.sortKey)
        .slice(0, 4)
    : [];
  return { place: route.find((stop) => stop.id === chapter)?.place, same, next, nextLabel: type === 'project' ? 'Next project' : 'Next role' };
}

interface Onward {
  place?: string;
  same: JourneyItem[];
  next: JourneyItem;
  nextLabel: string;
}

export async function ProjectDetail({ slug, headingLevel = 1, page = false }: DetailProps) {
  const data = await getProjectBySlug(slug);
  if (!data) return null;
  const { frontmatter: p, content, headings } = data;

  const facts: [string, ReactNode][] = [];
  if (p.role) facts.push(['Role', p.role]);
  if (p.teamSize) facts.push(['Team', p.teamSize === 1 ? 'Solo' : `${p.teamSize} people`]);
  if (p.organization) facts.push(['With', p.organization]);
  if (p.status) facts.push(['Status', statusLabels[p.status] ?? p.status]);

  return (
    <DetailLayout
      meta={[p.location?.split(',')[0], String(new Date(p.date).getUTCFullYear())].filter(Boolean).join(', ')}
      title={p.title}
      headingLevel={headingLevel}
      page={page}
      summary={p.summary}
      image={p.heroImage}
      facts={facts}
      stack={p.stack}
      highlights={p.highlights}
      links={Object.entries(p.links).filter(([, url]) => url) as [string, string][]}
      headings={headings}
      onward={await onward('project', slug, p.chapter)}
    >
      {content}
    </DetailLayout>
  );
}

export async function ExperienceDetail({ slug, headingLevel = 1, page = false }: DetailProps) {
  const data = await getExperienceBySlug(slug);
  if (!data) return null;
  const { frontmatter: e, content, headings } = data;

  return (
    <DetailLayout
      meta={`${e.location}, ${monthYear(e.startDate)} to ${monthYear(e.endDate)}`}
      title={`${e.title}, ${e.organization}`}
      headingLevel={headingLevel}
      page={page}
      summary={e.summary}
      logo={e.logo ? { src: e.logo, alt: e.organization } : undefined}
      facts={[]}
      stack={e.stack}
      highlights={e.highlights}
      links={Object.entries(e.links).filter(([, url]) => url) as [string, string][]}
      headings={headings}
      onward={await onward('experience', slug, e.chapter)}
    >
      {content}
    </DetailLayout>
  );
}

// A link to another project or role. Inside the sheet it swaps the sheet's
// content in place, so closing it still returns to the page underneath. On a
// page of its own, a plain link loads the next page (a router link would
// open it as a sheet over this one).
function Onwards({ page, href, className, children }: { page: boolean; href: string; className: string; children: ReactNode }) {
  return page ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} replace scroll={false} className={className}>
      {children}
    </Link>
  );
}

interface DetailLayoutProps {
  meta: string;
  title: string;
  headingLevel: 1 | 2;
  page: boolean;
  summary: string;
  image?: { src: string; alt: string };
  logo?: { src: string; alt: string };
  facts: [string, ReactNode][];
  stack: string[];
  highlights: string[];
  links: [string, string][];
  headings: Heading[];
  onward: Onward;
  children: ReactNode;
}

function DetailLayout({
  meta,
  title,
  headingLevel,
  page,
  summary,
  image,
  logo,
  facts,
  stack,
  highlights,
  links,
  headings,
  onward,
  children,
}: DetailLayoutProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';

  const hero = image && (
    <Image
      src={image.src}
      alt={image.alt}
      width={1200}
      height={675}
      priority
      sizes={page ? '(max-width: 1088px) 100vw, 1088px' : '(max-width: 800px) 100vw, 800px'}
      className={cn(
        'aspect-[16/9] w-full bg-paper object-cover',
        page ? 'mt-10 rounded-3xl border border-rule' : 'border-b border-rule'
      )}
    />
  );

  return (
    <article className="@container">
      {!page && hero}

      <div className={page ? '' : 'px-5 pt-8 pb-16 sm:px-10'}>
        {logo && (
          <div className="mb-6 flex h-14 w-24 items-center justify-center rounded-2xl bg-white px-3">
            <Image src={logo.src} alt={logo.alt} width={72} height={40} className="h-auto max-h-9 w-full object-contain" />
          </div>
        )}
        <p className="tnum text-sm text-ink-2">{meta}</p>
        <Heading
          className={cn(
            'mt-3 text-balance font-semibold leading-[1.1] tracking-tight',
            page ? 'max-w-[24ch] text-[2.25rem] sm:text-5xl' : 'text-[2rem] sm:text-[2.5rem]'
          )}
        >
          {title}
        </Heading>
        <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-ink-2">{summary}</p>

        {page && hero}

        <div className="@4xl:mt-12 @4xl:grid @4xl:grid-cols-[minmax(0,1fr)_15rem] @4xl:gap-16">
          {(facts.length > 0 || stack.length > 0 || links.length > 0) && (
            <div className="@4xl:sticky @4xl:top-24 @4xl:col-start-2 @4xl:row-start-1 @4xl:self-start">
              {(facts.length > 0 || stack.length > 0) && (
                <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-rule pt-6 text-[0.9375rem] @xl:grid-cols-[auto_1fr] @4xl:mt-0 @4xl:grid-cols-1">
                  {facts.map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="text-ink-2">{label}</dt>
                      <dd className="-mt-3 @xl:mt-0 @4xl:-mt-3">{value}</dd>
                    </div>
                  ))}
                  {stack.length > 0 && (
                    <div className="contents">
                      <dt className="text-ink-2">Built with</dt>
                      <dd className="-mt-3 @xl:mt-0 @4xl:-mt-3">{stack.join(', ')}</dd>
                    </div>
                  )}
                </dl>
              )}

              {links.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] @4xl:flex-col">
                  {links.map(([key, url]) => (
                    <li key={key}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-ink-3 underline-offset-4 hover:decoration-ink"
                      >
                        {linkLabels[key] ?? key}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {/* On its own page, beside a long write-up: where its parts are */}
              {page && headings.length > 2 && (
                <nav aria-label="On this page" className="mt-8 hidden border-t border-rule pt-6 text-[0.9375rem] @4xl:block">
                  <p className="text-ink-2">On this page</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="text-ink-2 transition-colors hover:text-ink">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          )}

          <div className="@4xl:col-start-1 @4xl:row-start-1">
            {highlights.length > 0 && (
              <ul className="mt-10 max-w-[64ch] space-y-3 border-l-2 border-accent pl-5 @4xl:mt-0">
                {highlights.map((h) => (
                  <li key={h} className="text-ink">
                    {h}
                  </li>
                ))}
              </ul>
            )}

            <div className="prose mt-10">{children}</div>

            <nav aria-label="More to read" className="mt-14 max-w-[70ch] border-t border-rule pt-8">
              {onward.same.length > 0 && (
                <>
                  <p className="text-sm font-medium text-ink-2">More from {onward.place}</p>
                  <ul className="mt-3 grid grid-cols-1 gap-2.5 @2xl:grid-cols-2">
                    {onward.same.map((item) => (
                      <li key={item.id}>
                        <Onwards
                          page={page}
                          href={item.href!}
                          className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-rule px-4 py-3 transition-colors duration-300 hover:border-ink-3"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">
                              {item.type === 'experience' ? item.detail : item.name}
                            </span>
                            <span className="tnum block truncate text-sm text-ink-2">
                              {item.type === 'experience' ? item.name : item.detail || 'Project'}, {item.period}
                            </span>
                          </span>
                          <ChevronRight
                            size={17}
                            aria-hidden="true"
                            className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                          />
                        </Onwards>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <Onwards
                page={page}
                href={onward.next.href!}
                className={cn(
                  'group flex items-center justify-between gap-4 rounded-2xl border border-rule bg-accent-muted px-5 py-4 transition-colors duration-300 hover:border-accent/50',
                  onward.same.length > 0 && 'mt-2.5'
                )}
              >
                <span className="min-w-0">
                  <span className="block text-sm text-ink-2">{onward.nextLabel}</span>
                  <span className="block truncate text-lg font-semibold">
                    {onward.next.type === 'experience'
                      ? `${onward.next.detail}, ${onward.next.name}`
                      : onward.next.name}
                  </span>
                </span>
                <ArrowRight
                  size={19}
                  aria-hidden="true"
                  className="shrink-0 text-accent-light transition-transform group-hover:translate-x-0.5"
                />
              </Onwards>
            </nav>
          </div>
        </div>
      </div>
    </article>
  );
}

// For someone who lands on a project or role page directly, from a CV link
// say: who this is, and the two places to go next
export function AuthorStrip() {
  return (
    <section aria-label="About the author" className="mt-14 flex flex-wrap items-center justify-between gap-x-8 gap-y-5 rounded-3xl border border-rule bg-paper-raised p-5 sm:p-6">
      <div className="flex min-w-0 items-center gap-4">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-paper ring-1 ring-border-hover">
          <Image src="/images/portrait.jpg" alt="" fill sizes="56px" className="object-cover" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold leading-tight">{siteConfig.name}</p>
          <p className="mt-1 text-[0.9375rem] leading-snug text-ink-2">
            Software engineer in Basel, writing my master’s thesis at ETH Zurich.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button href="/" variant="secondary">
          More about me
        </Button>
        <Button href="/#contact" icon="arrow">
          Get in touch
        </Button>
      </div>
    </section>
  );
}
