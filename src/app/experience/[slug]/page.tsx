import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
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
    <div className="mx-auto max-w-[800px] pb-20 pt-24 sm:pt-28">
      <Link
        href="/experience"
        className="mx-5 mb-6 inline-block text-sm text-ink-2 underline decoration-ink-3 underline-offset-4 hover:text-ink sm:mx-10"
      >
        All experience
      </Link>
      <div className="overflow-hidden border-y border-rule bg-paper-raised sm:rounded-3xl sm:border-x">
        <ExperienceDetail slug={slug} />
      </div>
    </div>
  );
}
