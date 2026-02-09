import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Calendar, MapPin, Building2, FolderOpen } from 'lucide-react';
import { getExperienceBySlug, getExperienceSlugs, getAllExperiences, getAllProjects } from '@/lib/content';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
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

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getExperienceBySlug(slug);
  if (!data) notFound();

  const { frontmatter, content } = data;

  const allExperiences = await getAllExperiences();
  const currentIndex = allExperiences.findIndex((e) => e.slug === slug);
  const prevExp = currentIndex < allExperiences.length - 1 ? allExperiences[currentIndex + 1] : null;
  const nextExp = currentIndex > 0 ? allExperiences[currentIndex - 1] : null;

  // Cross-linked projects
  const allProjects = await getAllProjects();
  const relatedProjects = frontmatter.relatedProjects
    .map((s) => allProjects.find((p) => p.slug === s))
    .filter(Boolean);

  return (
    <article className="mx-auto max-w-4xl px-6 pt-28 pb-20">
      <Link
        href="/experience"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        All Experience
      </Link>

      <header className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          {frontmatter.logo && (
            <div className="shrink-0 w-14 h-14 rounded-xl bg-white/90 border border-border flex items-center justify-center overflow-hidden p-1.5">
              <Image
                src={frontmatter.logo}
                alt={frontmatter.organization}
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
              <Building2 size={14} />
              <span>{frontmatter.organization}</span>
              <span>·</span>
              <MapPin size={14} />
              <span>{frontmatter.location}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              {frontmatter.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 text-sm text-text-muted">
          <Calendar size={14} />
          <time>{formatDateRange(frontmatter.startDate, frontmatter.endDate)}</time>
          <span>·</span>
          <span className="capitalize">{frontmatter.type.join(' + ')}</span>
        </div>

        <p className="text-lg text-text-secondary mt-4 leading-relaxed">
          {frontmatter.summary}
        </p>

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

        {frontmatter.links.company && (
          <div className="flex flex-wrap gap-3 mt-4">
            <Button href={frontmatter.links.company} external variant="secondary" size="sm" icon="external">
              Company Website
            </Button>
          </div>
        )}
      </header>

      <div className="prose max-w-none">{content}</div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={16} className="text-accent" />
            <h3 className="font-semibold text-text-primary text-sm">Related Projects</h3>
          </div>
          <div className="space-y-2">
            {relatedProjects.map((project) => (
              <Link
                key={project!.slug}
                href={`/projects/${project!.slug}`}
                className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-card p-4 transition-all hover:border-border-hover hover:bg-bg-card-hover"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                    {project!.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{project!.summary}</p>
                </div>
                <ArrowRight size={14} className="shrink-0 text-text-muted group-hover:text-accent transition-all group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}

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
