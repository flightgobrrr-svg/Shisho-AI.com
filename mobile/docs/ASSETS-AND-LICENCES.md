# Asset and licence register

Kept for the app in `mobile/`. This is a record of what is used and under what terms. It is **not a legal opinion** and does not claim copyright clearance or uniqueness. Have an advocate review it before a store submission.

Last reviewed: 18 October 2026.

## Your own assets

| Asset | Where it is used | Source | Status |
|---|---|---|---|
| Shisho logo (`public/shisho-logo.png`, 500px: the emblem with "SHISHO ai" and the tagline) | App icon, Android adaptive icon (foreground and monochrome), splash image, web favicon, all in `mobile/assets/` (changed from the emblem alone, 20 October 2026). The previous emblem icons are not in the repository. | `PRODUCT.md` lists it as the owner's | **Owner to confirm.** The artwork looks AI-generated; the ownership and copyright position of AI-generated images is uncertain and varies by place. The source is only 512px, so the 1024px icon is enlarged and slightly soft. Supply a vector or 1024px+ original before submission. |
| Photograph of an advocate (`public/audiences/senior-advocates.webp`; app copy `mobile/assets/audiences/senior-advocates.jpg`) | Senior advocates section, on the website (page and homepage) and in the app | Supplied by the owner, 20 October 2026 | **A real advocate; the owner reports he agreed.** Keep his consent in writing, covering the website, the app and app-store screenshots. Shown with no name and no quote so it cannot read as an endorsement: the Bar Council of India's rules restrict advocates from advertising, so he should be comfortable with his image on a product's marketing page. Who took the photo, and their permission, also to confirm. |
| Twelve audience photos from the promo video (`public/audiences/*.jpg`; app copies in `mobile/assets/audiences/`) | Beside each audience's sample on the website and in the app; clerks and law students on their own pages | Cut by us from the owner's promo video at the owner's request, 20 October 2026; enlarged 2x from 150x228 | **Likely AI-generated, with the video tool's terms to check for commercial use.** Low resolution, so kept small. No names or quotes. Replace with the originals if the owner has them. |
| Name and brand "Shisho AI" | App name, in-app copy | Owner's | **Trademark clearance not done.** Not claimed. |
| Text copy (legal pages, tool descriptions, document reference) | Shared from the website's `lib/*.ts` | Written for this project | The legal pages are plain-language and **not reviewed by an advocate**. |

Update 22 Oct 2026:

| Asset | Where it is used | Source | Status |
|---|---|---|---|
| Shisho logo tile (`mobile/assets/shisho-logo-tile.png`, 512px, supplied by the owner 22 Oct 2026: the framed logo with "SHISHO ai" and the tagline) and the emblem cut from it (`mobile/assets/shisho-emblem.png`: the S and face only) | Emblem: app icon (iOS and Android adaptive, themed monochrome) and favicon, because the lettering is unreadable at icon size. Full tile: splash screen, the top bar and the side menu. | Owner's | **Owner to confirm rights**, as for the earlier logo: it looks AI-generated. 512px source, so the 1024px icon is enlarged; supply a larger original before store submission. |

## Not used, on purpose

- The logo variant from the promotional video: its provenance and rights are unclear. (The video's photographs are now used, at the owner's request; see above.)
- `public/gurukul-teaching.jpg` and `gurukul-question.jpg`: not needed by the app yet. Confirm rights before adding.

## Fonts (open licence, bundled through npm)

| Font | Package | Licence |
|---|---|---|
| EB Garamond | `@expo-google-fonts/eb-garamond` 0.4.3 | MIT (package) and SIL OFL 1.1 (font) |
| Instrument Sans | `@expo-google-fonts/instrument-sans` 0.4.2 | MIT and SIL OFL 1.1 |
| IBM Plex Mono | `@expo-google-fonts/ibm-plex-mono` 0.4.1 | MIT and SIL OFL 1.1 |

The OFL requires keeping its licence text with the fonts and not selling the fonts on their own. The licence files ship inside each package. Reserved font names must not be used for modified versions; none are modified.

## Icons

No icon library is used. The tab bar is text-only. The app icon is the emblem above.

## Third-party dependencies (production tree, 517 packages)

Counted with `license-checker-rseidelsohn --production` on 18 October 2026:

| Licence | Packages |
|---|---|
| MIT | 458 |
| ISC | 23 |
| BSD-3-Clause / BSD-2-Clause | 10 |
| Apache-2.0 | 6 |
| BlueOak-1.0.0 | 6 |
| MIT AND OFL-1.1 | 3 (the fonts) |
| Others: Unlicense (2), MPL-2.0 (2), CC-BY-4.0 (1), 0BSD, Python-2.0, dual-licensed | 11 |

Items that need a human look:

- **MPL-2.0:** `lightningcss` (a build tool, not shipped in the app bundle). File-level copyleft; fine to use unmodified.
- **CC-BY-4.0:** `caniuse-lite` (build-time browser data). Requires attribution if redistributed; it is not part of the shipped app.
- **node-forge** is `BSD-3-Clause OR GPL-2.0`. Use it under BSD-3-Clause.
- **`shisho-mobile` is `UNLICENSED`:** this is the app's own package; choose a licence or keep it private.
- Added with the online features: `expo-secure-store`, `expo-crypto`, `expo-document-picker`, `expo-file-system` and `expo-notifications` (all MIT).
- Key runtime packages: `expo` 58.0.14 (MIT), `react-native` 0.88.0 (MIT), `expo-router` (MIT), `react` 19.3.0 (MIT).
- The open-source notices screen is built (Menu → Legal → Open-source notices), generated from package-lock.json by `npm run licences` (544 production packages on 21 Oct 2026).

## Template content

`create-expo-app` added Expo's `LICENSE` (MIT, 650 Industries) and a stock `AGENTS.md`. The template's placeholder icons were replaced with the Shisho emblem.

## Known security reports

`npm audit --omit=dev` reports 27 findings (19 high, 8 moderate, 0 critical), almost all inside build tooling: `@expo/cli`, `metro`, `braces`, `node-forge`. They do not run inside the shipped app, but they run on a developer machine and in cloud builds. Do **not** run `npm audit fix --force`: it makes breaking version changes to Expo. Review them with each Expo SDK upgrade.

## Data and sources used for legal content

The limitation periods, the IPC to BNS table and the document provisions are shared with the website (`lib/*.ts`) and each states its source and the date it was checked. They are the same files, tested by `npm test` at the repository root.
