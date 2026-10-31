# oscar.defrancesca.com

My personal portfolio — built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

```bash
npm install
npm run dev
```

## Stack

- **Next.js 16** (App Router, static generation)
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **MDX** via next-mdx-remote for project & experience write-ups
- **d3-geo** and **world-atlas** for the globe, drawn on a canvas
- **React View Transitions** for the project and role sheets
- **Zod** for content schema validation
- **Shiki** for syntax highlighting

## Structure

- `/` is one page: an introduction and summary, selected projects, experience, then "The route" (a
  scroll-driven globe of every place lived, `src/data/route.ts`), places visited, interests and contact.
- `/projects` and `/experience` list everything. Projects and roles open as sheets over whichever page
  you're on (intercepting routes in `src/app/@sheet`) and render as full pages when visited directly.

## Adding Content

Projects go in `content/projects/<slug>.mdx`, experiences in `content/experience/<slug>.mdx`. See existing files for the expected frontmatter format. Hero images go in `public/images/projects/<slug>/hero.jpg`.

The photos of places (`public/images/places`) and interests (`public/images/interests`) are freely licensed stand-ins from Wikimedia Commons. To use your own, replace a file under the same name and remove its credit (in `src/data/route.ts` for places, `src/app/page.tsx` for interests).

Run `npm run build` after adding content — the build will fail if frontmatter doesn't match the schema.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript checks |
| `npm run format` | Prettier formatting |

## Deployment

Deployed on [Vercel](https://vercel.com) at [oscar.defrancesca.com](https://oscar.defrancesca.com).
