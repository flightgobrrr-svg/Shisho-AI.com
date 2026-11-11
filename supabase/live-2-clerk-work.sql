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
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists clerk_members (
  office_id uuid not null references clerk_offices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('office_admin','senior_advocate','advocate','junior_advocate','clerk','accounts','read_only')),
  active boolean not null default true,
  added_by uuid references auth.users(id),
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
  created_by uuid not null references auth.users(id),
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
  uploaded_by uuid not null references auth.users(id),
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
  decided_by uuid references auth.users(id),
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
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid not null references auth.users(id),
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
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  deleted_at timestamptz,
  unique (matter_id, work_no, version)
);
create index if not exists clerk_documents_matter on clerk_documents (matter_id);

create table if not exists clerk_audit (
  id bigserial primary key,
  office_id uuid not null references clerk_offices(id) on delete cascade,
  matter_id uuid references clerk_matters(id) on delete cascade,
  actor uuid not null references auth.users(id),
  action text not null,
  detail jsonb not null default '{}',
  at timestamptz not null default now()
);
create index if not exists clerk_audit_matter on clerk_audit (matter_id, at desc);

create index if not exists clerk_documents_office on clerk_documents (office_id, created_at desc);

create table if not exists clerk_matter_access (
  matter_id uuid not null references clerk_matters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  added_by uuid references auth.users(id),
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
  assigned_to uuid references auth.users(id),
  document_id uuid references clerk_documents(id) on delete set null,
  created_by uuid not null references auth.users(id),
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
  actor uuid not null references auth.users(id),
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
  confirmed_by uuid references auth.users(id),
  confirmed_at timestamptz,
  entered_by uuid not null references auth.users(id),
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
  created_by uuid not null references auth.users(id),
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
