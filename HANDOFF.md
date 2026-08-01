# Shisho AI — Session Handoff

Paste the **Prompt to start the next session** at the bottom into a fresh Claude Code session opened in `C:\Users\madha\OneDrive\Desktop\Shisho`.

---

## 1. What the project is

**Shisho AI** — an Indian legal-education product: courses plus an AI drafting assistant ("Draft Bot") that marks up pleadings the way a senior advocate would, in the margin, with Indian authorities cited.

- **Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript.
- **Repo root:** `C:\Users\madha\OneDrive\Desktop\Shisho`
- **Routes:** `/` (home), `/draft-bot`, `/courses`, `/library`, `POST /api/draft`.
- **`AGENTS.md` warning (still applies):** this Next.js version has breaking changes vs. training data — read `node_modules/next/dist/docs/` before writing framework code.

## 2. Design system — the rules that constrain everything

All tokens and rules live as comments in `app/globals.css`. Do not casually violate these; they are load-bearing and were argued for.

- **Palette (60-30-10):** `paper`/`paper-raised` 60% surfaces, `ink`/`ink-soft` 30% text+hairlines, `seal` 10% — **primary CTAs and the annotation motif ONLY**. Never a hover tint, background wash, or icon colour.
- **Type:** EB Garamond (display, italic matters — it carries the brand tic), Instrument Sans (body), IBM Plex Mono (labels/case numbers).
- **Motion:** `--ease-precise: cubic-bezier(0.2,0,0,1)` everywhere; decelerate hard, never overshoot, no spring/bounce. `--duration-nudge: 180ms`. Hover travel budget is **2–4px**.
- **Exactly one perpetual animation site-wide** — `AmbientDrift` owns it. Anything new must be interaction- or scroll-driven.
- **`prefers-reduced-motion`** must fully neutralise every addition; **`(pointer: fine)`** gates anything cursor-driven. Pattern to copy: `components/motion/Magnetic.tsx`.
- **Resting state is the finished state** — scroll-reveal CSS animates *from* hidden, so if JS/animation never runs, content is still visible. Never invert this.
- **No animation library.** Everything is vanilla CSS + small hooks (~60–150 lines). This is deliberate.

## 3. Current state of the work

