import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Github, ExternalLink, FileText, Play, Calendar, Building2, Briefcase } from 'lucide-react';
import { getProjectBySlug, getProjectSlugs, getAllProjects, getAllExperiences } from '@/lib/content';
import { Tag } from '@/components/ui/tag';
import { Button } from '@/components/ui/button';
import { formatDateFull, formatDateRange } from '@/lib/utils';
import { siteConfig } from '@/lib/constants';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) return {};

  const { frontmatter } = data;
  return {
    title: frontmatter.title,
    description: frontmatter.summary,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.summary,
      type: 'article',
      publishedTime: frontmatter.date,
      images: frontmatter.heroImage
        ? [{ url: frontmatter.heroImage.src }]
        : [{ url: siteConfig.ogImage }],
    },
  };
}

const linkIcons = {
  github: { icon: Github, label: 'Source Code' },
  demo: { icon: ExternalLink, label: 'Live Demo' },
  paper: { icon: FileText, label: 'Paper' },
  video: { icon: Play, label: 'Video' },
  blog: { icon: FileText, label: 'Blog Post' },
};

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) notFound();

  const { frontmatter, content } = data;

  // Get prev/next projects for navigation
  const allProjects = await getAllProjects();
  const currentIndex = allProjects.findIndex((p) => p.slug === slug);
  const prevProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;
  const nextProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;

  const activeLinks = Object.entries(frontmatter.links).filter(
    ([, url]) => url && url.length > 0
  ) as [keyof typeof linkIcons, string][];

  // Cross-linked experiences
  const allExperiences = await getAllExperiences();
  const relatedExperiences = frontmatter.relatedExperience
    .map((s) => allExperiences.find((e) => e.slug === s))
    .filter(Boolean);

  return (
    <article className="mx-auto max-w-4xl px-6 pt-28 pb-20">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        All Projects
      </Link>

      {/* Hero image */}
      {frontmatter.heroImage && (
        <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-border mb-8">
          <Image
            src={frontmatter.heroImage.src}
            alt={frontmatter.heroImage.alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/40 to-transparent" />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
          {frontmatter.organization && (
            <>
              <Building2 size={14} />
              <span>{frontmatter.organization}</span>
              <span>·</span>
            </>
          )}
          <Calendar size={14} />
          <time dateTime={frontmatter.date}>{formatDateFull(frontmatter.date)}</time>
          <span>·</span>
          <span className="capitalize">{frontmatter.type}</span>
          {frontmatter.status && (
            <>
              <span>·</span>
              <span className="capitalize">{frontmatter.status}</span>
            </>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
          {frontmatter.title}
        </h1>

        <p className="text-lg text-text-secondary mt-4 leading-relaxed">
          {frontmatter.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {frontmatter.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>

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

        {/* Metadata bar */}
        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-border text-sm">
          {frontmatter.stack.length > 0 && (
            <div>
              <span className="text-text-muted block mb-1">Stack</span>
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
          {frontmatter.role && (
            <div>
              <span className="text-text-muted block mb-1">Role</span>
              <span className="text-text-primary">{frontmatter.role}</span>
            </div>
          )}
          {frontmatter.teamSize && (
            <div>
              <span className="text-text-muted block mb-1">Team</span>
              <span className="text-text-primary">{frontmatter.teamSize} people</span>
            </div>
          )}
        </div>

        {/* Links */}
        {activeLinks.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-6">
            {activeLinks.map(([key, url]) => {
              const config = linkIcons[key];
              if (!config) return null;
              return (
                <Button
                  key={key}
                  href={url}
                  external
                  variant="secondary"
                  size="sm"
                  icon="external"
                >
                  <config.icon size={14} />
                  {config.label}
                </Button>
              );
            })}
          </div>
        )}
      </header>

      {/* MDX Content */}
      <div className="prose max-w-none">{content}</div>

      {/* Related Experiences */}
      {relatedExperiences.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={16} className="text-accent" />
            <h3 className="font-semibold text-text-primary text-sm">Related Experience</h3>
          </div>
          <div className="space-y-2">
            {relatedExperiences.map((exp) => (
              <Link
                key={exp!.slug}
                href={`/experience/${exp!.slug}`}
                className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-card p-4 transition-all hover:border-border-hover hover:bg-bg-card-hover"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                    {exp!.title} at {exp!.organization}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {formatDateRange(exp!.startDate, exp!.endDate)}
                  </p>
                </div>
                <ArrowRight size={14} className="shrink-0 text-text-muted group-hover:text-accent transition-all group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Prev/Next navigation */}
      <nav className="mt-16 pt-8 border-t border-border" aria-label="Project navigation">
        <div className="flex justify-between gap-4">
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.slug}`}
              className="group flex-1 min-w-0"
            >
              <span className="text-xs text-text-muted">← Previous</span>
              <p className="text-sm text-text-primary group-hover:text-accent transition-colors truncate mt-1">
                {prevProject.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {nextProject ? (
            <Link
              href={`/projects/${nextProject.slug}`}
              className="group flex-1 min-w-0 text-right"
            >
              <span className="text-xs text-text-muted">Next →</span>
              <p className="text-sm text-text-primary group-hover:text-accent transition-colors truncate mt-1">
                {nextProject.title}
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
