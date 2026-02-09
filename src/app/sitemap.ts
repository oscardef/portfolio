import { getProjectSlugs, getExperienceSlugs } from '@/lib/content';
import { siteConfig } from '@/lib/constants';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projectSlugs = await getProjectSlugs();
  const experienceSlugs = await getExperienceSlugs();

  const projectEntries = projectSlugs.map((slug) => ({
    url: `${siteConfig.url}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const experienceEntries = experienceSlugs.map((slug) => ({
    url: `${siteConfig.url}/experience/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteConfig.url}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...projectEntries,
    ...experienceEntries,
  ];
}
