create type public.effort_level as enum ('low', 'medium', 'high');
create type public.challenge_mode as enum ('image', 'text');
create type public.approval_status as enum ('draft', 'needs_review', 'approved', 'published');

create table public.exhibitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  museum_name text not null,
  status text not null default 'draft',
  floor_map_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artifacts (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid not null references public.exhibitions(id) on delete cascade,
  external_id text,
  title text not null,
  period text,
  description text,
  museum_label text,
  aspect_labels text[] not null default '{}',
  highlight_label text,
  extracted_aspect_labels text[] not null default '{}',
  extracted_highlight_label text,
  effort_label public.effort_level not null default 'medium',
  interaction_style_label text not null default 'observe',
  gallery text,
  location_x numeric,
  location_y numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artifact_images (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.artifacts(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order int not null default 0
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.artifacts(id) on delete cascade,
  effort public.effort_level not null,
  mode public.challenge_mode not null,
  prompt text not null,
  answer text not null,
  distractors text[] not null default '{}',
  hint text,
  explanation text,
  approval_status public.approval_status not null default 'draft',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artifact_id, effort, mode)
);

create table public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.artifacts(id) on delete cascade,
  challenge_id uuid references public.challenges(id) on delete cascade,
  kind text not null check (kind in ('image-challenge', 'unsolved-cover', 'solved-cover')),
  source_photo_path text,
  visual_focus text not null,
  sketch_prompt text not null,
  generated_path text,
  status text not null default 'brief',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid references public.exhibitions(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  status text not null default 'uploaded',
  uploaded_by uuid,
  created_at timestamptz not null default now()
);

create bucket if not exists exhibition-assets public;
