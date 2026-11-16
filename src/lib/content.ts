import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import { type ReactElement } from 'react';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import { projectSchema, experienceSchema, type Project, type Experience } from './schemas';
import { mdxComponents } from '@/components/mdx/mdx-components';

// ── Paths ───────────────────────────────────────────────────────────────────
const PROJECTS_DIR = path.join(process.cwd(), 'content/projects');
const EXPERIENCE_DIR = path.join(process.cwd(), 'content/experience');

// ── Rehype pretty code options ──────────────────────────────────────────────
const prettyCodeOptions = {
  theme: 'github-dark-dimmed',
  keepBackground: true,
};

// ── MDX compilation ─────────────────────────────────────────────────────────
async function compileMDXContent(source: string): Promise<ReactElement> {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypePrettyCode, prettyCodeOptions],
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ],
      },
    },
  });
  return content;
}

// ── Headings ────────────────────────────────────────────────────────────────
export interface Heading {
  id: string;
  text: string;
}

// The write-up's main (##) headings, with the ids rehype-slug gives them
function headingsOf(source: string): Heading[] {
  return source
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => {
      const text = line.slice(3).trim();
      const id = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .replace(/\s/g, '-');
      return { id, text };
    });
}

// Minutes to read the write-up, at about 230 words a minute
function minutesOf(source: string): number {
  const text = source
    .replace(/<[^>]+>/g, ' ') // MDX components
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/[#*_`>|-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

// ── Read & validate MDX files ───────────────────────────────────────────────
function readMDXFile(filePath: string): { data: Record<string, unknown>; content: string } {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return { data, content };
}

// ── Projects ────────────────────────────────────────────────────────────────
export async function getAllProjects(): Promise<Project[]> {
  if (!fs.existsSync(PROJECTS_DIR)) return [];

  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith('.mdx'));

  const projects = files.map((file) => {
    const { data } = readMDXFile(path.join(PROJECTS_DIR, file));
    const parsed = projectSchema.parse(data);
    return parsed;
  });

  // Sort by date descending (newest first)
  return projects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getProjectBySlug(
  slug: string
): Promise<{ frontmatter: Project; content: ReactElement; headings: Heading[]; minutes: number } | null> {
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const { data, content: rawContent } = readMDXFile(filePath);
  const frontmatter = projectSchema.parse(data);
  const content = await compileMDXContent(rawContent);

  return { frontmatter, content, headings: headingsOf(rawContent), minutes: minutesOf(rawContent) };
}

export async function getProjectSlugs(): Promise<string[]> {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

// ── Experiences ─────────────────────────────────────────────────────────────
export async function getAllExperiences(): Promise<Experience[]> {
  if (!fs.existsSync(EXPERIENCE_DIR)) return [];

  const files = fs.readdirSync(EXPERIENCE_DIR).filter((f) => f.endsWith('.mdx'));

  const experiences = files.map((file) => {
    const { data } = readMDXFile(path.join(EXPERIENCE_DIR, file));
    const parsed = experienceSchema.parse(data);
    return parsed;
  });

  // Sort by startDate descending (most recent first)
  return experiences.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
}

export async function getExperienceBySlug(
  slug: string
): Promise<{ frontmatter: Experience; content: ReactElement; headings: Heading[]; minutes: number } | null> {
  const filePath = path.join(EXPERIENCE_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const { data, content: rawContent } = readMDXFile(filePath);
  const frontmatter = experienceSchema.parse(data);
  const content = await compileMDXContent(rawContent);

  return { frontmatter, content, headings: headingsOf(rawContent), minutes: minutesOf(rawContent) };
}

export async function getExperienceSlugs(): Promise<string[]> {
  if (!fs.existsSync(EXPERIENCE_DIR)) return [];
  return fs
    .readdirSync(EXPERIENCE_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

