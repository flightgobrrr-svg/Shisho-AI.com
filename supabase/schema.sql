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

-- ============================================================================
-- INTEREST SIGN-UPS: "tell me when this opens" for the audiences that are
-- planned but not built (/for/[slug]). One row per (email, audience).
-- Same trust model as usage_counters: RLS enabled, no policies, service_role
-- only. The browser never reads or writes this directly; app/api/interest
-- does, after validating the audience against lib/audiences.ts.
--
-- NOT YET APPLIED to any project. Until this is run, /api/interest answers
-- 503 and the form says sign-up is not open yet.
-- ============================================================================
create table if not exists interest_signups (
  email text not null,
  audience text not null,
  created_at timestamptz not null default now(),
  primary key (email, audience)
);

alter table interest_signups enable row level security;

-- ============================================================================
-- PAID PLANS (Razorpay) and the app's Shisho tools — added together.
--
-- 1. `basic` joins the plan list (lib/pricing.ts already sells it at ₹9).
-- 2. A paid month sets `plan_expires_at`; lib/profile.ts reads the plan as
--    free once it passes. Null means the plan never lapses (set by hand).
-- 3. The "users can update their own profile" policy is DROPPED. It let any
--    signed-in person write their own `plan` straight through PostgREST with
--    the publishable key, which stops being harmless once a plan costs money.
--    Nothing in the app used it; plans are written only by service_role
--    (lib/payments.ts) after a verified payment.
-- 4. `payments`: one row per Razorpay payment link. service_role only.
-- 5. usage_counters gains the `tool` kind (lib/aiTools.ts quota).
-- ============================================================================
alter table profiles drop constraint if exists profiles_plan_check;
alter table profiles add constraint profiles_plan_check
  check (plan in ('free', 'basic', 'core', 'proficient', 'addon'));
alter table profiles add column if not exists plan_expires_at timestamptz;

drop policy if exists "users can update their own profile" on profiles;

