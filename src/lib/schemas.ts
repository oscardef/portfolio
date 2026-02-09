import { z } from 'zod';

// ── Project frontmatter schema ──────────────────────────────────────────────
export const projectSchema = z.object({
  title: z.string(),
  slug: z.string(),
  date: z.string(), // YYYY-MM-DD
  type: z.enum(['school', 'personal', 'company']),
  featured: z.boolean().default(false),
  summary: z.string(),
  tags: z.array(z.string()),
  stack: z.array(z.string()),
  links: z
    .object({
      github: z.string().optional(),
      demo: z.string().optional(),
      paper: z.string().optional(),
      video: z.string().optional(),
      blog: z.string().optional(),
    })
    .default({}),
  heroImage: z
    .object({
      src: z.string(),
      alt: z.string(),
    })
    .optional(),
  highlights: z.array(z.string()).default([]),
  role: z.string().optional(),
  teamSize: z.number().optional(),
  organization: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['shipped', 'prototype', 'research', 'coursework']).optional(),
});

export type Project = z.infer<typeof projectSchema>;

// ── Experience frontmatter schema ───────────────────────────────────────────
export const experienceSchema = z.object({
  title: z.string(),
  slug: z.string(),
  organization: z.string(),
  location: z.string(),
  startDate: z.string(), // YYYY-MM
  endDate: z.string(), // YYYY-MM or "present"
  type: z.enum(['internship', 'teaching', 'research', 'fulltime']),
  summary: z.string(),
  stack: z.array(z.string()),
  highlights: z.array(z.string()).default([]),
  links: z
    .object({
      company: z.string().optional(),
      relatedProject: z.string().optional(),
    })
    .default({}),
});

export type Experience = z.infer<typeof experienceSchema>;
