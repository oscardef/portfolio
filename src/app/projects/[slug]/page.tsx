import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getProjectBySlug, getProjectSlugs } from '@/lib/content';
import { AuthorStrip, ProjectDetail } from '@/components/detail';
import { pageMetadata } from '@/lib/metadata';
import { ShareButton } from '@/components/share-button';

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
  return pageMetadata({
    title: frontmatter.title,
    description: `${frontmatter.summary} A project by Oscar de Francesca.`,
    path: `/projects/${slug}`,
    type: 'article',
    published: frontmatter.date,
    image: false, // drawn by opengraph-image.tsx beside this file
  });
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) notFound();

  return (
    <div className="container-page pb-20 pt-24 md:pb-24 md:pt-28">
      <div className="mx-auto max-w-[68rem]">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm text-ink-2 transition-colors hover:text-ink"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            All projects
          </Link>
          <ShareButton title={data.frontmatter.title} path={`/projects/${slug}`} />
        </div>
        <ProjectDetail slug={slug} page />
        <AuthorStrip />
      </div>
    </div>
  );
}
