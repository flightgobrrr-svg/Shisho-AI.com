-- Shisho AI — Supabase schema.
--
-- Run this once, in the Supabase dashboard's SQL Editor, against a fresh
-- project. Idempotent — tables/indexes use IF NOT EXISTS, policies use
-- DROP POLICY IF EXISTS immediately before their CREATE POLICY (Postgres
-- has no CREATE POLICY IF NOT EXISTS — that syntax only exists for things
-- like CREATE TABLE/INDEX; using it here on a policy is a syntax error, not
-- a no-op) — so re-running the whole file after a partial failure is safe.
--
-- Nothing here is called from the browser. The app has no client-side
-- Supabase usage at all — every read and write goes through a Next.js API
-- route or server component, using the service_role key (see lib/supabase.ts).
-- That is the same "server-enforced, not client" discipline the entitlement
-- and drafting routes already hold themselves to. Because of that, Row Level
-- Security below is a second, defence-in-depth boundary, not the primary
-- one: even if it were ever misconfigured, no browser code holds a key that
-- could reach these tables directly.

-- ============================================================================
-- USAGE COUNTERS — replaces the cookie-editable counter in
-- lib/entitlements.ts / lib/assistantEntitlements.ts.
--
-- UPDATED: real login now exists (see PROFILES below) — `visitor_id` holds
-- either an anonymous cookie-random uuid (never logged in) OR a real
-- `auth.users.id` (logged in), same column, same shape, no schema change
-- needed for that switch since both are plain uuids. app/api/draft/route.ts
-- and app/api/assistant/route.ts decide which one to pass in per request.
-- This is what actually closes the "clear all cookies for a fresh quota"
-- hole the paragraph below used to flag as out of scope: an anonymous
-- visitor can still do that, but a REGISTERED one can't, because their quota
-- now follows their account, not a cookie.
--
-- Original reasoning, still true for the anonymous path: previously a plain,
-- human-readable cookie value a visitor could edit directly in devtools to
-- reset it. Now the cookie carries only an opaque random id; the number
-- lives here instead.
-- ============================================================================
create table if not exists usage_counters (
  visitor_id uuid not null,
  kind text not null check (kind in ('review', 'assistant')),
  count integer not null default 0,
  -- Mirrors the old cookie's rolling 30-day maxAge: a row older than 30 days
  -- is treated as expired and the count restarts, rather than resetting on
  -- a calendar boundary. See lib/usageCounters.ts.
  period_start timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (visitor_id, kind)
);

alter table usage_counters enable row level security;
-- No policies defined: RLS with zero policies denies ALL access via the
-- anon/authenticated roles. Only service_role (which bypasses RLS entirely,
-- by Supabase's own design) can touch this table — exactly right, since
-- quota data must never be readable or writable from the browser.

-- ============================================================================
-- LEGAL LIBRARY — courts and cases.
--
-- `cases` holds BOTH the hand-curated entries that already live in
-- lib/library.ts (migrated in, not re-verified — they were already checked)
-- and anything the ingestion pipeline pulls in later. `status` is the one
-- enforcement point for the non-negotiable rule in lib/library.ts's own
-- header: nothing with status other than 'verified' is ever selected by the
-- public Library page. A row lands as 'pending_review' and stays there,
-- inert, until a human moves it — the ingestion service that will write
-- these rows is deliberately not given any way to set status itself.
-- ============================================================================
create table if not exists courts (
  id text primary key,
  name text not null
);

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  -- Nullable, same reasoning as citation below: the ingestion parser
  -- (lib/openJudgments.ts) extracts the title from a scraped page's HTML on
  -- a best-effort basis, verified against only one real example while this
  -- was built. A row it can't confidently parse a title from still lands as
  -- pending_review with title null, rather than a placeholder standing in
  -- for something never actually confirmed.
  title text,
  -- Also nullable: the source dataset's neutral/reporter citation, when the
  -- parser finds one, is real, not invented — but not every judgment has
  -- one (older cases predate India's neutral-citation system), and nothing
  -- here is guessed when it's absent. A pending_review row is allowed to
  -- have no citation yet; the constraint below is what actually stops one
  -- from being marked verified without a human having supplied or
  -- confirmed a real one.
  citation text,
  court_id text not null references courts(id),
  -- Nullable, same reasoning as title/citation. `topic` names the SUBJECT of
  -- the judgment (lib/library.ts's own rule) — not extractable from the
  -- scraped markup at all, which carries party names and citations but
  -- nothing about what the case is actually about. A human writes the real
  -- topic during review; the parser was never going to guess it honestly.
  topic text,
  -- As of the public Library reading from this table (lib/verifiedCases.ts),
  -- tags[0] holds the case's category — one of lib/library.ts's own
  -- CATEGORIES, written by a reviewer at approval time in
  -- app/admin/review, never by the scraper. Reused rather than adding a
  -- dedicated column: this array already existed, unused, and one string
  -- was all a category ever needed. Not covered by the verified_cases_...
  -- CHECK constraint below — a verified row missing it is simply invisible
  -- to every category filter, not a database error.
  tags text[] not null default '{}',
  decision_date date,

  -- Populated once a source is wired in. Both null for the hand-curated
  -- rows migrated from lib/library.ts, which have no single external source
  -- document — their citation was checked against whatever reported source
  -- lib/library.ts's own commit history names.
  full_text text,
  source_url text,
  source_doc_id text,

  status text not null default 'verified'
    check (status in ('pending_review', 'verified', 'rejected')),
  ingested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,

  constraint verified_cases_need_title_citation_and_topic
    check (
      status <> 'verified'
      or (title is not null and citation is not null and topic is not null)
    ),

  search tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(topic, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(full_text, '')), 'C')
  ) stored,

  created_at timestamptz not null default now()
);

