-- ─────────────────────────────────────────────────────────────────────────────
-- SLF — Program Library, Assignment & Execution Architecture
-- Migration 03 — Part A: Blueprint layer
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Drop old flat program tables (replaced by this architecture) ──────────────
-- Order matters: children first

drop table if exists performed_sets       cascade;
drop table if exists session_summaries    cascade;
drop table if exists training_sessions    cascade;
drop table if exists workout_sets         cascade;
drop table if exists workout_exercises    cascade;
drop table if exists workouts             cascade;
drop table if exists training_days        cascade;
drop table if exists training_weeks       cascade;
drop table if exists training_blocks      cascade;
drop table if exists programs             cascade;

-- Drop old enums that are being replaced
drop type if exists program_status cascade;
drop type if exists block_type     cascade;
drop type if exists week_status    cascade;
drop type if exists day_status     cascade;
drop type if exists set_type       cascade;
drop type if exists session_status cascade;

-- ── New enums ─────────────────────────────────────────────────────────────────

create type program_type       as enum ('template', 'custom', 'group');
create type program_visibility as enum ('private', 'assigned', 'public');
create type version_status     as enum ('draft', 'published', 'archived');
create type block_goal         as enum ('accumulation', 'strength', 'intensification', 'peak', 'deload', 'test');
create type load_type          as enum ('fixed', 'percentage', 'rpe', 'rpe_range', 'e1rm_percentage', 'amrap', 'athlete_calculated');
create type set_type           as enum ('warmup', 'working', 'backoff', 'top_set', 'amrap', 'dropset');
create type assignment_status  as enum ('active', 'paused', 'completed', 'cancelled');
create type session_status     as enum ('not_started', 'in_progress', 'paused', 'completed', 'cancelled');
create type subscription_tier  as enum ('member', 'pro', 'elite');
create type subscription_status as enum ('active', 'expired', 'cancelled', 'trial');

-- ── 01. programs ──────────────────────────────────────────────────────────────
-- The high-level product. Coach creates once, many athletes can be assigned.

create table programs (
  id               uuid primary key default uuid_generate_v4(),
  program_code     text unique,                          -- e.g. 'SLF-P03'
  program_number   int,
  name             text not null,
  description      text,
  program_type     program_type not null default 'template',
  visibility       program_visibility not null default 'private',
  duration_weeks   int,
  created_by       uuid not null references profiles(id) on delete restrict,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_programs_created_by on programs(created_by);

-- ── 02. program_versions ──────────────────────────────────────────────────────
-- Immutable once published. New edits = new version.

create table program_versions (
  id             uuid primary key default uuid_generate_v4(),
  program_id     uuid not null references programs(id) on delete cascade,
  version_number int not null default 1,
  status         version_status not null default 'draft',
  notes          text,                                   -- changelog
  created_by     uuid not null references profiles(id) on delete restrict,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (program_id, version_number)
);

create index idx_pversions_program on program_versions(program_id);

-- ── 03. program_blocks ────────────────────────────────────────────────────────

create table program_blocks (
  id                 uuid primary key default uuid_generate_v4(),
  program_version_id uuid not null references program_versions(id) on delete cascade,
  block_number       int not null,
  name               text not null,                      -- e.g. 'Accumulation'
  goal               block_goal not null default 'accumulation',
  description        text,
  start_week         int not null,
  end_week           int not null,
  order_index        int not null default 1,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_pblocks_version on program_blocks(program_version_id);

-- ── 04. mesocycles ────────────────────────────────────────────────────────────

create table mesocycles (
  id               uuid primary key default uuid_generate_v4(),
  block_id         uuid not null references program_blocks(id) on delete cascade,
  mesocycle_number int not null,
  name             text not null,                        -- e.g. 'Meso 1'
  goal             text,
  description      text,
  start_week       int not null,
  end_week         int not null,
  order_index      int not null default 1,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_mesos_block on mesocycles(block_id);

-- ── 05. program_weeks ─────────────────────────────────────────────────────────

create table program_weeks (
  id           uuid primary key default uuid_generate_v4(),
  mesocycle_id uuid not null references mesocycles(id) on delete cascade,
  week_number  int not null,
  name         text,                                     -- e.g. 'Week 6'
  focus        text,
  order_index  int not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_pweeks_meso on program_weeks(mesocycle_id);

-- ── 06. program_days ──────────────────────────────────────────────────────────

create table program_days (
  id            uuid primary key default uuid_generate_v4(),
  week_id       uuid not null references program_weeks(id) on delete cascade,
  day_number    int not null,
  day_name      text,                                    -- e.g. 'Monday'
  title         text,                                    -- e.g. 'Lower Body'
  notes         text,
  order_index   int not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_pdays_week on program_days(week_id);

-- ── 07. program_day_exercises ─────────────────────────────────────────────────
-- One row per exercise slot in a day. Sets are in program_exercise_sets.

create table program_day_exercises (
  id            uuid primary key default uuid_generate_v4(),
  day_id        uuid not null references program_days(id) on delete cascade,
  exercise_id   uuid not null references exercises(id) on delete restrict,
  order_index   int not null default 1,
  notes         text,
  video_cue     text,
  is_optional   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_pdayex_day on program_day_exercises(day_id);

-- ── 08. program_exercise_sets ─────────────────────────────────────────────────
-- Individual set prescriptions. Handles 1×5 @ 155, 1×1 @ 175, 2×5 @ 140 etc.

create table program_exercise_sets (
  id                   uuid primary key default uuid_generate_v4(),
  day_exercise_id      uuid not null references program_day_exercises(id) on delete cascade,
  set_number           int not null,
  set_type             set_type not null default 'working',
  reps                 int,
  rpe_min              numeric(3,1),
  rpe_max              numeric(3,1),
  weight_kg            numeric(6,2),
  percentage_1rm       numeric(5,2),
  load_type            load_type not null default 'fixed',
  tempo                text,                             -- e.g. '3-1-1-0'
  rest_seconds         int,
  notes                text,
  created_at           timestamptz not null default now()
);

create index idx_pexsets_dayex on program_exercise_sets(day_exercise_id);

-- ── 09. updated_at triggers for blueprint tables ──────────────────────────────

create trigger trg_programs_updated_at
  before update on programs for each row execute function set_updated_at();
create trigger trg_pversions_updated_at
  before update on program_versions for each row execute function set_updated_at();
create trigger trg_pblocks_updated_at
  before update on program_blocks for each row execute function set_updated_at();
create trigger trg_mesos_updated_at
  before update on mesocycles for each row execute function set_updated_at();
create trigger trg_pweeks_updated_at
  before update on program_weeks for each row execute function set_updated_at();
create trigger trg_pdays_updated_at
  before update on program_days for each row execute function set_updated_at();
create trigger trg_pdayex_updated_at
  before update on program_day_exercises for each row execute function set_updated_at();

-- RLS for blueprint tables is applied in migration 20260912100001
-- after program_assignments table exists (required by athlete_has_program_version helper)
