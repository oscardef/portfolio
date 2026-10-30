import { z } from 'zod';

// Kind of work, used to group items in the journey's "by kind" view
export const kindEnum = z.enum(['systems', 'ml', 'hardware', 'products', 'teaching']);
export type Kind = z.infer<typeof kindEnum> | 'study';

// Fields shared by projects and experiences that place them on the journey
const journeyFields = {
  // Route stop id from src/data/route.ts; items without one stay off the journey
  chapter: z.string().optional(),
  kind: kindEnum,
  // One line for the journey row
  blurb: z.string(),
};

export const projectSchema = z.object({
  ...journeyFields,
  title: z.string(),
  slug: z.string(),
  date: z.string(),
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
  images: z
    .array(
      z.object({
        src: z.string(),
        alt: z.string(),
        caption: z.string().optional(),
      })
    )
    .default([]),
  highlights: z.array(z.string()).default([]),
  role: z.string().optional(),
  teamSize: z.number().optional(),
  organization: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['shipped', 'prototype', 'research', 'coursework']).optional(),
  relatedExperience: z.array(z.string()).default([]),
});

export type Project = z.infer<typeof projectSchema>;

const experienceTypeEnum = z.enum(['internship', 'teaching', 'research', 'fulltime']);

export const experienceSchema = z.object({
  ...journeyFields,
  title: z.string(),
  slug: z.string(),
  organization: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  type: z.union([
    experienceTypeEnum.transform((v) => [v]),
    z.array(experienceTypeEnum),
  ]),
  summary: z.string(),
  stack: z.array(z.string()),
  highlights: z.array(z.string()).default([]),
  logo: z.string().optional(),
  links: z
    .object({
      company: z.string().optional(),
    })
    .default({}),
  relatedProjects: z.array(z.string()).default([]),
});

export type Experience = z.infer<typeof experienceSchema>;
