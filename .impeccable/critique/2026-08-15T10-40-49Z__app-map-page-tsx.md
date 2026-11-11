---
target: the map
total_score: 25
max_score: 36
na_heuristics: 9
p0_count: 0
p1_count: 3
timestamp: 2026-08-15T10-40-49Z
slug: app-map-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser evidence, isolated)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | The stage index gives extent and a jump, but nothing marks the current stage across a 3,442px scroll |
| 2 | Match System / Real World | 2 | The h1 promises "every stage of a matter"; stage 1 is Homepage and stage 9 is Internship — site nodes, not stages of a civil matter |
| 3 | User Control and Freedom | 3 | Jump nav, Escape restores focus, native select, no traps |
| 4 | Consistency and Standards | 3 | The menu box now reads as a control, but seven boxes with distinct labels share one destination |
| 5 | Error Prevention | 2 | Nothing signals that High Court, Trial Courts, Supreme Court, Bare Acts, SC citations and HC citations all land on /library |
| 6 | Recognition Rather Than Recall | 3 | Summaries render now; the ref convention is explained once, ~2,000px above where it is last used |
| 7 | Flexibility and Efficiency | 3 | The index is a real accelerator; still no filter by product or role across 92 focusable elements |
| 8 | Aesthetic and Minimalist Design | 3 | Disciplined, undercut by product chips stranded in the right column on desktop |
| 9 | Error Recovery | n/a | Read surface, no failable input; the select cannot produce an invalid state |
| 10 | Help and Documentation | 3 | The intro earns its place; the `unread` affordance is fully built and used zero times |
| **Total** | | **25/36** | **Acceptable (69%), one point off Good** |

Heuristic 9 scored n/a; total renormalised to 36. Previous run: 21/36.

## Design Specificity Verdict

**LLM assessment — authored at the content layer, generic at the composition layer.** The specific things are genuinely specific: the picker resolving Goa to the *Bombay High Court* is a fact only an Indian litigation product knows, and it is delivered as an answer rather than a label; the `ref` codes carried from a real sketch; the menu box's divided compartment borrowing court-form vocabulary; seal reserved for CTA and annotation.

But the composition — numbered spine, title, summary, wrapped row of ruled boxes, right-floated tag chips — is a stock process layout. Swap the nine labels for onboarding steps or a supply chain and nothing breaks. The specificity is in what is written in the boxes, not in how they are arranged.

**Deterministic scan — clean, and proven to fire.** 0 findings on `app/map/page.tsx` + `components/map`; 0 on `app/documents` + `app/internship` + `components/film`. A control run over `app components` returned 1 finding (`side-tab` at `components/home/ProductShowcase.tsx:75`), so the clean results are meaningful rather than a silent no-op.

**Browser evidence confirms the previous round's fixes landed, and finds one regression.** Measured: **0 duplicate accessible names** and **0 unnamed** across 54 interactive elements — the six-identical-"Legal Library" problem is gone, with `aria-label` disambiguating by stage. **70 real Tab presses, every element with a visible 2px focus ring.** **0 tap targets under 44px** in page content at both widths. No horizontal overflow. **0 console errors or warnings.** Under `prefers-reduced-motion` every map element resolves to opacity 1 and identity transform — nothing stranded.

One contrast failure remains, and it is new:

| Element | fg / bg | Ratio | |
|---|---|---|---|
| **BoxMenu ref "7C"** | `#717479` / `#f2f1ec` | **4.15** | fail |
| Every other box ref ("2A" …) | `#3a3f49` / `#f2f1ec` | 9.34 | pass |

`components/map/BoxMenu.tsx:80` still carries `text-ink-soft/70`. The previous pass cleared that alpha from `app/map/page.tsx` but BoxMenu keeps its own copy of the ref span, so one of thirty-one refs was left behind. An exhaustive sweep confirmed it is the only value under threshold; the next lowest is 6.26.

**Visual overlays: none.** The browser is headless, so these are CDP measurements, not an injected overlay.

## A correction to Assessment A

A raised a P0 that the closing CTA — "Every document above has a page of its own" — is false, counting 13 of 31 boxes pointing at `/documents/*`.

Checked against the data: the claim is about **documents**, and every document on the map has a page — Plaint, Written statement, Counter-claim, Rejoinder, Issues, Affidavit, Petition, Examination-in-chief, Cross-examination, Oral arguments, Written arguments. The other boxes are forums and sources (High Court, Bare Acts, SC citations), not documents. The sentence is true as written.

It is still worth tightening, for exactly the reason it was flagged: a careful reviewer read it as a claim about every box. The other half of A's finding — seven boxes resolving to one destination — is confirmed and carried below as P1.

## Overall Impression

The page has moved from "a finished diagram of something you are assumed to understand" to one that explains itself: summaries render, the hierarchy is right way up, the picker answers a real question, and the accessibility measurements are now essentially clean. What is left is not polish — it is two structural questions the surface has been deferring. Whether stages 1 and 9 belong in a sequence titled "every stage of a matter", and what a box means when seven of them go to the same place.

## What's Working

