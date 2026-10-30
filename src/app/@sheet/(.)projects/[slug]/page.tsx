import { notFound } from 'next/navigation';
import { getProjectBySlug, getProjectSlugs } from '@/lib/content';
import { ProjectDetail } from '@/components/detail';
import { Sheet } from '@/components/sheet';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjectSlugs()).map((slug) => ({ slug }));
}

export default async function ProjectSheet({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) notFound();

  return (
    <Sheet label={data.frontmatter.title} href={`/projects/${slug}`}>
      <ProjectDetail slug={slug} headingLevel={2} />
    </Sheet>
  );
}
