import { notFound } from 'next/navigation';
import { getExperienceBySlug, getExperienceSlugs } from '@/lib/content';
import { ExperienceDetail } from '@/components/detail';
import { Sheet } from '@/components/sheet';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getExperienceSlugs()).map((slug) => ({ slug }));
}

export default async function ExperienceSheet({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getExperienceBySlug(slug);
  if (!data) notFound();

  const { title, organization } = data.frontmatter;
  return (
    <Sheet label={`${title}, ${organization}`} href={`/experience/${slug}`}>
      <ExperienceDetail slug={slug} headingLevel={2} />
    </Sheet>
  );
}