1. **The picker answers the question behind the question.** Naming a state is trivia; naming the High Court that hears your writ is what a litigant cannot derive — Goa is Bombay, Puducherry is Madras, Chandigarh is Punjab and Haryana. The optgroup split preserves a constitutional distinction a flat list would erase, and it gets the platform picker free on mobile.
2. **The menu box's divided cell.** In a row of pixel-identical link boxes, a bare chevron was a 10×6px difference nobody discovers before clicking. A bordered compartment makes "this is a control" legible at rest, in the grammar of a court form.
3. **The motion contract holds under measurement.** All nine stages reach opacity 1 when scrolled to, and reduced motion returns every one of them to opacity 1 with identity transform rather than stranding them at 0 — the exact failure mode scroll-driven timelines usually produce.

## Priority Issues

**[P1] Seven boxes, one destination.** High Court, Trial Courts, Supreme Court, Bare Acts, SC citations and HC citations all resolve to `/library`; Shisho.in and About Shisho both resolve to `/`.
*Why it matters:* the page's contract is that each box leads somewhere. Clicking three differently-labelled boxes and landing on the same page three times teaches the reader that boxes are decorative — and it fails silently, so nothing announces the repetition.
*Fix:* deep-link them so they are genuinely distinct (`/library?court=sc`, `?type=bare-acts`), or drop the link and render those as plain shells — the non-link code path already exists.
*Suggested command:* `/impeccable shape`

**[P1] The frame does not match the content.** The h1 says "Every stage of a matter, in order." Stage 1 is Homepage (Shisho.in, About Shisho) and stage 9 is Internship. Those are site nodes inside a sequence that claims to be litigation.
*Why it matters:* a litigator scanning for the lifecycle hits a category error in the first row and rounds the whole page down to marketing.
*Fix:* either retitle the page to what it actually maps, or lift stages 1 and 9 out of the numbered spine into framing rails, leaving seven true stages. This is a content decision, not a defect.
*Suggested command:* `/impeccable shape`

**[P1] Product chips are stranded on desktop.** `sm:ml-auto` throws SHISHO / LEGAL LIBRARY / COURSES to the far right, 400–600px from the stage they modify; stage 8's lone chip floats beside nothing.
*Why it matters:* proximity is the strongest grouping cue available, and distance reads as "unrelated". Mobile, where they sit under the title, is the better layout — the desktop rule is the regression.
*Fix:* drop `sm:ml-auto` and place the chips under the summary at both widths.
*Suggested command:* `/impeccable layout`

**[P2] One contrast failure, newly introduced.** `BoxMenu.tsx:80` keeps `text-ink-soft/70` on the 7C ref: 4.15:1 where every sibling ref measures 9.34:1.
*Suggested command:* `/impeccable polish`

**[P2] The closing heading reads as a tenth stage.** "Start at the stage you are on." is an `h2` sibling to the nine stage `h2`s, so a screen-reader heading list returns ten flat stages.
*Fix:* give the stage list its own heading and push stages to `h3`, or move the CTA heading into its own landmark.
*Suggested command:* `/impeccable harden`

**[P3] No current-stage indicator.** Nine jump chips, none marked active during a 3,442px scroll (5,327px on mobile).
*Fix:* IntersectionObserver setting `aria-current` on the matching chip.
*Suggested command:* `/impeccable animate`

## Persona Red Flags

**Alex (impatient power user)** — clicks Supreme Court, High Court and Trial Courts in sequence, lands on `/library` all three times, and stops trusting boxes. 92 focusable elements with no filter to collapse the map to just the documents he can draft.

**Jordan (confused first-timer)** — stage 1 "Homepage" breaks the mental model on arrival, before the spine has earned anything. Nothing visually separates a box that opens a document page from one that goes to a shared index, so no click is predictable.

**Sam (screen reader / keyboard)** — measurably good now: 0 unnamed elements, 0 duplicate names, a visible focus ring on all 70 tab stops, and Enter on the Arguments button opening a panel whose items are reachable and 44px tall. The one flaw is the heading list: ten flat `h2`s where the last is a call to action, not a stage.

## Minor Observations

- The state `<select>` uses `rounded-seal` while every other element on the page is hard-cornered — the only rounded object in the composition.
- The `unread` dashed-box mechanism is fully built, documented, and used zero times, so one of the page's better ideas is invisible. Its explanation also lives only in a `title` attribute, unreachable by keyboard.
- `Thesis` (4C) and the `Courses` chip both point at `/courses` — adjacent, differently named, same destination.
- The spine never visually touches a box, so it reads as a margin rule rather than a connector.
- Mobile opens on 252px of jump chips before any content, and they interrupt the title → summary reading order.
- Header and footer carry 23 sub-44px tap targets at 1280. Shared chrome, not this page, but they are the only remaining target failures on the site.

## Questions to Consider

1. If stage 1 is Homepage and stage 9 is Internship, is this the lifecycle of a matter, or the sitemap of shisho.in wearing a matter's clothes? Which one does a litigator need?
2. Seven boxes land on `/library`. What is a box *for*, if not a distinct destination — and if the answer is "to show the shape", why is it a link at all?
3. The intro tells the reader this was transcribed from an original sketch. Who is that provenance for? A junior advocate does not care that it came from paper; she cares whether it is right.
