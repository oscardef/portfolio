# Content Guide

How to add new projects, experiences, and other content to the portfolio site.

---

## File Structure

```
content/
├── projects/       # Project write-ups (MDX)
└── experience/     # Work experience entries (MDX)
```

Each `.mdx` file = one page. The filename becomes the URL slug.

---

## Adding a New Project

### 1. Create the file

```
content/projects/{slug}.mdx
```

### 2. Frontmatter template

```yaml
---
title: "Project Title"
slug: "project-slug"            # Must match filename
date: "2025-01-15"              # YYYY-MM-DD, used for sorting
type: "school"                  # school | personal | company
featured: true                  # Show on home page (top 4 by date)
summary: "One-paragraph summary for cards and meta descriptions."
tags: ["ml", "web"]             # From tag taxonomy (see below)
stack: ["Python", "PyTorch"]    # Technologies used
links:
  github: "https://github.com/..."
  demo: ""                      # Live demo URL
  paper: ""                     # PDF or arXiv link
  video: ""                     # YouTube/Vimeo
  blog: ""                      # Blog post
heroImage:                      # Optional large header image
  src: "/images/projects/slug-hero.png"
  alt: "Description of image"
images:                         # Optional inline images
  - src: "/images/projects/slug-fig1.png"
    alt: "Figure 1"
    caption: "Optional caption"
highlights:
  - "Key achievement or result #1"
  - "Key achievement or result #2"
role: "Individual project"      # Optional
teamSize: 1                     # Optional
organization: "EPFL"            # Optional
location: "Lausanne, Switzerland" # Optional
status: "shipped"               # shipped | prototype | research | coursework
relatedExperience: ["asml"]     # Slugs of related experience entries
---
```

### 3. Body content

Write standard Markdown below the frontmatter. Available components:

```mdx
## Section Heading

Regular paragraph text.

<Callout type="info" title="Note">
  Important information here.
</Callout>

<FloatingImage
  src="/images/projects/my-figure.png"
  alt="Description"
  caption="Figure 1: Architecture diagram"
  side="right"
/>

Text wraps around the floating image above.

<Gallery images={[
  { src: "/images/projects/a.png", alt: "Screenshot A" },
  { src: "/images/projects/b.png", alt: "Screenshot B" },
]} />

<VideoEmbed url="https://youtube.com/embed/..." title="Demo Video" />

<MetricRow metrics={[
  { label: "Accuracy", value: "94.2%" },
  { label: "Latency", value: "< 50ms" },
]} />

<DiagramBlock title="System Architecture">
  Content rendered inside a styled card.
</DiagramBlock>
```

---

## Adding a New Experience

### 1. Create the file

```
content/experience/{slug}.mdx
```

### 2. Frontmatter template

```yaml
---
title: "Job Title"
slug: "company-slug"            # Must match filename
organization: "Company Name"
location: "City, Country"
startDate: "2024-01"            # YYYY-MM
endDate: "2024-06"              # YYYY-MM
type: "internship"              # internship | fulltime | teaching | research
summary: "One-paragraph description of the role and impact."
stack: ["Python", "Docker", "PostgreSQL"]
highlights:
  - "Key achievement #1"
  - "Key achievement #2"
links:
  company: "https://company.com"
relatedProjects: ["project-slug"]  # Slugs of related project entries
---
```

### 3. Body structure

Recommended sections for experience entries:

```mdx
## Context

Brief description of the company/team and your role.

## What I Did

- Detailed bullets or paragraphs about your contributions
- Technical details, architecture decisions, etc.

## Impact

Measurable outcomes, metrics, or delivered results.

## What I Learned

Key takeaways, skills gained, perspectives shifted.
```

---

## Tag Taxonomy

Use these tags for projects. They're used in the filter bar.

| Tag | Description |
|-----|------------|
| `ml` | Machine learning, deep learning |
| `llm` | Large language models |
| `nlp` | Natural language processing |
| `cv` | Computer vision |
| `rl` | Reinforcement learning |
| `probabilistic` | Bayesian methods, uncertainty |
| `forecasting` | Time-series prediction |
| `web` | Web applications |
| `backend` | Server-side, APIs |
| `frontend` | Client-side UI |
| `fullstack` | End-to-end web apps |
| `systems` | Systems programming, OS |
| `concurrency` | Threading, parallelism |
| `distributed` | Distributed systems |
| `cloud` | Cloud infrastructure |
| `devops` | CI/CD, deployment |
| `data` | Data engineering, pipelines |
| `blockchain` | Smart contracts, DeFi |
| `robotics` | Hardware + software |
| `embedded` | Microcontrollers, IoT |
| `security` | Crypto, security |
| `hpc` | High-performance computing |
| `visualization` | Data viz, dashboards |
| `mobile` | iOS, Android |
| `compiler` | Compilers, interpreters |
| `networking` | Network protocols |
| `database` | Database systems |
| `api` | API design |

---

## Images

Place all images in `public/images/projects/`:

```
public/images/projects/
├── {slug}-hero.png       # Hero image (1200×600 recommended)
├── {slug}-fig1.png       # Inline figures
└── {slug}-screenshot.png # Screenshots
```

Supported formats: PNG, JPG, WebP, AVIF (auto-optimized by Next.js).

---

## Cross-Linking

Projects and experiences can reference each other:

- **Project → Experience**: Add `relatedExperience: ["experience-slug"]` to project frontmatter
- **Experience → Project**: Add `relatedProjects: ["project-slug"]` to experience frontmatter

These render as linked cards at the bottom of detail pages.

---

## AI Content Workflow

When using an AI agent to create content from an existing repository or project:

### Steps

1. **Provide context**: Share the repository URL, README, or key files
2. **Use this template**: Point the agent to this guide for schema reference
3. **Review frontmatter**: Verify slug, dates, tags, and links are accurate
4. **Review body**: Ensure technical details are correct and tone is consistent
5. **Add images**: Screenshots, architecture diagrams, or demo recordings
6. **Build check**: Run `npm run build` to verify no schema errors

### Prompt template for AI agents

```
Read the repository at [URL] and create an MDX file for my portfolio.

Follow the schema in CONTENT_GUIDE.md. Use the project template.
Key details:
- Slug: [desired-slug]
- Type: [school/personal/company]
- Tags: choose from the taxonomy
- Write 3-4 highlights as bullet points
- Body: Overview, What I Built, Technical Details, Results/Impact sections
- Tone: technical but accessible, first-person, concise
```

---

## Build & Validation

```bash
# Type-check + lint + build
npm run build

# Format code
npm run format

# Dev server
npm run dev
```

Content errors (missing required fields, invalid types) will fail the build with descriptive Zod validation errors.
