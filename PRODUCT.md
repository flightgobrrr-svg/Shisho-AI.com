# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences, weighted **equally** — confirmed by the owner, not inferred:

- **Law students** in an LL.B. (three-year or five-year), learning to read law and put a first document on paper.
- **Junior advocates**, in practice but without a senior reliably checking their drafts.
- **Practising litigators**, who need speed and citation checking rather than teaching.

The product is not to be optimised for one of these at the expense of the others. The
student→junior→litigator arc is treated as one continuous audience, which is why the
same material has to work as instruction for the first group and as reference for the
third.

## Product Purpose

An Indian legal-education and drafting product. It teaches how litigation documents are
built, holds the authorities they rest on, and marks up a draft the way a senior advocate
would — in the margin, clause by clause, with the Indian provision named.

Success is a user filing a competent document they understood before they filed it.

## Positioning

The mechanism a neighbouring product could not truthfully copy: **the correction, in the
margin, against the Indian provision that governs the clause.** Not a generic LLM
rewriting text, and not a template library — a marked-up draft that names the rule
(Order VII Rule 11, Order XXXIX Rules 1–2, BSA s.143) and says why the clause fails.

The mentorship framing is load-bearing: *shisho* is the teacher, and the product's claim
is that every good lawyer had one and most juniors now don't.

## Operating Context

The product is organised around the real lifecycle of a civil matter, captured on `/map`
as nine stages: who brings the matter, the forum, the first draft, the interlocutory
application, pleadings and issues, trial, citations, and what follows. Each stage names
the documents filed at that point, and each document has its own reference page.

Users work against Indian procedure — CPC 1908, the Bharatiya Sakshya Adhiniyam 2023
(which replaced the Evidence Act on 1 July 2024), and the Bar Council of India's Rules of
Legal Education 2008 for the internship requirement. Forums range from trial courts
through High Courts to the Supreme Court, across 28 states and 8 union territories.

## Capabilities and Constraints

**Built:** courses (Starter, Proficient); a Legal Library of verified Indian citations;
the drafting assistant with two modes — describe facts and get a draft, or paste a draft
and get margin notes; the matter map; eleven document reference pages; the internship
guide; pricing.

**Confirmed non-negotiable** (owner-selected):

1. **Indian law only.** Scope stays CPC / BSA / Indian courts. No jurisdiction creep.
2. **Bar Council advertising limits.** Marketing must respect Indian restrictions on
   soliciting legal work, relevant wherever an advocate is associated with the product.
3. **Every citation verified.** No case, section, or rule ships without being checked
   against a real source first. This already governs `lib/library.ts`,
   `lib/documents.ts`, and `lib/sitemap.ts`.

**Incumbent, not confirmed binding:** the footer carries an educational-tool disclaimer
stating that the product does not give legal advice and that no advocate–client
relationship arises from its use. It was NOT selected as non-negotiable when asked, so
future work should ask before altering or removing it rather than assume either way.

**Undecided / not established:** whether the drafting assistant runs on a live model key
in production (it has a working demo mode); any internship programme (the `/internship`
page teaches the BCI requirement and deliberately claims no placements).

## Brand Commitments

- **Name:** Shisho AI. The product surface within it is called **Shisho** (renamed from
  "Draft Bot"); the route `/draft-bot` is retained so existing links survive.
- **Tagline:** *Wisdom, guidance, intelligence* — carried inside the logo artwork.
- **Assets:** `public/shisho-logo.png` (full lockup) and `public/shisho-emblem.png`
  (emblem, cut from it) serve the nav, favicon and social card.
  `public/gurukul-teaching.jpg` and `public/gurukul-question.jpg` are the only
  photography the product owns — one teacher, one afternoon.
- **Voice:** plain, senior, unsentimental. States the rule and the consequence. Does not
  hedge, does not sell hard, does not explain the interface to the reader.

## Evidence on Hand

- **27 verified Legal Library citations**, and every statutory provision on the document
  pages checked before publication.
- **No customers, no users, no testimonials.** The product is **pre-launch** — confirmed.
  Nothing anywhere may claim usage, outcomes, adoption, or endorsement, and no
  testimonial, logo wall, or metric may be fabricated to fill a layout.
- Prices exist and are real as intent: Free ₹0, Basic ₹9, Core ₹499, Proficient ₹999,
  Shisho add-on ₹699 — single source of truth in `lib/pricing.ts`.

## Product Principles

1. **Never present a guess as settled.** A label that cannot be verified is flagged, not
   invented — the rule that produced the `unread` convention and governs every citation.
2. **The correction is the product.** What a senior writes in the margin, not the clean
   draft, is the thing being sold and the thing being taught.
3. **Teach the rule, not just the fix.** Every defect names the provision it breaches, so
   the user can apply it next time without the tool.
4. **One audience arc, three depths.** The same material serves a student learning the
   document and a litigator checking one; neither is written down to.
5. **Pre-launch honesty.** Capability may be shown; adoption may not be implied.
