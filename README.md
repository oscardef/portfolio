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
- **Zod** for content schema validation
- **d3-geo** and **world-atlas** for the maps, projected at build time
- **React View Transitions** for the sheets and the place/kind rearrangement
- **Shiki** for syntax highlighting

The home page is one scrolling page built around the route: every place lived,
in order (`src/data/route.ts`). Projects and experiences open as sheets over it
via intercepting routes, and still render as full pages when visited directly.

## Adding Content

Projects go in `content/projects/<slug>.mdx`, experiences in `content/experience/<slug>.mdx`. See existing files for the expected frontmatter format. Hero images go in `public/images/projects/<slug>/hero.png`. See `CONTENT_GUIDE.md` for every field, including `chapter`, `kind` and `blurb`, which place an entry on the route.

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
