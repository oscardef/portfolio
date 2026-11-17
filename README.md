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
  pointed at with a mouse or tapped on a touch screen; a mouse click does nothing.
- `/projects` and `/experience` list everything. Projects and roles open as sheets over whichever page
  you're on (intercepting routes in `src/app/@sheet`) and render as full pages when visited directly.

## Analytics and search

- **Visitor analytics:** Umami (cookieless) on Oscar's server, stack `/opt/stacks/umami` on m70q. The site
  serves the tracker itself (`public/v/s.js`, refreshed with `scripts/update-tracker.sh`) and posts to its own
  `/v/e` (`src/app/v/e/route.ts`), which passes visits on with Vercel's location headers. Only production
  builds on oscar.defrancesca.com count (`src/components/site-analytics.tsx`).
  - Recorded besides page views: contact clicks (`Contact`), links out (`Outbound`), home sections reached
    (`Section`), the share button (`Share`).
  - Add `?ref=<name>` to a link you send (e.g. `?ref=acme`) to see when that link is opened.
  - Open any page with `?notrack` once on your own devices to stop counting them (`?track` undoes it).
  - Vercel Web Analytics and Speed Insights stay on as well.
- **Search:** each page has its own title, description, canonical address and preview card; structured data
  (`src/lib/structured-data.ts`) describes the person, the site, the home page as a profile page and a
  breadcrumb trail on every other page. `sitemap.xml` lists every page with images, `llms.txt` summarises the
  site for AI assistants, and `.github/workflows/indexnow.yml` tells Bing after each production deploy. The
  production build redirects `*.vercel.app` to the real domain.

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
