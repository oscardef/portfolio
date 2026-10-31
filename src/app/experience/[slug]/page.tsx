import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getExperienceBySlug, getExperienceSlugs } from '@/lib/content';
import { ExperienceDetail } from '@/components/detail';
import { siteConfig } from '@/lib/constants';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getExperienceSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getExperienceBySlug(slug);
  if (!data) return {};

  const { frontmatter } = data;
  return {
    title: `${frontmatter.title} at ${frontmatter.organization}`,
    description: `${frontmatter.summary} Part of Oscar de Francesca's experience at ${frontmatter.organization}.`,
    alternates: { canonical: `${siteConfig.url}/experience/${slug}` },
    openGraph: {
      title: `${frontmatter.title} at ${frontmatter.organization} · Oscar de Francesca`,
      description: frontmatter.summary,
      type: 'article',
      authors: ['Oscar de Francesca'],
    },
  };
}

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;
  if (!(await getExperienceBySlug(slug))) notFound();

  return (
    <div className="container-page pb-24 pt-28 md:pb-32 md:pt-36">
      <div className="mx-auto max-w-[68rem]">
        <Link
          href="/experience"
          className="mb-8 inline-flex items-center gap-1 text-sm text-ink-2 transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          All experience
        </Link>
        <ExperienceDetail slug={slug} page />
      </div>
    </div>
  );
}
