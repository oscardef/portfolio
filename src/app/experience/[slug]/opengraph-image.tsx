import { getExperienceBySlug, getExperienceSlugs } from '@/lib/content';
import { ogCard, ogSize } from '@/lib/og';

export const alt = 'A role in Oscar de Francesca’s experience';
export const size = ogSize;
export const contentType = 'image/png';
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return (await getExperienceSlugs()).map((slug) => ({ slug }));
}

// The card's renderer can't clip the Groningen crest's SVG to its frame, so it gets a PNG of it
const forCard = (logo?: string) => logo?.replace('ugroningen-crest.svg', 'ugroningen-crest.png');

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const role = (await getExperienceBySlug(slug))!.frontmatter;
  return ogCard({
    kind: 'Experience',
    title: role.organization,
    subtitle: role.title,
    line: role.blurb,
    logo: forCard(role.logo),
  });
}
