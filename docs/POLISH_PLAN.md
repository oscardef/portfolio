# Polish plan (31 Oct 2026)

Audit of the live v2 site, and the pass that follows from it. Facts come from
the knowledge hub and `applications/context`; nothing here invents a claim.

## Audit

- No console errors. Page weight is modest: ~146 KB JS, 56 KB fonts, ~270 KB
  images on first view; the globe loads lazily (~50 KB gzipped).
- Childhood chapters on the route (Bangkok to Dubai) are mostly empty space:
  a short photo, one line, then a long gap so the globe has scroll room.
- The globe column is a blank box until its code loads.
- The "Now" card in At a glance has dead space under its text.
- No skills overview. The old site had one and recruiters look for it.
- The globe paints its colours with `oklch()` strings on a canvas. Older
  Safari and Firefox don't parse those, which would leave the route invisible.
- The favicon is the old design's indigo "O" on near-black.
- Stray iCloud duplicates (`page 2.tsx`) appear in the working tree.

## Changes

1. **Hero:** a location line with a pin (Basel, Switzerland), as the old site
   had, above the name.
2. **At a glance:** a "Toolbox" card with the old site's skill groups
   (languages, systems, ML, backend and tools); the "Now" card gains the
   supervisors (Prof. Sai Reddy at ETH, Prof. Maria Brbic at EPFL).
3. **Route:** childhood chapters get an "aged x to y" note and less empty
   space; a faint placeholder circle shows where the globe will appear.
4. **Globe colours** computed to hex in JS, so the route draws in every
   browser that has a canvas.
5. **Favicon** redrawn in the new navy and accent.
6. **Housekeeping:** remove the iCloud duplicates; keep lint, typecheck and
   build green; verify in Chrome at desktop and phone width, both themes.

Out of scope (not mine to decide): a CV download, an availability line,
redirecting `defrancesca.com`, replacing the stand-in place photos.

## Follow-up (31 Oct 2026)

- **Wider page:** the container grows from 76rem to 90rem and the side gutter
  tops out at 4rem instead of 5.5rem, so on a ~1500px screen the content is
  about 1400px wide instead of 1040px. The hero name and portrait scale up on
  wide screens; long text in the experience cards stays under 75ch.
- ESLint ignores `.next.nosync`, the real build folder behind the `.next`
  symlink.

## Second pass (31 Oct 2026)

- **Route:** once the globe settles beside the chapters, a fade stops lines
  heading off-screen from running under the chapter text.
- **Now card:** the thesis question sits beside the description, set in the
  serif used for place names, instead of leaving half the card empty.
- **Project and experience pages** (as visited from the CV): title first,
  a wider hero, and the facts in a sticky side column next to the write-up.
  The sheet keeps its single column.
- **Beyond the work:** the interests get photos, styled like the route's
  places (stand-ins from Wikimedia Commons, credited on the page).
- **404:** rewritten in the site's layout with a way back to the projects.
- The teaching role says "hundreds of students", like the rest of the site.
- Image `sizes` hints updated for the wider layout, so photos stay sharp.

## Third pass (15 Nov 2026)

Oscar's two lists that day, plus what followed from them.

- **No rainbow:** the route's hue ramp is gone. The portrait has a plain
  hairline frame, and the stop markers and social image use the accent.
  The globes use two colours: teal for places lived, the accent for places
  visited (Oscar: the map may use more colours where it helps).
- **At a glance:** each card's label is a heading with an icon; Education
  shows the EPFL and Groningen logos; languages and citizenship are two
  short lists with flags; Recognition is a list.
- **Wording:** "maths" is "mathematics" everywhere; Bloomberg is described
  as a six-month placement.
- **The route** keeps its name; its subheading says it is everywhere Oscar
  has lived. The IB Diploma, BSc and MSc rows show logos (ISSR's from the
  file Oscar sent, cropped to its letters so it reads in a small tile).
- **Smoother scrolling:** the globe's camera follows a spring, so a new
  place mid-flight bends the motion instead of restarting it. Side trips
  only fly out when their row is rested on (500 ms) or pointed at (220 ms),
  not when scrolled past. The canvas no longer redraws on every scroll
  event or runs a permanent loop for the pulsing ring (now CSS), and it
  draws without canvas shadows. Hover states ease in over 300 ms.
- **Places globe:** US states are drawn; the whole country is lit and the
  states visited are lit again on top. A legend says what the colours mean.
  The November 2026 trip (Las Vegas, New York City) is added.
- **Photos:** the credits are off the photos. The stand-ins were swapped
  for CC0 (public domain) photos, which need no credit, until Oscar's own
  replace them.
- **Contact:** rebuilt as a panel with a portrait, an email button, a copy
  button and rows for email, LinkedIn and GitHub.
- **Experience list:** each role shows its one-line summary; small logo
  tiles use marks that stay legible.
- **`scripts/geocode.ts`** no longer picks up the examples in `travel.ts`'s
  header or re-sorts the cache, so a run only adds the new places.

Still not mine to decide: a CV download, an availability or work-rights
line.