### Landed this session
- **Pricing repriced** in `lib/pricing.ts` (single source of truth — prices must never be literals in components): Free ₹0, **Core ₹499** (was 999), **Proficient ₹999** (was 2499), add-on ₹699.
- **Removed the placeholder `SocialProof` section** from `app/page.tsx` — it shipped visible `[Quote goes here]` / `PLACEHOLDER — PENDING REAL DATA` text. Do not reintroduce fabricated testimonials or stats.
- An interactivity/premium design brief was written as `DESIGN_BRIEF.md`, then deleted — its rules are summarised in section 2 above, which is now the source of truth.
- **New motion primitives:** `components/motion/ScrollProgress.tsx` (seal hairline under nav, fills with scroll) and `components/motion/ParallaxLayer.tsx` (scroll drift, centred on own position). Both rAF-coalesced and reduced-motion opt-out.
- **`Magnetic` extended** from one button to all primary CTAs (Hero, ProductShowcase, courses, library, Draft Bot's "Ask Shisho").
- **Hover lift** (`-translate-y-0.5` + contact shadow) on `CourseCard`, `PricingGrid`, `PricingPreview`, `PersonaRouter`.
- **`FeatureStrip`** given `reveal-stagger` for continuous scroll rhythm.
- **Hero rebuilt** (`components/home/Hero.tsx`):
  - Sample writ-petition mockup **removed** from the hero.
  - Full viewport: `min-h-[calc(100svh-4rem)]`, flex-centred.
  - Copy hugs the **left page gutter** (deliberately NOT `<Container>`, so on wide screens it starts further left than the sections below — intentional, commented in file).
  - `gurukul-teaching.jpg` as a right-hand `PhotoBackdrop` panel (~52% width) with a wide, low vignette showing **guru + seated students**, fading to transparent before all four frame edges, `opacity 0.5`, `parallax 0.06`.

### Reverted (do not redo without asking)
A full port of a Claude Design mockup (bronze/cream palette, Bodoni Moda + Jost, custom cursor, scroll-scrub) was implemented and then **reverted at the user's request**. The user wants the existing paper/ink/seal + Garamond identity kept.

### Open questions
1. **`components/home/DocumentMockup.tsx` is now unused** — delete it or keep it?
2. `git stash@{0}` holds earlier WIP from the `add-photo-backdrops-and-pricing-update` branch.
3. A PR was never opened (branch was pushed; `gh pr create` never ran).

## 4. Hard-won gotchas — read before debugging

- **The Browser pane doesn't display in this environment.** `computer{action:"screenshot"}` fails with "pane is not displayed". Workaround that works: **headless Chrome**
  `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=8000 --window-size=W,H --screenshot=out.png http://localhost:3000`
- **Headless Chrome on Windows has a 500px minimum window width.** Asking for 390 lays out at 500 and crops — mobile screenshots taken this way are *lies*. To screenshot mobile accurately, render the site in a fixed-width `<iframe>` inside a wider harness page.
- **`javascript_tool` still works even when the pane won't composite** — use it to measure `getBoundingClientRect`, `scrollWidth`, computed styles. Trust measurements over headless mobile screenshots.
- **A scroll-driven animation on an element overrides `hover:` transforms on that same element** (animations beat plain declarations). This silently killed the card hover-lift in `PricingPreview` until the animated `<li>` and the card `<div>` were split into separate elements. `PricingGrid` was already correct.
- **`PhotoBackdrop` hard-border rule:** if the mask is still opaque where the frame ends, you get a visible straight cut. The mask must reach `transparent` *before* every frame edge — including under parallax travel. Frame is oversized `-inset-y-16` for exactly this reason.
- **Portrait source in a wide frame:** `gurukul-teaching.jpg` is 519×690. Full-bleed across a wide hero forced `object-cover` to zoom ~3× and destroyed the image. Keeping the panel near the source's aspect (~52%) is what makes it legible.
- Dev server: use `preview_start` with `.claude/launch.json` (`autoPort: true`, port 3000 often occupied).

## 5. Verify before declaring done

```bash
npx tsc --noEmit
npm run build
```
Then screenshot at 1024 / 1280 / 1440 via headless Chrome, and check mobile via the iframe harness or `javascript_tool` measurements. Confirm `/api/draft` still works end-to-end on `/draft-bot` (Load sample → Ask Shisho), including the 402 quota-locked state.

---

## Prompt to start the next session

> I'm continuing work on **Shisho AI**, a Next.js 16 / React 19 / Tailwind v4 site at `C:\Users\madha\OneDrive\Desktop\Shisho`. Read `HANDOFF.md` in the repo root first — they contain the design rules, what's already been done, and several non-obvious gotchas about this environment.
>
> Key constraints to respect without me re-explaining them:
> - Keep the existing paper/ink/seal palette and EB Garamond identity. A bronze/cream redesign was tried and deliberately reverted.
> - `seal` is for primary CTAs and the annotation motif only. 60-30-10.
> - Exactly one perpetual animation site-wide (`AmbientDrift`). Everything else must be interaction- or scroll-driven, gated on `(pointer: fine)`, and fully neutralised under `prefers-reduced-motion`.
> - Prices live only in `lib/pricing.ts` — never as literals in components. Current: Free ₹0 / Core ₹499 / Proficient ₹999 / Draft Bot add-on ₹699.
> - Never ship placeholder or fabricated content (a fake testimonials section was already removed for this reason).
> - Don't touch `app/api/draft/route.ts`, `lib/entitlements.ts`, or `lib/draft.ts` — that's real working business logic.
>
> Environment note: the Browser pane does not display, so `screenshot` fails. Use headless Chrome for screenshots, and note it has a 500px minimum window width, so mobile screenshots must go through a fixed-width iframe harness. `javascript_tool` still works for measuring the live DOM.
>
> Two things are still open: (1) `components/home/DocumentMockup.tsx` is unused — decide whether to delete it; (2) no PR has been opened yet.
>
> **My next task is:** _[describe what you want here]_
