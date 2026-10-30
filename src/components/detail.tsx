import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { getExperienceBySlug, getProjectBySlug } from '@/lib/content';
import { hueOf } from '@/data/route';

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

export async function ProjectDetail({ slug, headingLevel = 1 }: { slug: string; headingLevel?: 1 | 2 }) {
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

export async function ExperienceDetail({ slug, headingLevel = 1 }: { slug: string; headingLevel?: 1 | 2 }) {
  const data = await getExperienceBySlug(slug);
  if (!data) return null;
  const { frontmatter: e, content } = data;

  return (
    <DetailLayout
      hue={e.chapter ? hueOf(e.chapter) : null}
      meta={`${e.location}, ${monthYear(e.startDate)} to ${monthYear(e.endDate)}`}
      title={`${e.title}, ${e.organization}`}
      headingLevel={headingLevel}
      summary={e.summary}
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
  summary: string;
  image?: { src: string; alt: string };
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
  summary,
  image,
  facts,
  stack,
  highlights,
  links,
  children,
}: DetailLayoutProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';

  return (
    <article style={{ '--h': hue ?? 0 } as CSSProperties}>
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          width={1200}
          height={675}
          priority
          sizes="(max-width: 800px) 100vw, 760px"
          className="aspect-[16/9] w-full border-b border-rule bg-paper object-cover"
        />
      )}

      <div className="px-5 pt-8 pb-16 sm:px-10">
        <p className="flex items-center gap-2 text-sm text-ink-2">
          {hue !== null && <span aria-hidden="true" className="hue-bg size-2 rounded-full" />}
          <span className="tnum">{meta}</span>
        </p>
        <Heading className="mt-3 text-balance text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.5rem]">{title}</Heading>
        <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-ink-2">{summary}</p>

        {(facts.length > 0 || stack.length > 0) && (
          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-rule pt-6 text-[0.9375rem] sm:grid-cols-[auto_1fr]">
            {facts.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-ink-2">{label}</dt>
                <dd className="-mt-3 sm:mt-0">{value}</dd>
              </div>
            ))}
            {stack.length > 0 && (
              <div className="contents">
                <dt className="text-ink-2">Built with</dt>
                <dd className="-mt-3 sm:mt-0">{stack.join(', ')}</dd>
              </div>
            )}
          </dl>
        )}

        {links.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
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

        {highlights.length > 0 && (
          <ul className="mt-10 max-w-[64ch] space-y-3 border-l-2 pl-5" style={{ borderColor: 'oklch(var(--route-l) var(--route-c) var(--h))' }}>
            {highlights.map((h) => (
              <li key={h} className="text-ink">
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className="prose mt-10">{children}</div>
      </div>
    </article>
  );
}
