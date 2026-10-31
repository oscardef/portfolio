import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
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
    <div className="mx-auto max-w-[800px] pb-20 pt-24 sm:pt-28">
      <Link
        href="/projects"
        className="mx-5 mb-6 inline-block text-sm text-ink-2 underline decoration-ink-3 underline-offset-4 hover:text-ink sm:mx-10"
      >
        All projects
      </Link>
      <div className="overflow-hidden border-y border-rule bg-paper-raised sm:rounded-3xl sm:border-x">
        <ProjectDetail slug={slug} />
      </div>
    </div>
  );
}
