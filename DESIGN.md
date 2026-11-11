---
name: Shisho AI
description: An Indian legal drafting and education product that marks a draft up in the margin the way a senior advocate would.
colors:
  ink: "#1e2127"
  ink-soft: "#3a3f49"
  ink-faint: "#5b5f66"
  paper: "#eae8e1"
  paper-raised: "#f2f1ec"
  seal: "#a32e1f"
  seal-dark: "#85251a"
  indigo: "#2c3a57"
  accent-soft: "#d9a99a"
  inverse: "#1e2127"
  on-inverse: "#eae8e1"
  dark-ink: "#ece9e2"
  dark-ink-soft: "#b3aea4"
  dark-ink-faint: "#99948b"
  dark-paper: "#1c1a17"
  dark-paper-raised: "#262320"
  dark-seal: "#ec5d42"
  dark-seal-dark: "#cf4a30"
  dark-indigo: "#93a8cf"
  dark-inverse: "#121110"
  chamber-ink-soft: "#c4c0b7"
  chamber-ink-faint: "#a29e95"
  chamber-seal: "#f4826d"
  chamber-seal-hover: "#f69a88"
  chamber-indigo: "#9fb2d6"
typography:
  display:
    fontFamily: "EB Garamond, ui-serif, Georgia, serif"
    fontSize: "3.5rem"
    fontWeight: 650
    lineHeight: 1.06
    letterSpacing: "-0.018em"
  title:
    fontFamily: "EB Garamond, ui-serif, Georgia, serif"
    fontSize: "2.2rem"
    fontWeight: 650
    lineHeight: 1.16
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, SF Mono, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0.13em"
  draft:
    fontFamily: "IBM Plex Mono, ui-monospace, SF Mono, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.9
  display-chamber:
    fontFamily: "EB Garamond, ui-serif, Georgia, serif"
    fontSize: "5rem"
    fontWeight: 650
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  clause:
    fontFamily: "EB Garamond, ui-serif, Georgia, serif"
    fontSize: "clamp(1.5rem, 1.1rem + 1.9vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.28
    letterSpacing: "-0.012em"
  title-md:
    fontFamily: "EB Garamond, ui-serif, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 650
    lineHeight: 1.2
  deck:
    fontFamily: "EB Garamond, ui-serif, Georgia, serif"
    fontSize: "1.35rem"
    fontWeight: 400
    lineHeight: 1.375
  headline:
    fontFamily: "EB Garamond, ui-serif, Georgia, serif"
    fontSize: "2rem"
    fontWeight: 650
    lineHeight: 1.1
  headline-sm:
    fontFamily: "EB Garamond, ui-serif, Georgia, serif"
    fontSize: "26px"
    fontWeight: 650
    lineHeight: 1.2
  title-sm:
    fontFamily: "EB Garamond, ui-serif, Georgia, serif"
    fontSize: "19px"
    fontWeight: 650
    lineHeight: 1.3
  lead:
    fontFamily: "EB Garamond, ui-serif, Georgia, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  body-ui:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.625
  body-sm:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  fine-print:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  seal: "0px"
spacing:
  gutter: "24px"
  gutter-md: "32px"
  container: "72rem"
  section: "80px"
  section-md: "112px"
components:
  button-primary:
    backgroundColor: "{colors.seal}"
    textColor: "{colors.paper-raised}"
    rounded: "{rounded.seal}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.seal-dark}"
    textColor: "{colors.paper-raised}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.seal}"
    padding: "0 20px"
    height: "44px"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-raised}"
    rounded: "{rounded.seal}"
    padding: "0 20px"
    height: "44px"
  tag:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.seal}"
    padding: "4px 10px"
  input:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.seal}"
    height: "36px"
  sheet:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.seal}"
  chamber:
    backgroundColor: "{colors.inverse}"
    textColor: "{colors.on-inverse}"
---

# Design System: Shisho AI

## Overview

**Creative North Star: "The Senior's Margin"**

Every screen is a draft handed back by a senior advocate. The page is warm grey court paper, the type is ink, and the only colour that moves is the red of a correcting pen. That one red does two jobs and only two: it marks the action the reader should take, and it marks a correction. Everything else stays quiet so the red keeps its meaning. The product's claim is the correction in the margin, named against the Indian provision that governs the clause, and the visual system exists to make that correction the most legible thing on any page.

