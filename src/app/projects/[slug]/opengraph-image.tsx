import { getProjectBySlug, getProjectSlugs } from '@/lib/content';
import { ogCard, ogSize } from '@/lib/og';

export const alt = 'A project by Oscar de Francesca';
export const size = ogSize;
export const contentType = 'image/png';
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return (await getProjectSlugs()).map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = (await getProjectBySlug(slug))!.frontmatter;
  const [name, ...rest] = project.title.split(':');
  return ogCard({
    kind: 'Project',
    title: name.trim(),
    subtitle: rest.join(':').trim() || undefined,
    line: project.blurb,
    picture: project.heroImage?.src,
  });
}
