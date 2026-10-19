# Asset and licence register

Kept for the app in `mobile/`. This is a record of what is used and under what terms. It is **not a legal opinion** and does not claim copyright clearance or uniqueness. Have an advocate review it before a store submission.

Last reviewed: 18 October 2026.

## Your own assets

| Asset | Where it is used | Source | Status |
|---|---|---|---|
| Shisho emblem (`public/shisho-emblem.png`, 512px) | App icon, Android adaptive icon (foreground and monochrome), splash image, web favicon, all in `mobile/assets/` | `PRODUCT.md` lists it as the owner's | **Owner to confirm.** The artwork looks AI-generated; the ownership and copyright position of AI-generated images is uncertain and varies by place. The source is only 512px, so the 1024px icon is enlarged and slightly soft. Supply a vector or 1024px+ original before submission. |
| Name and brand "Shisho AI" | App name, in-app copy | Owner's | **Trademark clearance not done.** Not claimed. |
| Text copy (legal pages, tool descriptions, document reference) | Shared from the website's `lib/*.ts` | Written for this project | The legal pages are plain-language and **not reviewed by an advocate**. |

## Not used, on purpose

- The AI-generated photographs and logo variant from the promotional video: their provenance and rights are unclear.
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
- Many mobile stores ask you to show an open-source notices screen. Generate one from the licence checker before release (not built yet).

## Template content

`create-expo-app` added Expo's `LICENSE` (MIT, 650 Industries) and a stock `AGENTS.md`. The template's placeholder icons were replaced with the Shisho emblem.

## Known security reports

`npm audit --omit=dev` reports 27 findings (19 high, 8 moderate, 0 critical), almost all inside build tooling: `@expo/cli`, `metro`, `braces`, `node-forge`. They do not run inside the shipped app, but they run on a developer machine and in cloud builds. Do **not** run `npm audit fix --force`: it makes breaking version changes to Expo. Review them with each Expo SDK upgrade.

## Data and sources used for legal content

The limitation periods, the IPC to BNS table and the document provisions are shared with the website (`lib/*.ts`) and each states its source and the date it was checked. They are the same files, tested by `npm test` at the repository root.
