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
- **Framer Motion** for animations
- **Zod** for content schema validation
- **Shiki** for syntax highlighting

## Adding Content

Projects go in `content/projects/<slug>.mdx`, experiences in `content/experience/<slug>.mdx`. See existing files for the expected frontmatter format. Hero images go in `public/images/projects/<slug>/hero.jpg`.

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
