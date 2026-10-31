import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { getExperienceBySlug, getProjectBySlug } from '@/lib/content';
import { hueOf } from '@/data/route';
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
  company: 'Company website',
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

export async function ProjectDetail({ slug, headingLevel = 1, page = false }: DetailProps) {
  const data = await getProjectBySlug(slug);
  if (!data) return null;
  const { frontmatter: p, content } = data;

  const facts: [string, ReactNode][] = [];
  if (p.role) facts.push(['Role', p.role]);
  if (p.teamSize) facts.push(['Team', p.teamSize === 1 ? 'Solo' : `${p.teamSize} people`]);
  if (p.organization) facts.push(['With', p.organization]);
  if (p.status) facts.push(['Status', statusLabels[p.status] ?? p.status]);

  return (
    <DetailLayout
      hue={p.chapter ? hueOf(p.chapter) : null}
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
    >
      {content}
    </DetailLayout>
  );
}

export async function ExperienceDetail({ slug, headingLevel = 1, page = false }: DetailProps) {
  const data = await getExperienceBySlug(slug);
  if (!data) return null;
  const { frontmatter: e, content } = data;

  return (
    <DetailLayout
      hue={e.chapter ? hueOf(e.chapter) : null}
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
    >
      {content}
    </DetailLayout>
  );
}

interface DetailLayoutProps {
  hue: number | null;
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
  children: ReactNode;
}

function DetailLayout({
  hue,
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
    <article className="@container" style={{ '--h': hue ?? 0 } as CSSProperties}>
      {!page && hero}

      <div className={page ? '' : 'px-5 pt-8 pb-16 sm:px-10'}>
        {logo && (
          <div className="mb-6 flex h-14 w-24 items-center justify-center rounded-2xl bg-white px-3">
            <Image src={logo.src} alt={logo.alt} width={72} height={40} className="h-auto max-h-9 w-full object-contain" />
          </div>
        )}
        <p className="flex items-center gap-2 text-sm text-ink-2">
          {hue !== null && <span aria-hidden="true" className="hue-bg size-2 rounded-full" />}
          <span className="tnum">{meta}</span>
        </p>
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
            <aside className="@4xl:sticky @4xl:top-24 @4xl:col-start-2 @4xl:row-start-1 @4xl:self-start">
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
            </aside>
          )}

          <div className="@4xl:col-start-1 @4xl:row-start-1">
            {highlights.length > 0 && (
              <ul
                className="mt-10 max-w-[64ch] space-y-3 border-l-2 pl-5 @4xl:mt-0"
                style={{ borderColor: 'oklch(var(--route-l) var(--route-c) var(--h))' }}
              >
                {highlights.map((h) => (
                  <li key={h} className="text-ink">
                    {h}
                  </li>
                ))}
              </ul>
            )}

            <div className="prose mt-10">{children}</div>
          </div>
        </div>
      </div>
    </article>
  );
}