The register is plain, senior and unsentimental. It does not decorate, it does not sell, and it does not explain the interface. Corners are cut square because court paper is cut, not rounded. Headings are set in Garamond because legal writing is read, not scanned. Small labels are set in mono capitals, like case numbers, form references and section numbers on a filed document. Density follows the reader: reference pages are dense and quiet, and the working screen gives the draft room.

The Shisho drafting screen is **the chamber**. Whatever the visitor writes on (the composer, their messages, the draft) is a sheet of paper laid on the desk, and Shisho's corrections sit beside it in the margin. In light mode the chamber keeps the page's paper and the sheets lift off it with a hairline and a soft shadow. In dark mode it becomes the one dark slab on the site, one step below the page, with Shisho's words in light ink.

**Key Characteristics:**
- Warm grey paper ground with near-black ink; one red, used only for the action and the correction.
- Square corners everywhere (radius 0).
- EB Garamond for headings, Instrument Sans for running text, IBM Plex Mono capitals for labels.
- A cool indigo counter-tone reserved for citations and authorities.
- Depth from paper laid on paper: soft, offset shadows, never glows.
- Motion that decelerates hard and never bounces.

## Colors

A wholly warm, near-monochrome palette held in tension by one red and one cool indigo.

### Primary
- **Correcting-Pen Red** (`#a32e1f`, hover `#85251a`): the seal. The primary button fill, the annotation underline under one key word per heading, the active nav mark, the focus outline, and must-fix notes. Nothing else. 5.77:1 on paper.

### Secondary
- **Citation Indigo** (`#2c3a57`): statute and case references, and cool mono labels. It separates *the authority* from *the mentor's mark*, so red stays reserved for the mentor. 9.26:1 on paper, safe for body text.

### Neutral
- **Court Paper** (`#eae8e1`): the page ground.
- **Raised Paper** (`#f2f1ec`): cards, the sticky nav, lifted surfaces and the sheet.
- **Ink** (`#1e2127`): headings and body text. 13.15:1 on paper.
- **Soft Ink** (`#3a3f49`): secondary text and hairlines.
- **Faint Ink** (`#5b5f66`): tertiary labels. Use it instead of `ink-soft` at reduced opacity, which falls below 4.5:1.
- **Faded Red Wash** (`#d9a99a`): decorative rules and text selection only. 1.9:1, so it never carries text.
- **Inverse** (`#1e2127` light / `#121110` dark) and **On-Inverse** (`#eae8e1`): the ink band and the chamber. Dark in both themes; in dark mode the band goes one step darker than the page instead of inverting into a bright slab.

### Dark mode
Re-derived values, not an inversion: ink `#ece9e2`, ink-soft `#b3aea4`, ink-faint `#99948b`, paper `#1c1a17`, paper-raised `#262320`, seal `#ec5d42` (a brighter red, solved for AA on dark paper), indigo `#93a8cf`. The theme follows `prefers-color-scheme` unless `:root[data-theme]` overrides it; the `dark:` variant honours both.

### The chamber palette (dark mode only)
In dark mode, inside `.chamber` the tokens are re-pointed rather than restyled: paper becomes the inverse slab, ink becomes `#eae8e1`, ink-soft `#c4c0b7`, ink-faint `#a29e95`, seal `#f4826d` (hover `#f69a88`), indigo `#9fb2d6`. Inside `.chamber .sheet` the light palette (or the dark-mode palette, in dark mode) is restored. Components inside never need their own dark styles. In light mode `.chamber` changes only the two shadow variables (`--sheet-shadow`, `--slip-shadow`); a dark slab between a light nav and a light page read as a pasted-on block, so light mode never gets one.

### Named Rules
**The One Red Rule.** Red marks the action and the correction, nothing else. Never use it for a status icon, a decorative rule, a heading colour or an illustration.

**The Citation Is Not the Correction Rule.** A legal authority is indigo; the senior's note about it is red. Never swap them.

**The Measured Contrast Rule.** Every text pairing is measured against its real background and clears 4.5:1. Never use faded ink at an opacity to make secondary text.

## Typography

**Display Font:** EB Garamond (with ui-serif, Georgia)
**Body Font:** Instrument Sans (with ui-sans-serif, system-ui)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace, SF Mono)

