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

## Fourth pass (15 Nov 2026, evening)

Oscar's notes after seeing the third pass live.

- **Menu links scroll.** Projects and Experience go to their sections on
  the home page, like the others, in the order the page has them. The
  `/projects` and `/experience` pages stay, reached from "All 10 projects"
  and "Experience in detail".
- **Less space.** Every home section uses the `.section` class: 4.5rem
  above and below on wide screens (was 7 to 8rem), 2.75rem on phones. A
  menu link lands with the section's title just under the bar. The index
  and detail pages start closer to the bar too.
- **Selected projects** are six, in three columns of smaller cards (a
  thumbnail row each on phones). The six are the four the CV links to
  (OptiFlow, LLMs from scratch, solar forecasting, the research platform)
  plus Mathium and the stock market simulation, chosen for software
  engineering and quant developer roles. `featured: true` in a project's
  frontmatter puts it there.
- **Choosing a country** on the places globe flies in closer, framed on
  the country's largest landmass plus any place visited off it, and
  outlines it with a soft glow and a lighter fill. On phones the globe
  now stays in view while the list scrolls.
- **Short side trips** (Veldhoven from Groningen) zoom in far enough that
  both ends sit well apart; the trip's dots show up on a lit country.

## Fifth pass (16 Nov 2026)

Oscar: "any other polish you deem good", with full freedom.

- **Bug: a menu link worked only once.** After "Projects", the address ended
  in `#work`, so a second click was a link to where the page already was
  and did nothing. `SectionLinks` now scrolls on every click (and the logo
  scrolls to the top).
- **Bug: closing a project or role jumped the page.** With a hash in the
  address, going back from a sheet scrolled to that section again. The
  address is now kept free of hashes; a shared `/#places` link still works
  and drops its hash once the page has scrolled.
- **Smooth scrolling moved from CSS to script**, so opening another page or
  a deep link no longer animates from wherever the last page was.
- **Contrast:** white on the accent was 3.9:1; the dark theme's accent is a
  shade deeper (4.7:1). The light theme's pale accent text and "lived" tags
  now pass 4.5:1 too. An axe audit of the home page is clean in both themes.
- **Beyond the work:** an opening line set large, three short notes with
  headings (linking to Mathium and the LauzHack project), and the interest
  photos carrying their own captions.
- **Phones:** four selected projects, then "All 10 projects"; the links to
  the full lists sit under their lists as buttons; roles put the
  organisation on its own line; the country list starts with eight and
  unfolds; the menu has larger rows, a "Get in touch" button and closes on
  a tap outside or Escape.
- `/projects` uses the same compact cards as the home page.
- The places globe shows a placeholder disc while its code loads.

## Sixth pass (16 Nov 2026)

Oscar: a deep analysis of everything, "make it incredible, be innovative".

Found and fixed:

- **Link previews were wrong.** `/projects` and `/experience` carried the home
  page's title and address; project pages had the home page's Twitter title;
  role pages had no picture at all. Every page now has its own tags, and each
  project and role has its own card image.
- **Phones:** project pages with a "More from" list were wider than the
  screen; At a glance overflowed at 320 px. Every page is now checked at 320,
  360 and 390 px.
- **Tablets:** "What I work on" was three unreadable columns in half a row;
  the interest photos' captions collided with their titles.
- **Dead links:** the ETH lab's site (`sysbio.ethz.ch` no longer resolves) and
  Securrency's (acquired by DTCC in 2023; the write-up says so now).
- **Accessibility:** heading order on `/projects`, a nested landmark on detail
  pages, and the count in the chosen filter. axe is clean on eight kinds of
  page, a sheet and the palette, in both themes.
- Write-up headings are in sentence case like the rest of the site; callouts
  use the site's accent instead of four stock colours; the web manifest had
  the old site's colours; standard response headers added.

New:

- **Search palette** (`/` or Ctrl/Cmd+K, and a button in the menu): sections,
  projects, roles, and a few actions.
- **The places globe can be pointed at and clicked.** It names the country
  under the pointer and stops turning while the pointer is over it. A click
  zooms in on the country exactly as choosing it from the list does; the
  page stays where it is, and the country's name and places show on the
  globe.
- **The route's timeline** replaces the dots: one segment per home, as wide as
  the years lived there.
- **Write-ups:** images open large on a click; a page outline beside long
  ones; "More from Lausanne" and "Next project" at the end, which swap the
  sheet's content in place; a short author strip for visitors arriving from a
  CV link.
- **Small live details:** a bar showing how far through the thesis today
  is, and the month the site was last built in the footer.
- **Work rights:** "Free to work in the EU, Switzerland and the US" under
  citizenship (Oscar's go-ahead, 16 Nov 2026). No CV download (his call).
- "Systems" in At a glance opens the Bloomberg role, the strongest systems
  work, instead of a filter with one coursework project.

## Route on phones (17 Nov 2026)

Oscar: on a phone the globe only moved on to a place once that place was
being scrolled away.

- The trigger was the middle of the screen, which on phones sits under the
  pinned globe, so a chapter took over only as it slid out of sight. On
  phones and tablets the line is now at 76% of the screen's height, the
  middle of the space below the globe; side by side it is still the middle.
- The chapter in focus is worked out from where the chapters are on each
  scroll, not from enter and leave events, so it is right after a jump from
  the menu or a tap on the timeline too.
- A second cause, found while testing: mid-flight the globe's place label
  could sit far outside its box, which made the whole page wider than a
  phone's screen for a moment and threw the trigger off. The label is now
  clipped to the globe's box.

## Seventh pass (17 Nov 2026)

Oscar: make the logos playable on a phone, fix the contact card on a phone,
and anything else worth doing.

- **The logo row does something.** Each logo opens what was done there: a
  role as a sheet, a university as its chapter on the route. Pointing at a
  logo, focusing it or touching it lights it with a glow and names the role
  underneath; on a phone a finger can slide along the row to move the light.
  The first time a phone shows the row, the light runs along it once. On
  phones the logos sit in a two-column grid instead of a ragged stack.
- **Contact card:** the main button is full width on phones; the copy
  button moved into the corner of the email row, so it no longer hangs
  under the button on its own.
- **Phone header** names the section in view ("oscar. / The route").
- **Write-ups:** a Share button (the phone's share sheet, or Copy link),
  a reading time beside the date, and the facts in two columns on phones.
- **The thesis bar** says which week it is ("Week 7 of 26").
- **The route** says how far the moves add up to (about 32,000 km).
- **Fixes:** the places search was 15 px, so iPhones zoomed the page when it
  got focus (now 16 px on phones); cards and rows give way slightly when
  pressed, since touch screens get no hover feedback; a long press on a logo
  no longer opens iOS's image preview; the 404 page offers the search.
- Structured data now lists languages and citizenship.

## Logo row, simplified (17 Nov 2026)

Oscar, after trying the seventh pass on his phone: the glow looked bad, and
tap-to-open with hold-to-glow felt strange; the simple brightening was enough.

- The logos are back to the plain effect: 60% white, full white when pointed
  at with a mouse. On a phone a tap does the same (a second tap, or a tap on
  another logo, moves it). No glow, no captions, no links, no animation.
- The two-column grid on phones stays.
- Follow-up (Oscar): on a desktop a click made a logo stay bright, which felt
  like the logos were meant to be clicked. Mouse clicks are now ignored;
  only touch taps light a logo.
