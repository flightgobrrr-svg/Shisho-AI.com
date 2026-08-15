---
target: the map
total_score: 21
max_score: 36
na_heuristics: 9
p0_count: 0
p1_count: 3
timestamp: 2026-08-15T09-56-29Z
slug: app-map-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser evidence, isolated)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Nine stages over ~2,400px with no "you are here", no stage index, no progress mark |
| 2 | Match System / Real World | 3 | "Homepage" as stage 1 of a *matter* is a site artefact; stage 3 is titled "State" but holds only "Supreme Court" |
| 3 | User Control and Freedom | 3 | Escape closes the Arguments menu and restores focus; no way to collapse or filter 33 boxes |
| 4 | Consistency and Standards | 2 | Only 9 of 33 boxes carry a ref code; the menu box (7C) and a link box are near-identical at rest |
| 5 | Error Prevention | 3 | The `unread`/`?` convention is real prevention; duplicate boxes across stages 5 and 6 invite mis-clicks |
| 6 | Recognition Rather Than Recall | 2 | All nine `stage.summary` strings exist and none render on /map — verified |
| 7 | Flexibility and Efficiency | 2 | ~42 tab stops inside the list; no jump, search, or collapse |
| 8 | Aesthetic and Minimalist Design | 3 | Genuinely restrained; ~45% of the 1280 viewport is empty right-hand paper |
| 9 | Error Recovery | n/a | No input, fetch, validation or failure path exists on this surface |
| 10 | Help and Documentation | 1 | No legend for ref codes, dashed boxes, or chip-vs-box; the page never says what the map is for |
| **Total** | | **21/36** | **Acceptable (58%)** |

Heuristic 9 scored n/a and the total renormalised to 36.

## Design Specificity Verdict

**LLM assessment — authored, with one leak.** This is not swappable. The composition makes a specific claim: a matter is a sequence, so it gets a numbered vertical spine, square corners (`--radius-seal: 0px`, "court paper is cut"), Garamond over IBM Plex Mono, and a seal budget so tight the page spends none of it. The `unread` convention — dashed border plus a red `?` rather than an invented label — encodes a professional norm as a border style. The `<optgroup>` split of States from Union Territories, and the deliberate refusal to name a High Court's jurisdiction, are things only an Indian legal product would build.

The leak: the visible `2A` / `4C` / `7B` refs are the author's sketch numbering, not the user's vocabulary. They are the one element that reads as unfinished CMS output.

**Deterministic scan — clean, and proven to fire.** `detect.mjs` returned **0 findings** on `app/map/page.tsx` + `components/map`, and **0** on `app/documents` + `app/internship`. Both verified as genuine: no `.impeccable/` config exists to suppress rules, `--no-config` also returned empty, and a control run over `app components` returned 1 finding — `side-tab` ("Side-tab accent border") at `components/home/ProductShowcase.tsx:75` — proving the detector is live. That one finding is outside the reviewed scope.

**Browser evidence contradicts the review in places, and that matters.** Measured, not estimated: focus visibility is **perfect** (160 real Tab stops, every interactive element carrying a 2px `:focus-visible` outline); accessible names are **complete** (65 interactive nodes, 0 unnamed); heading order is **clean** (one h1, nine stage h2s, no skipped levels); **no horizontal overflow** at 375px; **0 console errors**.

Three contrast failures, all from one cause — `/70` alpha on `ink-soft`:

| Element | Ratio | |
|---|---|---|
| Box ref prefixes (2A/4C/7B) | **4.15** | fail |
| State-picker label | **3.97** | fail |
| State-picker helper text | **3.97** | fail |

**Visual overlays: none.** The browser is headless, so no user-visible overlay tab exists. Findings above are CDP measurements, not an injected overlay.

## Overall Impression

The map is the most product-specific thing on this site and the least explained. It reads as a finished diagram of something the visitor is assumed to already understand — which is exactly backwards for an audience that explicitly includes law students. The single biggest opportunity costs almost nothing: nine one-line summaries already exist in `lib/sitemap.ts`, are already rendered on the homepage, and are simply not printed here.

## What's Working

1. **The `unread` convention.** A dashed border and a seal `?` for any label that could not be read with confidence, sharing one rule with `lib/library.ts` citations. It turns "never present a guess as settled" into a visual primitive rather than a policy nobody can see.
2. **BoxMenu is a disclosure of links, not an ARIA menu.** It deliberately trades roving arrow keys for Tab order, Enter, and open-in-new-tab, and Escape returns focus to the trigger. An honest simple pattern beating a half-implemented complex one — and the measured focus behaviour confirms it works.
3. **The zero-JS reveal contract.** `animation-timeline: view()` with the resting rule visible and keyframes animating *from* hidden, so nothing is ever trapped at `opacity: 0`. This is why deep-linking `/map#stage-7` lands on a visible stage instead of a blank one.