**Character:** a book face for what is read and argued, a clean sans for what is used, and typewriter capitals for the references a lawyer files by.

### Hierarchy
- **Display** (650, 3.5rem, 1.06, −0.018em): page heroes. The chamber question (**display-chamber**) runs larger, 3rem on phones, 4.25rem from `sm`, 5rem from `lg` with tracking at −0.03em, because it is the one thesis on that screen.
- **Title** (650, 2.2rem, 1.16, −0.012em): section headings.
- **Body** (400, 15.5–16px, ~1.6): running text, held to 52–68ch.
- **Label** (400, 0.6875rem, 0.13em tracking, uppercase, mono): case-number-style labels, field names, severity marks. In Indic scripts it falls back to the sans with no tracking, because those scripts have no capitals and tracking breaks their joined letters.
- **Draft** (400, 12.5px, 1.9, mono): the text of a pleading in the review sheet.

The working steps between those roles are fixed and used everywhere: **headline** 2rem and **headline-sm** 26px (Garamond, card and sub-section heads), **title-md** 1.5rem (section h2s on tool pages), **title-sm** 19px, **deck** 1.35rem (italic Garamond line under a hero; 1.55rem from `sm`), **lead** 17px (Garamond lists and decks), then the sans steps **body-lg** 15px, **body-ui** 14.5px (chat and tool text), **body-sm** 14px, **small** 13.5px (links and controls), **caption** 13px and **fine-print** 12.5px (quotas, disclaimers). **Clause** (1.5rem to 2.5rem, fluid) is the one fluid size: the animated clause on the home page, which scales with the screen because it is the illustration rather than interface text. A new size outside this ramp needs a reason; reach for the nearest step first.

Garamond runs small and light, so `font-semibold` is retuned to 650 across the project and display sizes sit about 8% above a usual scale.

### Named Rules
**The One Emphasis Rule.** One word per heading may be set in italic with the red underline (`<Emphasis>`), and not in every heading on a page. If two words seem to need it, neither does.

**The No Eyebrow Creep Rule.** Mono labels name things (a field, a stage, a severity). They do not stand in for a heading's own weight.

## Layout

A single centred column: `max-w-6xl` (72rem) with 24px gutters, 32px from `md`. Every landing section uses `<Section>`, which owns vertical rhythm (80px, 112px from `md`), so pages read as one document rather than stacked components. Sections never draw a full-width line on their seams; the raised tone fades in and out over 5rem (`band-raised`).

Breakpoints are Tailwind's defaults (640 / 768 / 1024 / 1280). Layout changes structurally at them: two columns become one, and wide filter rows scroll sideways on phones instead of wrapping into a wall. The nav collapses below `xl`. Phone pages are checked at 390px with no horizontal scroll, including the translated homepages.

The chamber's review screen is a two-column desk from `lg`: the sheet takes the remaining width and the margin column is 21rem, sticky under the nav.

## Elevation & Depth

Depth is paper laid on paper. Surfaces are flat at rest; a lifted object casts a soft shadow with a real downward offset and a negative spread, so it reads as a sheet resting on a desk, never as a glowing card.

### Shadow Vocabulary
- **Resting sheet** (`0 12px 32px -20px rgba(34,37,43,0.45)`): cards and raised panels on the light ground.
- **Lifted panel** (`0 18px 44px -16px rgba(34,37,43,0.28)`): menus and popovers.
- **Notice card** (`0 8px 28px -12px rgba(34,37,43,0.25)`): the limit-reached card over blurred notes.
- **Sheet** (`--sheet-shadow`; light `0 1px 2px rgba(30,33,39,0.05), 0 18px 40px -22px rgba(30,33,39,0.3)`, dark `0 28px 60px -28px rgb(0 0 0 / 0.7)`): the composer and the draft sheet.
- **Slip** (`--slip-shadow`; light `0 1px 2px rgba(30,33,39,0.04), 0 10px 24px -16px rgba(30,33,39,0.25)`, dark `0 14px 30px -18px rgb(0 0 0 / 0.6)`): the visitor's own messages.

### Named Rules
**The Paper On Paper Rule.** Every shadow has a downward offset and a soft blur. Never use a zero-offset coloured glow or a hard block shadow.

## Shapes

