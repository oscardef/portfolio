import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getProjectBySlug, getProjectSlugs } from '@/lib/content';
import { ProjectDetail } from '@/components/detail';
import { siteConfig } from '@/lib/constants';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjectSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) return {};

  const { frontmatter } = data;
  return {
    title: frontmatter.title,
    description: `${frontmatter.summary} A project by Oscar de Francesca.`,
    alternates: { canonical: `${siteConfig.url}/projects/${slug}` },
    openGraph: {
      title: `${frontmatter.title} · Oscar de Francesca`,
      description: frontmatter.summary,
      type: 'article',
      publishedTime: frontmatter.date,
      authors: ['Oscar de Francesca'],
      ...(frontmatter.heroImage && { images: [{ url: frontmatter.heroImage.src }] }),
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  if (!(await getProjectBySlug(slug))) notFound();

  return (
    <div className="container-page pb-24 pt-28 md:pb-32 md:pt-36">
      <div className="mx-auto max-w-[68rem]">
        <Link
          href="/projects"
          className="mb-8 inline-flex items-center gap-1 text-sm text-ink-2 transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          All projects
        </Link>
        <ProjectDetail slug={slug} page />
      </div>
    </div>
  );
}
