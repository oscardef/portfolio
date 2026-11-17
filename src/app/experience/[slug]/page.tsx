import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getExperienceBySlug, getExperienceSlugs } from '@/lib/content';
import { AuthorStrip, ExperienceDetail } from '@/components/detail';
import { pageMetadata } from '@/lib/metadata';
import { ShareButton } from '@/components/share-button';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbs, graph } from '@/lib/structured-data';

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
  return pageMetadata({
    title: `${frontmatter.title} at ${frontmatter.organization}`,
    description: `${frontmatter.summary} Part of Oscar de Francesca's experience at ${frontmatter.organization}.`,
    path: `/experience/${slug}`,
    type: 'article',
    image: false, // drawn by opengraph-image.tsx beside this file
  });
}

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getExperienceBySlug(slug);
  if (!data) notFound();

  return (
    <div className="container-page pb-20 pt-24 md:pb-24 md:pt-28">
      <JsonLd
        data={graph(
          breadcrumbs([
            { name: 'Experience', path: '/experience' },
            {
              name: `${data.frontmatter.title}, ${data.frontmatter.organization}`,
              path: `/experience/${slug}`,
            },
          ])
        )}
      />
      <div className="mx-auto max-w-[68rem]">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/experience"
            className="inline-flex items-center gap-1 text-sm text-ink-2 transition-colors hover:text-ink"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            All experience
          </Link>
          <ShareButton
            title={`${data.frontmatter.title}, ${data.frontmatter.organization}`}
            path={`/experience/${slug}`}
          />
        </div>
        <ExperienceDetail slug={slug} page />
        <AuthorStrip />
      </div>
    </div>
  );
}
