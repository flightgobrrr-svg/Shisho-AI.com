# Shisho AI: mobile app

An Android and iOS app for Shisho AI, built with **React Native and Expo (SDK 58)** and Expo Router. It lives in `mobile/` beside the website and **reuses the website's verified legal data** (`../lib/*.ts`), so there is one source of truth and one set of tests.

**Status: working prototype. It runs on an Android emulator and talks to the site's online service. Not production-ready, not submitted to any store.** See "Remaining issues".

## What works

**With no signal** (data bundled in the app):

| Feature | Notes |
|---|---|
| Limitation checker | 12 Articles of the Limitation Act, 1963 plus the written-statement period. Shows its source and date checked. Copy and share the result. |
| IPC to BNS | 17 mappings two published tables agree on, plus 377 and 497 as omitted. |
| Documents, The Map, Clerks' manual | Eleven pleadings, nine stages, 99 A-to-Z entries with search, working formats. |
| Moot kit, case-brief practice, revision | Saved on the phone only; briefs return after 1, 7 and 30 days. |
| Legal Library list | 84 judgments, searchable. |
| Courses and classes | Starter and Proficient with full syllabus; Legal English and Spoken English. The recorded-class lists are empty on the site too, so the app says "No recorded classes yet". |
| Reminders | A switch on the Revision screen (one alert when the next brief falls due) and Next-date reminders under Tools (an alert around 9 am the day before a hearing). Local notifications only: nothing goes through a server. **Installed builds only; inside Expo Go the screens say alerts are off, and dates can still be saved.** |
| Info pages | Terms, privacy, refund, about, how it works, corrections, status. |
| Who it's for | The audiences from the promo video, with advocates split into junior, senior and designated senior, in the website's four sections (Practice, Study and teaching, Exams, Bench and public). Each section opens from Home on its own; the full list is under Me too. Each group has a page marked "Available now" or "Planned", with a labelled sample and a "start here" list whose links open the matching screen: review opens Shisho in review mode, hearing prep opens it with the message started. Same data as the website (`lib/audiences.ts`, `lib/audiencePages.ts`, `lib/nav.ts`). |

**With a connection to the site** (when the build has `EXPO_PUBLIC_API_URL`):

| Feature | Notes |
|---|---|
| Shisho drafting chat and hearing prep | Uses the site's assistant unchanged: same prompts, plan and monthly limit. Replies and drafts can be copied or shared. |
| Attach a file to Shisho | One PDF, Word, text or image file per message, up to 15 MB, through the system file picker (no storage or photo permission). The same types and limit as the website. |
| Review a draft | Clause-by-clause notes with the provision named, a must-fix filter, copy and share. |
| Library digests | Fetched on demand; a real digest is saved on the phone for offline reading. A demo digest is shown as one and is never kept. |
| Look up any judgment | Signed-in only. |
| Accounts | Sign in, create account, forgot password (finishes on the website), sign out, and **delete my account** inside the app. |
| "Tell me when this opens" | On each planned audience page. Uses the website's sign-up handler unchanged, through `/api/mobile/interest`; it answers "not open yet" until the `interest_signups` table exists. |

When the site is not reachable, every online screen says so plainly. Nothing fakes an answer.

## Not built

- **Voice dictation.** It needs a speech-recognition native module that Expo Go does not include, so it needs a custom development build first.
- **Push notifications from Shisho** (as opposed to the local reminders above). They need Firebase and Apple push credentials and a server that sends them.
- **Payments.** The website has none either.
- **The Google Drive template link** and **translation** (English only).

## Why React Native with Expo

The legal data and its tests are TypeScript. React Native lets the app import those same files, so a correction made once reaches both. Expo's cloud builds can produce an iOS build from Windows.

## Run it

### 1. Start the website (the app's online service)

From the repository root:

```bash
npm run dev:lan        # next dev, reachable from other devices
```

The model keys stay in the site's `.env.local`. **They never go in the app.**

### 2. Tell the app where the site is

Copy `mobile/.env.example` to `mobile/.env.local` and set the one public setting:

