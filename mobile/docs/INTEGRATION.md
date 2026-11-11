# How the app connects to the website's online service

**Built.** This replaces the earlier plan. Everything below is in the repository; the untested parts are listed at the end.

## Routes (all new files under `app/api/mobile/`)

| Route | Purpose |
|---|---|
| `POST /auth/login`, `/auth/register`, `/auth/refresh` | Supabase Auth through the library, returning tokens as JSON. Same rules as the website (valid email, 8+ character password). Login gives one message for wrong password and unknown email. |
| `POST /auth/delete` | Deletes the signed-in account and its usage record. The user ID comes from the token, never the body. |
| `GET /me` | The user and plan. |
| `POST /assistant`, `POST /review` | Forward to the website's `/api/assistant` and `/api/draft` handlers **unchanged**. |
| `GET /digest/[slug]` | A curated Library digest as JSON. Only judgments in the curated list resolve. |
| `GET /lookup?q=` | Look up any judgment. Signed-in only, because each new one can cost a model call. |

## How the existing handlers are reused

The website signs in with httpOnly cookies. The app sends `Authorization: Bearer <access>` plus `X-Refresh-Token`, and a random `X-Device-Id`. `forwardToHandler` (`lib/mobileApi.ts`) turns those into an ordinary request whose `Cookie` header carries the device ID as the anonymous visitor cookie and, when signed in, a session cookie that **`@supabase/ssr` itself builds** from the tokens, so the format is the library's. The handlers then apply the plan, quota, prompts and model exactly as for the website. Any `Set-Cookie` they produce is dropped; the app refreshes its own tokens.

If tokens are supplied but Supabase rejects them, the answer is 401 so the app can refresh. It is never quietly treated as anonymous.

## Rules kept

- **Secrets stay on the server.** The app holds no model key, Supabase service key or OAuth secret; only `EXPO_PUBLIC_API_URL` (public) and the user's own tokens.
- **No protected file was edited.** `lib/authSession.ts`, `app/api/assistant/route.ts`, `app/api/draft/route.ts` are imported or called, never changed.
- **HTTPS in production.** Plain `http://` is for development only.
- **Minimal permissions.** The app requests none.
- **Honest states.** Every online screen has loading, empty, error and offline states and says "not connected" rather than faking a result.
- **Account deletion** exists in the app, as the stores expect for apps that create accounts. Verify each store's current rule before submitting.

## Tested, and not

Tested: input validation and signed-out guards on every route; one real call each to review and digest through the adapters (both served in demo mode, as the site is configured); the assistant adapter reached the live Gemini call, which answered 503 (provider busy). All of it end to end from an Android emulator for review and the Library.

**Not tested: anything that needs a real signed-in session**, including the cookie reconstruction in `buildCookieHeader`, refresh, delete, `me` and lookup. These were not exercised because they need a real account on your live Supabase project. Try them with a throwaway account.

## Credentials and services still needed

| Need | For |
|---|---|
| A deployed HTTPS URL for the site | Anything off your own network; the stores' privacy-policy URL |
| A model key that is not at capacity (server side, already how the site works) | Live Shisho and digests |
| Expo account; Apple Developer and Google Play accounts | Builds and release |
| Firebase Cloud Messaging and Apple Push credentials | Push notifications (not built) |
| A payment provider | Paid plans (not built; the website has none) |
