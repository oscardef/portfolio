import { getAllExperiences, getAllProjects } from '@/lib/content';
import { siteConfig } from '@/lib/constants';
import type { MetadataRoute } from 'next';

// Google ignores priority and change frequency and only trusts a last-modified date that is
// right, so only the home page (rebuilt with every change) carries one. Images help image search.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, experiences] = await Promise.all([getAllProjects(), getAllExperiences()]);
  const url = (path: string) => `${siteConfig.url}${path}`;

  return [
    { url: siteConfig.url, lastModified: new Date(), images: [url('/images/portrait.jpg')] },
    { url: url('/projects') },
    { url: url('/experience') },
    ...projects.map((p) => ({
      url: url(`/projects/${p.slug}`),
      ...(p.heroImage && { images: [url(p.heroImage.src)] }),
    })),
    ...experiences.map((e) => ({ url: url(`/experience/${e.slug}`) })),
  ];
}
