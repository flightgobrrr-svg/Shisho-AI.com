# Store submission checklist

**Every store rule and fee below changes over time. Treat each line as "check the current official page", not as a fact stated here.** Nothing in this app has been submitted anywhere. Do not describe the app as production-ready until the items marked BLOCKER are done.

## Accounts and cost (need your approval; nothing has been purchased)

- [ ] Apple Developer Program enrolment and its annual fee, to publish on iOS. BLOCKER for iOS.
- [ ] Google Play developer account and its registration fee, to publish on Android. BLOCKER for Android.
- [ ] A build service. iOS apps cannot be built on Windows; Expo's EAS Build is the planned route (an Expo account and its current pricing and queue times need checking). Local Android builds also need the Android licences accepted: `flutter doctor --android-licenses` or the Android SDK manager.

## Identity

- [ ] **Bundle ID / package name** is provisional: `app.shisho.mobile`. It cannot be changed after publishing. Confirm it, ideally the reverse of a domain you own.
- [ ] Confirm the name "Shisho AI" is free to use in both stores (trademark clearance not done).
- [ ] Replace the 512px emblem with a 1024px+ original (see the asset register).

## Policy and compliance (verify against current rules)

- [ ] **Privacy policy at a public URL.** Both stores require one. The website is not deployed, so there is no URL yet. BLOCKER. The text in `lib/legalPages.ts` describes the website; write the app's own. It must cover sign-in, the text sent to Shisho and on to an AI provider, the random device ID, and what stays only on the phone.
- [ ] **Apple privacy nutrition label and Google Data safety form.** The app now has sign-in and sends drafts to the site, so it **does collect and send data**: email and password (sign-in), the text you submit to Shisho (passed to an AI provider, not saved by Shisho), a random device ID, and any file a person attaches to Shisho (passed on the same way). The app also asks for notification permission, only when a reminder is switched on. Answer the forms from that, and re-answer whenever it changes.
- [ ] **Account deletion.** Accounts can now be created in the app, and deletion is built in (Me > Account). Verify each store's current rules on in-app account deletion and what it must cover.
- [ ] **Payments.** None exist. If paid plans are added, check each store's current rules on in-app purchase versus external payment.
- [ ] **Content and category rules for legal-information apps and AI-generated content.** Check current guidelines on disclaimers, claims of professional advice, and disclosure of AI use. The app states "not legal advice" on every tool.
- [ ] **Age rating questionnaires** (both stores).
- [ ] **Target SDK / API level and 64-bit requirements** for Android; **minimum Xcode/SDK** for iOS. Expo's chosen SDK sets these; check that SDK 58 meets the current requirement at submission time.
- [ ] **Support contact.** A support email or URL is required. `NEXT_PUBLIC_CONTACT_EMAIL` is still unset on the website.
- [ ] India-specific: the Bar Council of India's rules on advertising by advocates, if an advocate is associated with the app's marketing (see `PRODUCT.md`).

## Listing material

- [ ] Screenshots at each store's current required sizes, from a real device or emulator.
- [ ] Short and long descriptions that match what is actually built (see `README.md`, "What works"). Do not list Shisho drafting, accounts, courses or payments.
- [ ] Open-source notices screen (not built yet).
- [ ] Signing: Android upload key and Apple certificates/profiles. Keep them out of the repository (`mobile/.gitignore` already excludes `*.jks`, `*.p12`, `*.key`, `*.mobileprovision`).

## Testing still to do before any submission

- [ ] Run on a real Android phone and an iPhone (only the web build and the native bundles have been checked so far).
- [ ] Screen reader pass with TalkBack and VoiceOver.
- [ ] Large-text and small-phone checks.
- [ ] Offline and airplane-mode check of every tool.
- [ ] Interruption check: leave and return mid-form.