alter table usage_counters drop constraint if exists usage_counters_kind_check;
alter table usage_counters add constraint usage_counters_kind_check
  check (kind in ('review', 'assistant', 'tool'));

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('basic', 'core', 'proficient', 'addon')),
  amount_paise integer not null check (amount_paise > 0),
  provider text not null default 'razorpay',
  link_id text unique,
  payment_id text,
  status text not null default 'created'
    check (status in ('created', 'paid', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists payments_user_idx on payments (user_id, created_at desc);

alter table payments enable row level security;
-- No policies: service_role only, same trust model as usage_counters.

-- handle_new_user() is a trigger function. Supabase's security advisor flags
-- that, as a SECURITY DEFINER function in `public`, it is also callable over
-- the API (/rest/v1/rpc/handle_new_user) by anon and signed-in users. It is
-- only meant to run from the trigger, which does not need EXECUTE granted.
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- The Free plan's daily Library digest in the app (lib/entitlements.ts
-- FREE_DAILY_DIGESTS; counted over 24 hours by lib/usageCounters.ts).
alter table usage_counters drop constraint if exists usage_counters_kind_check;
alter table usage_counters add constraint usage_counters_kind_check
  check (kind in ('review', 'assistant', 'tool', 'digest'));

-- ============================================================================
-- ATOMIC USAGE: consume_usage / refund_usage (lib/usageCounters.ts).
--
-- The free allowances were read-then-write: twelve requests fired at once
-- all read "0 used" and all got through (found under load, 23 Oct 2026). These
-- functions check and count in one step under a row lock, so parallel
-- requests queue instead of slipping past each other.
--
-- consume_usage returns the uses left after this one, or -1 when the limit is
-- already reached (nothing is counted then). refund_usage gives one back, for
-- a request that ended without a real answer (a demo reply or an error).
-- service_role only, like the table itself.
-- ============================================================================
create or replace function public.consume_usage(p_visitor uuid, p_kind text, p_limit integer, p_period_seconds integer)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_count integer;
  v_start timestamptz;
begin
  insert into usage_counters (visitor_id, kind, count, period_start, updated_at)
  values (p_visitor, p_kind, 0, now(), now())
  on conflict (visitor_id, kind) do nothing;

  select count, period_start into v_count, v_start
  from usage_counters
  where visitor_id = p_visitor and kind = p_kind
  for update;

  if now() - v_start > make_interval(secs => p_period_seconds) then
    v_count := 0;
    v_start := now();
  end if;

  if v_count >= p_limit then
    update usage_counters set count = v_count, period_start = v_start, updated_at = now()
    where visitor_id = p_visitor and kind = p_kind;
    return -1;
  end if;

  update usage_counters set count = v_count + 1, period_start = v_start, updated_at = now()
  where visitor_id = p_visitor and kind = p_kind;
  return p_limit - v_count - 1;
end;
$$;

create or replace function public.refund_usage(p_visitor uuid, p_kind text)
returns void
language sql
security definer set search_path = public
as $$
  update usage_counters set count = greatest(count - 1, 0), updated_at = now()
  where visitor_id = p_visitor and kind = p_kind;
$$;

revoke execute on function public.consume_usage(uuid, text, integer, integer) from anon, authenticated, public;
revoke execute on function public.refund_usage(uuid, text) from anon, authenticated, public;

-- ============================================================================
-- ADVOCATE CLERK WORK (lib/clerkWork.ts, lib/clerkStore.ts,
-- app/api/mobile/clerk/*). Stage 1: offices and roles, the case register,
-- uploaded case PDFs and blank forms, extracted fields with their source page
-- and confidence, saved form mappings, generated documents and the audit log.
--
-- Client case files are private office records. Same trust model as every
-- table above: RLS on, no policies, service_role only. Every read and write
-- goes through the API routes, which check office membership and role
-- (lib/clerkWork.ts `can`) before touching a row. Files live in the private
-- `clerk-files` storage bucket and are only ever streamed through those
-- routes, never by a public URL.
--
-- The case serial number (serial_no) is the office's own permanent number for
-- a matter, unique within the office. Case, CNR, filing and cause-list
-- numbers are kept in their own fields and are never used as it.
-- ============================================================================
create table if not exists clerk_offices (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 200),
  state text,
  district text,
  -- How long a deleted case is kept before it may be purged (null = kept until purged by hand).
  retention_days integer check (retention_days is null or retention_days >= 30),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists clerk_members (
  office_id uuid not null references clerk_offices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('office_admin','senior_advocate','advocate','junior_advocate','clerk','accounts','read_only')),
  active boolean not null default true,
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (office_id, user_id)
);
create index if not exists clerk_members_user on clerk_members (user_id);

create table if not exists clerk_matters (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references clerk_offices(id) on delete cascade,
  serial_no integer not null check (serial_no > 0),
  file_code text,
  parent_id uuid references clerk_matters(id),
  -- Denormalised from the chosen fields (clerk_fields) for the register's
  -- search and list. clerk_fields stays the source of truth.
  cause_title text,
  case_label text,
  court text,
  cnr text,
  client text,
  advocate text,
  next_hearing text,
  -- next_hearing read as a date when it can be read with certainty, for the dashboard.
  next_hearing_on date,
  -- A restricted matter is visible only to the administrator, senior advocates
  -- and the members listed in clerk_matter_access.
  restricted boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (office_id, serial_no)
);

create table if not exists clerk_uploads (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references clerk_offices(id) on delete cascade,
  matter_id uuid not null references clerk_matters(id) on delete cascade,
  kind text not null check (kind in ('case_data','blank_form')),
  filename text not null,
  mime_type text not null,
  bytes integer not null,
  sha256 text not null,
  storage_path text not null,
  pages integer,
  status text not null default 'stored' check (status in ('stored','processing','extracted','failed')),
  error text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists clerk_uploads_matter on clerk_uploads (matter_id);

create table if not exists clerk_fields (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references clerk_matters(id) on delete cascade,
  upload_id uuid references clerk_uploads(id) on delete set null,
  key text not null,
  value text not null default '',
  page integer,
  quote text,
  confidence text check (confidence in ('high','medium','low')),
  status text not null default 'unverified' check (status in ('unverified','confirmed','corrected')),
  chosen boolean not null default false,
  as_of text,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists clerk_fields_matter on clerk_fields (matter_id, key);

create table if not exists clerk_templates (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references clerk_offices(id) on delete cascade,
  work_no integer not null check (work_no between 1 and 63),
  name text not null,
  sha256 text not null,
  forum text,
  state text,
  district text,
  proceeding_type text,
  language text not null default 'en',
  mapping jsonb not null,
  version integer not null default 1,
  status text not null default 'active' check (status in ('active','archived')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  unique (office_id, sha256, version)
);

create table if not exists clerk_documents (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references clerk_offices(id) on delete cascade,
  -- Null for the office-wide daily sheets (cause list, daily work sheet…).
  matter_id uuid references clerk_matters(id) on delete cascade,
  work_no integer not null check (work_no between 1 and 63),
  version integer not null,
  status text not null default 'draft' check (status in ('draft','ready_for_execution')),
  upload_id uuid references clerk_uploads(id) on delete set null,
  template_id uuid references clerk_templates(id) on delete set null,
  field_values jsonb not null,
  -- A typed service's own answers (lib/clerkServices.ts).
  inputs jsonb not null default '{}',
  mapping jsonb,
  options jsonb not null default '{}',
  report jsonb not null default '{}',
  pdf_path text,
  docx_path text,
  pdf_name text,
  docx_name text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  deleted_at timestamptz,
  unique (matter_id, work_no, version)
);
create index if not exists clerk_documents_matter on clerk_documents (matter_id);

create table if not exists clerk_audit (
  id bigserial primary key,
  office_id uuid not null references clerk_offices(id) on delete cascade,
  matter_id uuid references clerk_matters(id) on delete cascade,
  actor uuid references auth.users(id) on delete set null,
  action text not null,
  detail jsonb not null default '{}',
  at timestamptz not null default now()
);
create index if not exists clerk_audit_matter on clerk_audit (matter_id, at desc);

create index if not exists clerk_documents_office on clerk_documents (office_id, created_at desc);

create table if not exists clerk_matter_access (
  matter_id uuid not null references clerk_matters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (matter_id, user_id)
);

-- Clerk tasks with the eleven statuses of lib/clerkRegisters.ts. Every
-- status change is kept in clerk_task_events with who and when.
create table if not exists clerk_tasks (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references clerk_offices(id) on delete cascade,
  matter_id uuid references clerk_matters(id) on delete cascade,
  work_no integer check (work_no between 1 and 63),
  title text not null check (char_length(title) between 2 and 300),
  notes text,
  status text not null default 'not_started' check (status in ('not_started','assigned','in_progress','awaiting_information','ready_for_review','corrections_required','approved','completed','returned_defective','re_presented','closed')),
  slot text check (slot in ('before_court','during_court','after_court','evening','tomorrow')),
  due_on date,
  assigned_to uuid references auth.users(id) on delete set null,
  document_id uuid references clerk_documents(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists clerk_tasks_office on clerk_tasks (office_id, status);
create index if not exists clerk_tasks_matter on clerk_tasks (matter_id);

create table if not exists clerk_task_events (
  id bigserial primary key,
  task_id uuid not null references clerk_tasks(id) on delete cascade,
  status text not null,
  note text,
  actor uuid references auth.users(id) on delete set null,
  at timestamptz not null default now()
);
create index if not exists clerk_task_events_task on clerk_task_events (task_id, at);

-- Hearings: what happened and the next date. A clerk's oral report is kept
-- apart from the court's own order (source) and shows as unconfirmed until
-- someone confirms it against the order.
create table if not exists clerk_hearings (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references clerk_offices(id) on delete cascade,
  matter_id uuid not null references clerk_matters(id) on delete cascade,
  hearing_on date not null,
  purpose text,
  result text not null,
  source text not null check (source in ('clerk_report','court_order')),
  next_on date,
  next_purpose text,
  directions text,
  confirmed_by uuid references auth.users(id) on delete set null,
  confirmed_at timestamptz,
  entered_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists clerk_hearings_matter on clerk_hearings (matter_id, hearing_on desc);
create index if not exists clerk_hearings_office on clerk_hearings (office_id, hearing_on);

-- Register entries (filings, objections, process and service, certified
-- copies, documents and originals, expenses, attendance). Fields per kind
-- are defined and validated in lib/clerkRegisters.ts.
create table if not exists clerk_entries (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references clerk_offices(id) on delete cascade,
  matter_id uuid references clerk_matters(id) on delete cascade,
  kind text not null check (kind in ('filing','objection','service','copy','custody','expense','attendance')),
  entry_date date,
  status text,
  amount numeric(14,2),
  data jsonb not null,
  document_id uuid references clerk_documents(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists clerk_entries_matter on clerk_entries (matter_id, kind);
create index if not exists clerk_entries_office on clerk_entries (office_id, kind, entry_date);

alter table clerk_matter_access enable row level security;
alter table clerk_tasks enable row level security;
alter table clerk_task_events enable row level security;
alter table clerk_hearings enable row level security;
alter table clerk_entries enable row level security;

alter table clerk_offices enable row level security;
alter table clerk_members enable row level security;
alter table clerk_matters enable row level security;
alter table clerk_uploads enable row level security;
alter table clerk_fields enable row level security;
alter table clerk_templates enable row level security;
alter table clerk_documents enable row level security;
alter table clerk_audit enable row level security;
-- No policies: service_role only.

insert into storage.buckets (id, name, public, file_size_limit)
values ('clerk-files', 'clerk-files', false, 20000000)
on conflict (id) do nothing;

-- ============================================================================
-- PAID PLAN GRANT: grant_paid_plan (lib/payments.ts confirmPayment).
--
-- confirmPayment used to mark the payment paid and then, as a second call,
-- write the plan. A failure between the two left a paid row with no plan,
-- and every retry saw "already paid" and stopped. Two payments confirming
-- together could also both read the same expiry and lose a month.
--
-- This does both writes in one transaction, with the payment and profile rows
-- locked, so a callback and a webhook arriving together queue: the first
-- grants, the second finds the row paid and returns the expiry unchanged.
--
-- Another month of the same plan adds on from the current expiry; a
-- different plan starts today (lib/payments.ts refuses to sell a cheaper plan
-- over an active dearer one). A plan set by hand to never lapse stays so.
-- Returns the plan's expiry. service_role only.
-- ============================================================================
create or replace function public.grant_paid_plan(p_payment uuid, p_payment_ref text)
returns timestamptz
language plpgsql
security definer set search_path = public
as $$
declare
  v_pay payments%rowtype;
  v_plan text;
  v_expires timestamptz;
begin
  select * into v_pay from payments where id = p_payment for update;
  if not found then
    raise exception 'payment % not found', p_payment;
  end if;

  select plan, plan_expires_at into v_plan, v_expires
  from profiles where id = v_pay.user_id for update;
  if not found then
    raise exception 'profile % not found', v_pay.user_id;
  end if;

  if v_pay.status = 'paid' then
    return v_expires;
  end if;

  if v_plan = v_pay.plan and v_expires is null then
    null; -- set by hand to never lapse: nothing to add
  elsif v_plan = v_pay.plan and v_expires > now() then
    v_expires := v_expires + interval '30 days';
  else
    v_expires := now() + interval '30 days';
  end if;

  update profiles
  set plan = v_pay.plan, plan_expires_at = v_expires, updated_at = now()
  where id = v_pay.user_id;

  update payments
  set status = 'paid', payment_id = p_payment_ref, paid_at = now()
  where id = p_payment;

  return v_expires;
end;
$$;

revoke execute on function public.grant_paid_plan(uuid, text) from anon, authenticated, public;

-- ---------------------------------------------------------------------------
-- Account deletion and Clerk Work records
--
-- Who created, uploaded, approved, confirmed or audited something in an office
-- is recorded against auth.users. Without an ON DELETE rule, deleting the
-- account of anyone who had used Clerk Work was refused by Postgres (so the
-- app's "Delete account" failed). The office's cases, files and history belong
-- to the office, so they stay; the person on them is blanked and shows as a
-- former member. Membership and restricted-case access rows still go with the
-- account (they cascade).
--
-- The column definitions above already say this for a new database. This
-- block brings an existing one into line; it is safe to run more than once.
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select * from (values
    ('clerk_offices', 'created_by'),
    ('clerk_members', 'added_by'),
    ('clerk_matters', 'created_by'),
    ('clerk_uploads', 'uploaded_by'),
    ('clerk_fields', 'decided_by'),
    ('clerk_templates', 'approved_by'),
    ('clerk_templates', 'created_by'),
    ('clerk_documents', 'created_by'),
    ('clerk_documents', 'approved_by'),
    ('clerk_audit', 'actor'),
    ('clerk_matter_access', 'added_by'),
    ('clerk_tasks', 'assigned_to'),
    ('clerk_tasks', 'created_by'),
    ('clerk_task_events', 'actor'),
    ('clerk_hearings', 'confirmed_by'),
    ('clerk_hearings', 'entered_by'),
    ('clerk_entries', 'created_by')
    ) as t(tbl, col)
  loop
    if to_regclass('public.' || r.tbl) is null then
      continue;
    end if;
    execute format('alter table public.%I alter column %I drop not null', r.tbl, r.col);
    execute format('alter table public.%I drop constraint if exists %I', r.tbl, r.tbl || '_' || r.col || '_fkey');
    execute format(
      'alter table public.%I add constraint %I foreign key (%I) references auth.users(id) on delete set null',
      r.tbl, r.tbl || '_' || r.col || '_fkey', r.col
    );
  end loop;
end;
$$;
