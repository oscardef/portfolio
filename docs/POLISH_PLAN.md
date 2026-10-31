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
