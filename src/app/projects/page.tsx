import type { Metadata } from 'next';
import { ProjectsBrowser } from '@/components/projects-browser';
import { getProjectItems } from '@/lib/journey';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Projects by Oscar de Francesca across systems, machine learning, hardware and products: from a GPT-2 built from scratch to RFID wristbands for Decathlon.',
  alternates: { canonical: `${siteConfig.url}/projects` },
};

export default async function ProjectsPage() {
  // Featured work first, then newest; this site itself goes last
  const rank = (slug: string, featured: boolean) => (slug === 'portfolio' ? 2 : featured ? 0 : 1);
  const items = (await getProjectItems()).sort(
    (a, b) => rank(a.slug, a.featured) - rank(b.slug, b.featured) || b.sortKey - a.sortKey
  );

  return (
    <div className="container-page pb-24 pt-32 md:pb-32 md:pt-40">
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">Projects</h1>
      <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-text-secondary">
        Everything I’ve built, from coursework and research to hackathons and my own products, with the main
        ones first. Open any of them for the full write-up.
      </p>
      <div className="mt-10">
        <ProjectsBrowser items={items} />
      </div>
    </div>
  );
}
