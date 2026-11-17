import { getAllExperiences, getAllProjects } from '@/lib/content';
import { siteConfig } from '@/lib/constants';

/**
 * /llms.txt: a plain summary of the site for AI assistants and AI search
 * (llmstxt.org), built from the same content files as the pages.
 */
export const dynamic = 'force-static';

export async function GET() {
  const [projects, experiences] = await Promise.all([getAllProjects(), getAllExperiences()]);
  const url = (path: string) => `${siteConfig.url}${path}`;
  const text = [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.description}`,
    '',
    `Personal site of ${siteConfig.name}. The home page covers his background, selected projects, experience, every place he has lived ("The route") and contact details.`,
    '',
    '## Experience',
    '',
    ...experiences.map(
      (e) =>
        `- [${e.title}, ${e.organization}](${url(`/experience/${e.slug}`)}): ${e.location}, ${e.startDate} to ${e.endDate}. ${e.summary}`
    ),
    '',
    '## Projects',
    '',
    ...projects.map((p) => `- [${p.title}](${url(`/projects/${p.slug}`)}): ${p.summary}`),
    '',
    '## Links',
    '',
    `- [Home](${siteConfig.url})`,
    `- [GitHub](${siteConfig.links.github})`,
    `- [LinkedIn](${siteConfig.links.linkedin})`,
    '',
  ].join('\n');
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
