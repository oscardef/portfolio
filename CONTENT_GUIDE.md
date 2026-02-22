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

## Travel Data

Travel entries appear as markers on the 3D globe and in the searchable travel list.  
Data lives in `src/data/travel.ts`.

### Adding a place manually

Add an entry to the `rawTravelData` array:

```ts
{ place: 'Kyoto', country: 'Japan', startDate: '2025-03-20', purpose: 'travel', notes: 'Cherry blossom season' },
```

Then resolve coordinates:

```bash
npx tsx scripts/geocode.ts
```

This queries OpenStreetMap Nominatim (free, no key) and caches results in `src/data/geocode-cache.json`. Commit both files.

**Fields:**

| Field | Required | Format |
|-------|----------|--------|
| `place` | ✓ | City, island, region — whatever you'd call it |
| `country` | ✓ | Country name |
| `state` | | US states only — shown alongside country |
| `startDate` | ✓ | `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` |
| `endDate` | | Omit for day trips or ongoing stays |
| `purpose` | ✓ | `lived` · `travel` · `work` · `conference` · `study` |
| `notes` | | Short note (e.g. "Trip with Alina") |

### Bulk import from macOS Photos

The photo import pipeline reads GPS coordinates from your macOS Photos library (including iCloud-synced photos from your iPhone), clusters them into places, reverse-geocodes them, and generates travel entries — all with one command.

#### Quick start

```bash
# Import all photos
./scripts/import-photo-locations.sh

# Import only recent photos (e.g. after a trip)
./scripts/import-photo-locations.sh --after 2025-06-01

# Preview without modifying anything
./scripts/import-photo-locations.sh --after 2025-06-01 --dry-run
```

#### How it works

1. **Extract** — A Swift app (PhotoKit) reads GPS + date from every photo in your library. It runs as a signed `.app` bundle so macOS shows the standard "Allow access to Photos" permission dialog (no Full Disk Access needed).

2. **Cluster** — DBSCAN groups nearby photos (within 30 km) into spatial clusters. Clusters are then split into separate visits when there's a gap of 60+ days between photos.

3. **Geocode** — Each cluster center is reverse-geocoded via Nominatim (free, 1 req/sec rate limit). Place names are cleaned up automatically (e.g. "Sakhu" → "Phuket", municipality suffixes stripped).

4. **Deduplicate** — New locations within 30 km of any existing entry in `geocode-cache.json` are skipped, so you won't get duplicates when re-running.

5. **Review & append** — The script shows you the new entries and asks for confirmation before modifying `travel.ts`. It then runs `geocode.ts` to resolve coordinates.

#### All options

```
--after  YYYY-MM-DD    Only include photos after this date
--before YYYY-MM-DD    Only include photos before this date
--dry-run              Preview results without modifying travel.ts
--skip-extract         Skip photo extraction (reuse previous photo-records.json)
--radius-km N          Cluster radius in km (default: 30)
--gap-days N           Days gap to split visits (default: 60)
--min-samples N        Minimum photos to form a cluster (default: 2)
```

#### Prerequisites

- macOS with Photos app (iCloud photo library synced)
- Xcode Command Line Tools: `xcode-select --install`
- Python 3 with: `pip3 install scikit-learn numpy requests`

#### Pipeline files

| File | Purpose |
|------|---------|
| `scripts/import-photo-locations.sh` | One-command wrapper — run this |
| `scripts/extract-photos.swift` | Swift photo extractor (PhotoKit) |
| `scripts/process-photo-locations.py` | Python clustering + geocoding |
| `scripts/geocode.ts` | Coordinate resolver (runs after import) |

#### Customizing place name mappings

Edit the `PLACE_RENAMES` dict in `scripts/process-photo-locations.py` to:
- Rename places: `"Sakhu": "Phuket"` (local admin name → tourist name)
- Skip transits: `"Schiphol": None` (airport layovers you don't want)

#### Troubleshooting

- **"Photos access not authorized"** — Go to System Settings → Privacy & Security → Photos and grant access to PhotoExtractor. Or reset permissions: `tccutil reset Photos com.oscar.photo-extractor`
- **No new entries** — All detected locations already exist in your travel data. Try a narrower date range or lower `--radius-km`.
- **Wrong place names** — Add corrections to `PLACE_RENAMES` in `process-photo-locations.py` and re-run with `--skip-extract`.
- **Build artifacts** — The pipeline creates `scripts/.build/` with the app bundle and intermediate files. Clean with `rm -rf scripts/.build/`.

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