create index if not exists cases_search_idx on cases using gin(search);
create index if not exists cases_status_idx on cases(status);
create index if not exists cases_source_doc_idx on cases(source_doc_id)
  where source_doc_id is not null; -- ingestion dedup lookup

alter table courts enable row level security;
alter table cases enable row level security;

-- Courts are pure reference data — safe to read publicly if a client-side
-- read is ever added later. Still no INSERT/UPDATE policy: only service_role
-- (the app's own server code) can write.
--
-- DROP POLICY IF EXISTS immediately before CREATE POLICY, not CREATE POLICY
-- IF NOT EXISTS — Postgres doesn't support the latter (see this file's own
-- header). The drop-then-create pair is what actually makes this block safe
-- to re-run.
drop policy if exists "courts are publicly readable" on courts;
create policy "courts are publicly readable"
  on courts for select
  using (true);

-- The actual enforcement of "unverified content is never shown": even if a
-- future feature reads `cases` directly with the anon key instead of going
-- through a server route, this policy still only ever surfaces verified rows.
drop policy if exists "only verified cases are publicly readable" on cases;
create policy "only verified cases are publicly readable"
  on cases for select
  using (status = 'verified');

-- Seeded with only the courts the existing 32 hand-curated entries in
-- lib/library.ts actually use (checked, not assumed) — 'supreme-court'
-- matches app/api/cron/ingest-judgments/route.ts's SOURCE_COURT_ID. Add a
-- row here before ingesting from a new court; the foreign key on
-- cases.court_id means an unseeded court fails every insert, loudly.
insert into courts (id, name) values
  ('supreme-court', 'Supreme Court'),
  ('delhi-hc', 'Delhi High Court')
on conflict (id) do nothing;

