import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Building2 } from 'lucide-react';
import { getExperienceBySlug, getExperienceSlugs, getAllExperiences } from '@/lib/content';
import { Button } from '@/components/ui/button';
import { formatDateRange } from '@/lib/utils';
import { siteConfig } from '@/lib/constants';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getExperienceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getExperienceBySlug(slug);
  if (!data) return {};

  const { frontmatter } = data;
  return {
    title: `${frontmatter.title} at ${frontmatter.organization}`,
    description: frontmatter.summary,
    openGraph: {
      title: `${frontmatter.title} at ${frontmatter.organization}`,
      description: frontmatter.summary,
      type: 'article',
      images: [{ url: siteConfig.ogImage }],
    },
  };
}

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getExperienceBySlug(slug);
  if (!data) notFound();

  const { frontmatter, content } = data;

  // Get prev/next experiences for navigation
  const allExperiences = await getAllExperiences();
  const currentIndex = allExperiences.findIndex((e) => e.slug === slug);
  const prevExp = currentIndex < allExperiences.length - 1 ? allExperiences[currentIndex + 1] : null;
  const nextExp = currentIndex > 0 ? allExperiences[currentIndex - 1] : null;

  return (
    <article className="mx-auto max-w-4xl px-6 pt-28 pb-20">
      {/* Back link */}
      <Link
        href="/#experience"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
          <Building2 size={14} />
          <span>{frontmatter.organization}</span>
          <span>·</span>
          <MapPin size={14} />
          <span>{frontmatter.location}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
          {frontmatter.title}
        </h1>

        <div className="flex items-center gap-2 mt-3 text-sm text-text-muted">
          <Calendar size={14} />
          <time>{formatDateRange(frontmatter.startDate, frontmatter.endDate)}</time>
          <span>·</span>
          <span className="capitalize">{frontmatter.type}</span>
        </div>

        <p className="text-lg text-text-secondary mt-4 leading-relaxed">
          {frontmatter.summary}
        </p>

        {/* Highlights */}
        {frontmatter.highlights.length > 0 && (
          <ul className="mt-6 space-y-2">
            {frontmatter.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-accent mt-1">▸</span>
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Stack */}
        {frontmatter.stack.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <span className="text-xs text-text-muted block mb-2">Technologies</span>
            <div className="flex flex-wrap gap-1.5">
              {frontmatter.stack.map((s) => (
                <span
                  key={s}
                  className="text-xs text-text-secondary bg-bg-card border border-border px-2 py-0.5 rounded"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {(frontmatter.links.company || frontmatter.links.relatedProject) && (
          <div className="flex flex-wrap gap-3 mt-4">
            {frontmatter.links.company && (
              <Button href={frontmatter.links.company} external variant="secondary" size="sm" icon="external">
                Company
              </Button>
            )}
            {frontmatter.links.relatedProject && (
              <Button href={frontmatter.links.relatedProject} variant="secondary" size="sm" icon="arrow">
                Related Project
              </Button>
            )}
          </div>
        )}
      </header>

      {/* MDX Content */}
      <div className="prose max-w-none">{content}</div>

      {/* Prev/Next navigation */}
      <nav className="mt-16 pt-8 border-t border-border" aria-label="Experience navigation">
        <div className="flex justify-between gap-4">
          {prevExp ? (
            <Link href={`/experience/${prevExp.slug}`} className="group flex-1 min-w-0">
              <span className="text-xs text-text-muted">← Previous</span>
              <p className="text-sm text-text-primary group-hover:text-accent transition-colors truncate mt-1">
                {prevExp.title} at {prevExp.organization}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {nextExp ? (
            <Link href={`/experience/${nextExp.slug}`} className="group flex-1 min-w-0 text-right">
              <span className="text-xs text-text-muted">Next →</span>
              <p className="text-sm text-text-primary group-hover:text-accent transition-colors truncate mt-1">
                {nextExp.title} at {nextExp.organization}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </nav>
    </article>
  );
}