Court paper is cut, not rounded: `--radius-seal` is 0 and every box on the site is a ruled box on a page, like a pleading's margin box or a cause-title block. Borders are 1px hairlines in ink at 15–45% opacity. Icons are authored line art with a 1.5 stroke and square caps, so they share the same edges. The one curved form is the circle in the clock icon.

The review sheet carries **the ruled margin**: one red hairline a hand's width (3.25rem) in from the left edge, where a senior's marks go.

## Components

### Buttons
Plain and decisive, never ornamental.
- **Shape:** square (0px).
- **Primary:** seal fill with raised-paper text, 44px tall with 20px sides (`sm` 36px, `lg` 52px). One per view, ideally one per screenful.
- **Ghost:** a hairline ink outline on paper; the default for everything that is not *the* action.
- **Dark:** an ink fill, for inverted sections and strong actions that must not spend the red.
- **Hover / Focus:** colour shifts over 180ms on `cubic-bezier(0.2, 0, 0, 1)`; focus is the global 2px seal outline at a 2px offset. Disabled drops to 45% opacity.

### Tags
- **Style:** square, a 1px ink/20 border, raised paper at half strength, 13px soft-ink text.
- **Link variant:** an ink/30 border with a 36px minimum height, darkening on hover.

### Tabs
Mode switches, not actions, so they stay out of the button palette: a hairline under the row and a 2px ink rule under the selected tab, with a Garamond label and a sans hint beneath.

### Inputs / Fields
- **Style:** raised paper, a 1px ink/45 border, square, 36px tall for selects.
- **Focus:** the global seal outline. A composer shows focus on its whole frame (`has-[textarea:focus-visible]`) rather than on the bare textarea.
- **Error:** seal text with `role="alert"`, naming the problem and the fix.

### Navigation
A 64px sticky bar on raised paper. Links underline-draw in seal from the left on hover; the active page carries the annotation underline. Set in `lang="en"` so its mono labels keep their style on translated pages. It collapses to a menu below `xl`.

### The Sheet (signature)
Anything the visitor writes on (the composer, their own messages, the draft under review) is a `.sheet`: raised paper with a 1px ink/15 hairline and the sheet shadow. The draft sheet has a header strip (the document type in Garamond and the sample link) and the ruled red margin. When Shisho finishes a draft, the sheet lays down onto the desk once (560ms rise with a −0.6° settle, ease-precise; none under reduced motion).

### Margin Notes (signature)
Shisho's corrections sit in the margin column beside the sheet, not in boxes: rows separated by hairlines, each led by a drawn proof mark (a filled square for must-fix, an open square for consider, a tick for good) and the severity in mono capitals. Then come the quoted anchor in italic mono, the note in sans, and the authority in indigo mono. Clicking a note selects its clause in the sheet; the active note takes a seal top rule and raised paper.

## Do's and Don'ts

### Do:
- **Do** keep red to the primary action, the annotation underline, focus and must-fix notes (The One Red Rule).
- **Do** set citations in indigo (`#2c3a57`, `#93a8cf` dark, `#9fb2d6` in the chamber).
- **Do** keep every corner square (`--radius-seal: 0`).
- **Do** use `ink-faint` for tertiary text instead of soft ink at an opacity.
- **Do** re-theme a dark region by re-pointing tokens (the `.chamber` pattern), not by restyling each component.
- **Do** keep dark regions to dark mode; in light mode a full-width dark slab under the light nav reads as pasted on.
- **Do** give every shadow a downward offset and a soft blur.
- **Do** decelerate motion hard (`cubic-bezier(0.2, 0, 0, 1)`, 180ms for state) and honour reduced motion.

### Don't:
- **Don't** round corners, use pill shapes or use `rounded-full` tags.
- **Don't** use red for status icons, headings, decoration or illustrations.
- **Don't** add a second accent colour; the palette is warm neutrals, one red and one indigo.
- **Don't** set two emphasised words in one heading, or emphasise every heading on a page.
- **Don't** use glows, gradient text, glass effects or hard block shadows.
- **Don't** draw full-width hairlines on section seams; let `band-raised` fade.
- **Don't** show usage numbers, testimonials, logos or claims the product cannot support (pre-launch honesty, PRODUCT.md).
- **Don't** let a photograph sit behind text; mask it to transparent before the type column.