| Where the app runs | `EXPO_PUBLIC_API_URL` |
|---|---|
| Android emulator | `http://10.0.2.2:3000` (the emulator's name for this computer) |
| Real phone on the same Wi-Fi | `http://<this computer's LAN address>:3000`, for example `http://192.168.1.3:3000` |
| Real phone over USB (after `adb reverse`) | `http://localhost:3000` |
| Production | `https://<your deployed site>`. HTTPS only. |

Leave it empty for an offline-only build. Restart Expo after changing it.

### 3a. Android emulator (tested)

An emulator image (`Medium_Phone_API_36.1`) is already installed on this machine, with hardware acceleration.

```powershell
# start the emulator (a window opens)
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_API_36.1

# in mobile/, once it has booted:
npx expo start --android --port 8081
```

Expo downloads and installs **Expo Go** on the emulator the first time. **If the app hangs on "Downloading 100%"** (the log shows `Expected leading [0-9a-fA-F] character`), tunnel the development server over `adb` and open it again:

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb reverse tcp:8081 tcp:8081
& $adb shell am start -a android.intent.action.VIEW -d "exp://localhost:8081" host.exp.exponent
```

That is what worked here. The blue gear in Expo Go is its developer menu, not part of the app.

### 3b. A real phone

1. Install **Expo Go** from the Play Store or App Store. It must support **SDK 58**; check its page, as Expo Go follows the latest SDK.
2. Phone and computer on the **same Wi-Fi**. Set `EXPO_PUBLIC_API_URL` to the computer's LAN address (see above), and run the site with `npm run dev:lan`.
3. In `mobile/`: `npx expo start`. Scan the QR code (Expo Go on Android; the Camera app on iPhone).
4. Windows may ask to allow Node.js through the firewall on private networks. Allow it, or neither the app nor the site will be reachable.
5. If the QR connection fails, try `npx expo start --tunnel`, or connect the phone by USB with debugging on and use the `adb reverse` lines above (also reverse `tcp:3000`, and use `http://localhost:3000`).

Expo Go is for development. A shareable build needs EAS (`npx eas-cli@latest build`), which needs an Expo account, and for iOS an Apple Developer account.

### Checks

```bash
npx tsc --noEmit        # typecheck
npx expo-doctor         # project health
npx expo export --platform android --platform ios --platform web
cd .. && npm test       # the legal-data tests (shared with the website)
```

## How it connects, and what it never holds

The app calls only `/api/mobile/*` on the site: sign-in, refresh, forgot password, delete account, `me`, assistant, review, digest, lookup. These are **new routes** that reuse the site's own assistant and review handlers unchanged; none of the protected files were edited. Sign-in tokens live in the phone's secure store (Keychain or Keystore). The only other thing the app holds is a random device ID that counts free messages. It never holds a model key, a Supabase service key or any OAuth secret. See `docs/INTEGRATION.md`.

## Validated, and how

- Typecheck, `expo-doctor` (20/20), and Android, iOS and web bundles all pass.
- **On the Android emulator:** first-run welcome, tabs, Shisho review (a draft typed on the emulator, sent to the site, notes shown with the provision), the Library list and a digest, the account screen, courses and a course page, saving a next date, and attaching a file through the system picker and sending it (it reached the live model, which answered "busy").
- **Bugs the emulator caught and that are fixed:** importing the notifications library crashed the app in Expo Go (it is now loaded only where its native module exists); a picked file could not be read inside Expo Go's sandbox (a third read path now handles it); date hints looked like real entries (now DD / MM / YYYY).
- **On the web build in a phone-sized browser:** the offline journeys (limitation, IPC, documents, moot, revision), and an accessibility scan with no contrast findings.
- **Server routes:** input validation, signed-out guards and one real call each to review and digest.

## Not tested

- **Sign-in, create account, forgot password, delete account, and everything that needs a signed-in session** (lookup, the signed-in plan on Shisho). Testing them would create a real account on your live Supabase project, which I did not do. The token-to-session step is the part most worth testing first.
- **Shisho chat with a live model.** Google's model answered "503 high demand" during testing, so the live path was reached but never completed. Review and digest were served in demo mode, which is how the site is currently configured, and are labelled so.
- **Reminders actually firing.** They cannot run in Expo Go, so they need an installed build (EAS) to test; the scheduling code is written against the SDK 58 docs but has not delivered a notification yet.
- **The "Tell me when this opens" sign-up with a real address.** Only its validation was tested (a bad email and an unknown audience are refused); no address was sent, so nothing was written to your database.
- A real phone, iOS, TalkBack and VoiceOver, large text, airplane mode.

## Remaining issues

1. **Auth paths untested against a real account** (above). Try them on a throwaway account before relying on them.
2. **The site is not deployed.** Phones reach it only on your network; the stores need a privacy-policy URL.
3. **Plain `http://` only works in development.** A release build needs the HTTPS address, and Android blocks cleartext traffic in release builds.
4. **Bundle ID `app.shisho.mobile` is provisional.**
5. **Logo:** 512px source, likely AI-generated; ownership to confirm (`docs/ASSETS-AND-LICENCES.md`).
6. **Legal pages not reviewed by an advocate.**
7. **Dependency audit:** 27 findings in build tooling.
8. **Shisho is slow when the model is busy** (about 15 seconds while the site retries before falling back). The app shows a waiting message and a timeout.
9. **Revision cards and saved digests live on one phone**, with no backup.
10. **No rate limit on the new routes** beyond the site's own monthly counters. Add one before a public launch.
11. **No open-source notices screen** yet.
12. **Reminders on Android 14+** may arrive a little late, because exact-time alarms are restricted by default. The screens say "around".
13. **A large attachment inside Expo Go** is read through React Native's blob store, which is slow for big files. An installed build uses the faster file API.
14. `mobile/.claude/settings.json`, added by the Expo template, enables Expo's Claude plugin when the folder is opened in Claude Code. Delete it if you do not want that.