## Priority Issues

**[P1] Every stage's one-line summary is withheld.** Verified: all nine `summary` strings exist in `lib/sitemap.ts`, render on the homepage via `MatterFlow.tsx`, and never render on `/map`.
*Why it matters:* "Interlocutory Application" and "Pleadings / Issues" are precisely the terms a student cannot decode, and the map is where they meet them. The content is written, paid for, and hidden.
*Fix:* render `stage.summary` under each `h2` at the box indent, ~14px `ink-soft`, max ~58ch.
*Suggested command:* `/impeccable clarify`

**[P1] The hierarchy is inverted — stage titles are the smallest text on the page.** The `h2` is 11px mono/indigo; box labels are 14.5px ink.
*Why it matters:* the nine stage names *are* the content. Rendered smaller than their own contents, they read as captions on the boxes rather than the structure containing them.
*Fix:* promote stage titles to ~19px display serif in `ink`; keep the mono treatment for the number mark alone.
*Suggested command:* `/impeccable typeset`

**[P1] The state picker is the page's only dead end.** 37 options, and selecting one prints "Matter in Maharashtra." and does nothing else — on a page whose own source comment promises every box leads somewhere.
*Why it matters:* a control that changes nothing costs more trust than an absent one, and this is the page's most prominent interactive element.
*Fix:* filter the visible forums to that jurisdiction, or link into the Library pre-scoped to it. If neither is buildable now, cut it.
*Suggested command:* `/impeccable shape`

**[P2] Three contrast failures, one cause.** Box ref prefixes at 4.15:1, state-picker label and helper at 3.97:1 — all below the 4.5:1 floor for normal text, all traced to `/70` alpha on `ink-soft`.
*Why it matters:* these are the labels that explain the interface, so the explanatory layer is the least legible layer. One token fix clears all three.
*Suggested command:* `/impeccable polish`

**[P2] Tap targets below 44px on mobile.** Measured at 375px: all 11 product pills are **21px** tall; the state `<select>` is **42px**; the Arguments menu options are **37px**. The map's own link boxes are fine at 52px.
*Why it matters:* the failing controls are the navigational ones — the pills are how the map hands off to Courses, Library and Shisho.
*Suggested command:* `/impeccable adapt`

**[P3] Unexplained ref codes.** `2A`, `4C`, `7B` appear on 9 of 33 boxes with no legend and no inferable pattern.
*Fix:* drop them from render, or add one line of key text under the h1.
*Suggested command:* `/impeccable clarify`

## Persona Red Flags

**Jordan (confused first-timer)** — a confirmed primary audience, and the worst served. Nothing explains "Interlocutory Application" or "Rejoinder" because the summaries are withheld. Stage 2 presents 8 competing links where "Clerk", "High Court" and "Drafts" are three different kinds of noun under one heading. Stage 3 is titled "State" and contains "Supreme Court". They will select Maharashtra, read "Matter in Maharashtra.", and learn nothing.

**Sam (screen reader / keyboard-only)** — better than expected and worse in one specific way. Focus indicators, accessible names and heading order all measured clean. But the `StepMark` numerals are `aria-hidden`, so "1, 2, 3…" never reach the buffer: **the ordering, which is the entire point of the page, is invisible to assistive tech except through DOM order.** Six links announce as "Legal Library" and five as "Shisho", so the links-list is unusable.

**Casey (one-handed mobile)** — 3,732px of scroll at 375px, where the flowchart metaphor breaks: stage 2's six boxes reflow into a 2×3 block so the spine runs beside a grid, not a line. Every product pill is a 21px target.

## Minor Observations

- **`stageForHref()` in `lib/sitemap.ts` is dead code** — verified: nothing calls it. Assessment A flagged it as silently misrouting `/documents/counter-claim` to stage 5; it cannot, because it never runs. It is still unused code that should go.
- **The `reveal-stagger` delay is probably inert.** `animation-delay: calc(var(--i) * 60ms)` sits on an element whose `animation-timeline` is `view()`; time-based delays don't apply to progress timelines, so `animation-range` is doing all the work and the stagger likely doesn't stagger.
- The `?` marker's explanation lives only in a `title` tooltip — unreachable by keyboard or touch.
- The page spends **no seal at all** except the header CTA. A navigational spine with no destination of its own.
- No box currently sets `unread`, so the dashed variant — one of the page's best ideas — is invisible.

## Questions to Consider

1. If a matter begins with a client walking in, why is stage 1 "Homepage"? The map describes the *website* for one stage and *litigation* for eight. Would a litigator ever draw it that way?
2. Stages 1 and 9 have empty `serves` — nothing on the site answers them. Should the map say so, the way the `?` convention admits uncertainty elsewhere, instead of letting them look identical to the stages that are served?
3. If 33 boxes resolve to roughly 15 distinct destinations, is this a map of a matter, or a sitemap wearing a matter's clothes?
