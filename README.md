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
- The globes use two colours: teal for places lived and the accent for places visited. On the places
  globe the United States is lit as a whole and the states visited are lit again on top: give a US
  entry in `src/data/travel.ts` a `state` and that state lights up (shapes in
  `src/data/us-states-110m.json`, from Natural Earth).
- The menu links scroll to sections of the home page (`src/components/section-links.tsx` makes them work
  on every click and keeps hashes out of the address).
- A search palette (`/` or Ctrl/Cmd+K, `src/components/command-palette.tsx`) jumps to any section,
  project or role; its list is built from the content files in `src/app/layout.tsx`.
- Each project and role has its own link-preview card, drawn at build time (`src/lib/og.tsx`), and its
  own title and description in the preview tags (`src/lib/metadata.ts`).
- Images in a write-up open large on a click (`src/components/zoomable.tsx`).
- The logos under the hero (`src/components/org-strip.tsx`, list in `src/app/page.tsx`) brighten when
  pointed at with a mouse or tapped on a phone; nothing more.
- `/projects` and `/experience` list everything. Projects and roles open as sheets over whichever page
  you're on (intercepting routes in `src/app/@sheet`) and render as full pages when visited directly.

## Adding Content

Projects go in `content/projects/<slug>.mdx`, experiences in `content/experience/<slug>.mdx`. See existing files for the expected frontmatter format. Hero images go in `public/images/projects/<slug>/hero.jpg`.

The photos of places (`public/images/places`) and interests (`public/images/interests`) are stand-ins released under CC0 (public domain), so they need no credit. To use your own, replace a file under the same name (places are 1600 px wide, interests 1200 px) and update its `alt` text in `src/data/route.ts` or `src/app/page.tsx`.

Logos live in `public/images/logos`. Small tiles use a mark where the full logo would be too small to read (`ugroningen-crest.svg`, `researchable-mark.svg`, `securrency-mark.png`, `issr-mark.png`). Degree logos are set with `logo` on the entries in `studyItems` in `src/data/route.ts`.

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