-- ============================================================================
-- GOOGLE DRIVE CONNECTIONS — a user's own Drive, used as read-only
-- style/structure grounding for the drafting agent (app/api/assistant/route.ts,
-- via lib/googleDrive.ts and lib/driveConnection.ts). The agent itself is
-- untouched by this feature: a Drive file is converted to the same
-- {filename, mimeType, dataBase64} shape a manual chat attachment already is,
-- so it reaches the model through the existing, unmodified upload path.
--
-- Keyed by the SAME anonymous visitor_id as usage_counters above — same
-- login-free trust model, same accepted limitation (clearing cookies loses
-- the connection here exactly as it loses usage history there; real login
-- was scoped out for that table and stays scoped out for this one too).
--
-- `refresh_token` is a real, long-lived secret — a leaked row grants ongoing
-- access to whatever Drive folder the visitor picked. RLS + service_role-only
-- access (no policies, same as usage_counters) is the whole protection; there
-- is no application-level encryption-at-rest layer in this project to add
-- another one on top of, so this matches the existing security posture rather
-- than introducing new cryptography.
-- ============================================================================
create table if not exists google_drive_connections (
  visitor_id uuid primary key,
  refresh_token text not null,
  -- Both null until a folder has actually been chosen via Picker — a
  -- connection can exist (OAuth done) before a folder does.
  folder_id text,
  folder_name text,
  -- Cached listing from the last successful folder read (id/name/mimeType/
  -- modifiedTime per file) — avoids a Drive API round trip every time the
  -- chat's template picker renders. Refreshed whenever the folder is
  -- (re)selected, not on a timer.
  files jsonb not null default '[]',
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table google_drive_connections enable row level security;
-- Same trust model as usage_counters: RLS enabled, zero policies — only
-- service_role (server-side only, never the browser) can read or write.
-- refresh_token must never be reachable via the anon key.

-- ============================================================================
-- PROFILES — one row per real, logged-in user (auth.users, Supabase's own
-- built-in table — not created here). Added alongside real login
-- (lib/authSession.ts); `plan` is the new source of truth for a REGISTERED
-- visitor's plan, read via lib/profile.ts. An anonymous (never logged in)
-- visitor still reads/writes the pre-existing `shisho_plan` cookie exactly
-- as before (lib/entitlements.ts, untouched) — the two paths are decided
-- per-request in app/api/draft/route.ts and app/api/assistant/route.ts, not
-- a wholesale replacement of one system by the other.
--
-- `plan` is never writable by the client under the policies below — the app
-- only ever reads/writes it through the service_role client (lib/supabase.ts),
-- same discipline as usage_counters above. The two policies exist for
-- defence-in-depth / a possible future direct-client read, not because the
-- app relies on them for its own plan checks.
-- ============================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free'
    check (plan in ('free', 'core', 'proficient', 'addon')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "users can read their own profile" on profiles;
create policy "users can read their own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "users can update their own profile" on profiles;
create policy "users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-creates the profile row the instant someone registers, so the rest of
-- the app never has to special-case "authenticated but no profile row yet" —
-- lib/profile.ts's `getUserPlan` can assume a row exists for any real user id.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- CASE BRIEFS — a cache, not a source of truth. Keyed by the slug derived
-- from a case's title (lib/library.ts's `slugify`), covering BOTH the
-- hand-curated PREVIEW_CASES array and whatever lib/verifiedCases.ts merges
-- in from the `cases` table above — neither ever had a stable id before this.
--
-- `digest` (lib/caseBrief.ts's CaseDigest, minus `mode`) is a full law-
-- report-style citation digest — headnote, synopsis, ratio decidendi,
-- judicial analysis, and a dozen more fields, all derived by the model from
-- the judgment's OWN real text (fetched live from its already-verified
-- sourceUrl via lib/indianKanoon.ts), never from the model's memory of the
-- case. That's a meaningfully different (and stronger) trust boundary than
-- this table's first version, which drafted from memory alone with no
-- source text at all — kept as JSONB rather than one column per field
-- because the field list is large and was specified once, by the user, as a
-- whole template rather than something this schema should re-litigate one
-- migration at a time. app/library/judgments/[slug] still labels this
-- content as AI-prepared, distinct from the case's own independently
-- verified title/citation/court — never blur that distinction in the UI.
--
-- Generated once per case and cached indefinitely (no TTL/expiry column) —
-- these are landmark, decades-settled judgments; there is no "went stale"
-- condition for what a court held in 1973. Regenerate by deleting the row.
-- ============================================================================
-- This table's shape changed (flat facts/issue/holding/ratio columns ->
-- one jsonb digest) as the feature itself changed. Unlike every other
-- table in this file, dropping and recreating it is genuinely safe: it
-- holds nothing but a regeneratable cache, so there is no real data to lose
-- by starting clean rather than writing a migration for a cache table.
drop table if exists case_briefs;
create table case_briefs (
  slug text primary key,
  digest jsonb not null,
  mode text not null check (mode in ('live', 'demo')),
  generated_at timestamptz not null default now()
);

alter table case_briefs enable row level security;
-- No policies: service_role only, same trust model as usage_counters and
-- google_drive_connections above — the browser never reads this directly.
