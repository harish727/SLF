-- ─────────────────────────────────────────────────────────────────────────────
-- SLF — Complete Architecture: Program Library + Assignment + Execution
-- This migration consolidates the full system described in points 1-35
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensions ────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ── Enums ─────────────────────────────────────────────────────────────────────

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

-- ── PROGRAM LIBRARY ───────────────────────────────────────────────────────────

-- 01. programs — High-level product
create table programs (
  id               uuid primary key default uuid_generate_v4(),
  program_code     text unique,
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

-- 02. program_versions — Immutable once published
create table program_versions (
  id             uuid primary key default uuid_generate_v4(),
  program_id     uuid not null references programs(id) on delete cascade,
  version_number int not null default 1,
  status         version_status not null default 'draft',
  notes          text,
  created_by     uuid not null references profiles(id) on delete restrict,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (program_id, version_number)
);

create index idx_pversions_program on program_versions(program_id);

-- 03. program_blocks — Blocks within a version
create table program_blocks (
  id                 uuid primary key default uuid_generate_v4(),
  program_version_id uuid not null references program_versions(id) on delete cascade,
  block_number       int not null,
  name               text not null,
  goal               block_goal not null default 'accumulation',
  description        text,
  start_week         int not null,
  end_week           int not null,
  order_index        int not null default 1,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_pblocks_version on program_blocks(program_version_id);

-- 04. mesocycles — Mesocycles within blocks
create table mesocycles (
  id               uuid primary key default uuid_generate_v4(),
  block_id         uuid not null references program_blocks(id) on delete cascade,
  mesocycle_number int not null,
  name             text not null,
  goal             text,
  description      text,
  start_week       int not null,
  end_week         int not null,
  order_index      int not null default 1,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_mesos_block on mesocycles(block_id);

-- 05. program_weeks — Weeks within mesocycles
create table program_weeks (
  id           uuid primary key default uuid_generate_v4(),
  mesocycle_id uuid not null references mesocycles(id) on delete cascade,
  week_number  int not null,
  name         text,
  focus        text,
  order_index  int not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_pweeks_meso on program_weeks(mesocycle_id);

-- 06. program_days — Days within weeks
create table program_days (
  id            uuid primary key default uuid_generate_v4(),
  week_id       uuid not null references program_weeks(id) on delete cascade,
  day_number    int not null,
  day_name      text,
  title         text,
  notes         text,
  order_index   int not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_pdays_week on program_days(week_id);

-- 07. program_day_exercises — Exercise slots in a day
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

-- 08. program_exercise_sets — Individual set prescriptions
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
  tempo                text,
  rest_seconds         int,
  notes                text,
  created_at           timestamptz not null default now()
);

create index idx_pexsets_dayex on program_exercise_sets(day_exercise_id);

-- ── ACCESS & ASSIGNMENT ───────────────────────────────────────────────────────

-- 09. subscriptions — Athlete subscription tier
create table subscriptions (
  id              uuid primary key default uuid_generate_v4(),
  athlete_id      uuid not null references profiles(id) on delete cascade,
  tier            subscription_tier not null default 'member',
  status          subscription_status not null default 'trial',
  started_at      timestamptz not null default now(),
  expires_at      timestamptz,
  renewed_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_subscriptions_athlete on subscriptions(athlete_id);

-- 10. program_assignments — Athlete assigned to program version
create table program_assignments (
  id                  uuid primary key default uuid_generate_v4(),
  program_version_id  uuid not null references program_versions(id) on delete restrict,
  athlete_id          uuid not null references profiles(id) on delete cascade,
  assigned_by         uuid references profiles(id) on delete set null,
  status              assignment_status not null default 'active',
  start_date          date,
  expected_end_date   date,
  completed_at        timestamptz,
  current_week_number int not null default 1,
  current_day_id      uuid references program_days(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_assignments_athlete on program_assignments(athlete_id);
create index idx_assignments_version on program_assignments(program_version_id);

-- 11. assignment_overrides — Coach adjusts prescription for one athlete
create table assignment_overrides (
  id                   uuid primary key default uuid_generate_v4(),
  assignment_id        uuid not null references program_assignments(id) on delete cascade,
  day_exercise_id      uuid not null references program_day_exercises(id) on delete cascade,
  set_number           int,
  field                text not null,
  original_value       text,
  override_value       text not null,
  reason               text,
  created_by           uuid references profiles(id) on delete set null,
  created_at           timestamptz not null default now()
);

create index idx_overrides_assignment on assignment_overrides(assignment_id);

-- ── EXECUTION ─────────────────────────────────────────────────────────────────

-- 12. training_sessions — Athlete workout session
create table training_sessions (
  id                   uuid primary key default uuid_generate_v4(),
  athlete_id           uuid not null references profiles(id) on delete cascade,
  assignment_id        uuid references program_assignments(id) on delete set null,
  program_day_id       uuid references program_days(id) on delete set null,
  started_at           timestamptz,
  completed_at         timestamptz,
  status               session_status not null default 'not_started',
  duration_seconds     int,
  bodyweight_kg        numeric(5,2),
  feeling              int check (feeling between 1 and 5),
  session_rpe          numeric(3,1),
  athlete_notes        text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index idx_sessions_athlete      on training_sessions(athlete_id);
create index idx_sessions_athlete_date on training_sessions(athlete_id, started_at desc);
create index idx_sessions_assignment   on training_sessions(assignment_id);

-- 13. performed_exercises — Exercise performed in session
create table performed_exercises (
  id                   uuid primary key default uuid_generate_v4(),
  session_id           uuid not null references training_sessions(id) on delete cascade,
  day_exercise_id      uuid references program_day_exercises(id) on delete set null,
  exercise_id          uuid not null references exercises(id) on delete restrict,
  order_index          int not null default 1,
  notes                text,
  created_at           timestamptz not null default now()
);

create index idx_perfex_session on performed_exercises(session_id);

-- 14. performed_sets — Actual set data (prescription never overwritten)
create table performed_sets (
  id                   uuid primary key default uuid_generate_v4(),
  performed_exercise_id uuid not null references performed_exercises(id) on delete cascade,
  prescribed_set_id    uuid references program_exercise_sets(id) on delete set null,
  set_number           int not null,
  weight_kg            numeric(6,2) not null default 0,
  reps                 int not null default 0,
  rpe                  numeric(3,1),
  tempo_actual         text,
  rest_seconds         int,
  completed            boolean not null default true,
  e1rm_kg              numeric(6,2),
  is_training_pr       boolean not null default false,
  is_all_time_pr       boolean not null default false,
  performed_at         timestamptz not null default now(),
  created_at           timestamptz not null default now()
);

create index idx_perfsets_perfex   on performed_sets(performed_exercise_id);
create index idx_perfsets_exercise on performed_sets(performed_exercise_id, performed_at desc);

-- 15. session_summaries — Cached analytics
create table session_summaries (
  id                   uuid primary key default uuid_generate_v4(),
  session_id           uuid not null unique references training_sessions(id) on delete cascade,
  athlete_id           uuid not null references profiles(id) on delete cascade,
  total_sets           int not null default 0,
  completed_sets       int not null default 0,
  total_reps           int not null default 0,
  total_volume_kg      numeric(10,2) not null default 0,
  avg_rpe              numeric(3,1),
  prescribed_avg_rpe   numeric(3,1),
  rpe_drift            numeric(3,1),
  duration_seconds     int,
  squat_e1rm_kg        numeric(6,2),
  bench_e1rm_kg        numeric(6,2),
  deadlift_e1rm_kg     numeric(6,2),
  total_e1rm_kg        numeric(6,2),
  prev_total_e1rm_kg   numeric(6,2),
  e1rm_change_kg       numeric(6,2),
  prev_volume_kg       numeric(10,2),
  volume_change_kg     numeric(10,2),
  prescribed_sets      int,
  completion_pct       numeric(5,2),
  created_at           timestamptz not null default now()
);

create index idx_summaries_athlete on session_summaries(athlete_id);

-- 16. bodyweight_logs — Athlete bodyweight tracking
create table bodyweight_logs (
  id          uuid primary key default uuid_generate_v4(),
  athlete_id  uuid not null references profiles(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  weight_kg   numeric(5,2) not null,
  source      text not null default 'manual',
  notes       text,
  created_at  timestamptz not null default now()
);

create index idx_bodyweight_athlete on bodyweight_logs(athlete_id, recorded_at desc);

-- ── FUNCTIONS ─────────────────────────────────────────────────────────────────

-- Helper: check if athlete is assigned to a program version
create or replace function athlete_has_program_version(version_id uuid)
returns boolean language sql security definer
set search_path = public
as $$
  select exists (
    select 1 from program_assignments
    where program_version_id = version_id
      and athlete_id = auth.uid()
      and status = 'active'
  );
$$;

-- Compute e1RM using Epley formula
create or replace function compute_e1rm()
returns trigger language plpgsql as $$
begin
  if new.reps = 0 then
    new.e1rm_kg := null;
  elsif new.reps = 1 then
    new.e1rm_kg := new.weight_kg;
  else
    new.e1rm_kg := round((new.weight_kg * (1 + new.reps::numeric / 30))::numeric, 2);
  end if;
  return new;
end;
$$;

-- Set updated_at timestamp
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── TRIGGERS ──────────────────────────────────────────────────────────────────

create trigger trg_compute_e1rm
  before insert or update of weight_kg, reps
  on performed_sets
  for each row execute function compute_e1rm();

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
create trigger trg_subscriptions_updated_at
  before update on subscriptions for each row execute function set_updated_at();
create trigger trg_assignments_updated_at
  before update on program_assignments for each row execute function set_updated_at();
create trigger trg_sessions_updated_at
  before update on training_sessions for each row execute function set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────

-- Programs
alter table programs enable row level security;
create policy "programs: coach owns"
  on programs for all using (created_by = auth.uid());
create policy "programs: athlete reads assigned"
  on programs for select using (
    exists (
      select 1 from program_versions pv
      where pv.program_id = programs.id and athlete_has_program_version(pv.id)
    )
  );

-- Program versions
alter table program_versions enable row level security;
create policy "pversions: coach owns"
  on program_versions for all using (
    exists (select 1 from programs where id = program_versions.program_id and created_by = auth.uid())
  );
create policy "pversions: athlete reads assigned"
  on program_versions for select using (athlete_has_program_version(id));

-- Program blocks
alter table program_blocks enable row level security;
create policy "pblocks: coach owns"
  on program_blocks for all using (
    exists (
      select 1 from program_versions pv join programs p on p.id = pv.program_id
      where pv.id = program_blocks.program_version_id and p.created_by = auth.uid()
    )
  );
create policy "pblocks: athlete reads"
  on program_blocks for select using (athlete_has_program_version(program_version_id));

-- Mesocycles
alter table mesocycles enable row level security;
create policy "mesos: coach owns"
  on mesocycles for all using (
    exists (
      select 1 from program_blocks pb
        join program_versions pv on pv.id = pb.program_version_id
        join programs p on p.id = pv.program_id
      where pb.id = mesocycles.block_id and p.created_by = auth.uid()
    )
  );
create policy "mesos: athlete reads"
  on mesocycles for select using (
    exists (
      select 1 from program_blocks pb where pb.id = mesocycles.block_id
        and athlete_has_program_version(pb.program_version_id)
    )
  );

-- Program weeks
alter table program_weeks enable row level security;
create policy "pweeks: coach owns"
  on program_weeks for all using (
    exists (
      select 1 from mesocycles m
        join program_blocks pb on pb.id = m.block_id
        join program_versions pv on pv.id = pb.program_version_id
        join programs p on p.id = pv.program_id
      where m.id = program_weeks.mesocycle_id and p.created_by = auth.uid()
    )
  );
create policy "pweeks: athlete reads"
  on program_weeks for select using (
    exists (
      select 1 from mesocycles m join program_blocks pb on pb.id = m.block_id
      where m.id = program_weeks.mesocycle_id
        and athlete_has_program_version(pb.program_version_id)
    )
  );

-- Program days
alter table program_days enable row level security;
create policy "pdays: coach owns"
  on program_days for all using (
    exists (
      select 1 from program_weeks pw
        join mesocycles m on m.id = pw.mesocycle_id
        join program_blocks pb on pb.id = m.block_id
        join program_versions pv on pv.id = pb.program_version_id
        join programs p on p.id = pv.program_id
      where pw.id = program_days.week_id and p.created_by = auth.uid()
    )
  );
create policy "pdays: athlete reads"
  on program_days for select using (
    exists (
      select 1 from program_weeks pw
        join mesocycles m on m.id = pw.mesocycle_id
        join program_blocks pb on pb.id = m.block_id
      where pw.id = program_days.week_id
        and athlete_has_program_version(pb.program_version_id)
    )
  );

-- Program day exercises
alter table program_day_exercises enable row level security;
create policy "pdayex: coach owns"
  on program_day_exercises for all using (
    exists (
      select 1 from program_days pd
        join program_weeks pw on pw.id = pd.week_id
        join mesocycles m on m.id = pw.mesocycle_id
        join program_blocks pb on pb.id = m.block_id
        join program_versions pv on pv.id = pb.program_version_id
        join programs p on p.id = pv.program_id
      where pd.id = program_day_exercises.day_id and p.created_by = auth.uid()
    )
  );
create policy "pdayex: athlete reads"
  on program_day_exercises for select using (
    exists (
      select 1 from program_days pd
        join program_weeks pw on pw.id = pd.week_id
        join mesocycles m on m.id = pw.mesocycle_id
        join program_blocks pb on pb.id = m.block_id
      where pd.id = program_day_exercises.day_id
        and athlete_has_program_version(pb.program_version_id)
    )
  );

-- Program exercise sets
alter table program_exercise_sets enable row level security;
create policy "pexsets: coach owns"
  on program_exercise_sets for all using (
    exists (
      select 1 from program_day_exercises pde
        join program_days pd on pd.id = pde.day_id
        join program_weeks pw on pw.id = pd.week_id
        join mesocycles m on m.id = pw.mesocycle_id
        join program_blocks pb on pb.id = m.block_id
        join program_versions pv on pv.id = pb.program_version_id
        join programs p on p.id = pv.program_id
      where pde.id = program_exercise_sets.day_exercise_id and p.created_by = auth.uid()
    )
  );
create policy "pexsets: athlete reads"
  on program_exercise_sets for select using (
    exists (
      select 1 from program_day_exercises pde
        join program_days pd on pd.id = pde.day_id
        join program_weeks pw on pw.id = pd.week_id
        join mesocycles m on m.id = pw.mesocycle_id
        join program_blocks pb on pb.id = m.block_id
      where pde.id = program_exercise_sets.day_exercise_id
        and athlete_has_program_version(pb.program_version_id)
    )
  );

-- Subscriptions
alter table subscriptions enable row level security;
create policy "subscriptions: own"
  on subscriptions for all using (athlete_id = auth.uid());
create policy "subscriptions: coach reads"
  on subscriptions for select using (
    exists (select 1 from coach_athletes where coach_id = auth.uid() and athlete_id = subscriptions.athlete_id and status = 'active')
  );

-- Program assignments
alter table program_assignments enable row level security;
create policy "assignments: athlete reads own"
  on program_assignments for select using (athlete_id = auth.uid());
create policy "assignments: coach manages"
  on program_assignments for all using (
    assigned_by = auth.uid()
    or exists (select 1 from coach_athletes where coach_id = auth.uid() and athlete_id = program_assignments.athlete_id and status = 'active')
  );

-- Assignment overrides
alter table assignment_overrides enable row level security;
create policy "overrides: athlete reads own"
  on assignment_overrides for select using (
    exists (select 1 from program_assignments where id = assignment_overrides.assignment_id and athlete_id = auth.uid())
  );
create policy "overrides: coach manages"
  on assignment_overrides for all using (created_by = auth.uid());

-- Training sessions
alter table training_sessions enable row level security;
create policy "sessions: athlete manages"
  on training_sessions for all using (athlete_id = auth.uid());
create policy "sessions: coach reads"
  on training_sessions for select using (
    exists (select 1 from coach_athletes where coach_id = auth.uid() and athlete_id = training_sessions.athlete_id and status = 'active')
  );

-- Performed exercises
alter table performed_exercises enable row level security;
create policy "perfex: athlete manages"
  on performed_exercises for all using (
    exists (select 1 from training_sessions where id = performed_exercises.session_id and athlete_id = auth.uid())
  );
create policy "perfex: coach reads"
  on performed_exercises for select using (
    exists (
      select 1 from training_sessions ts
        join coach_athletes ca on ca.athlete_id = ts.athlete_id
      where ts.id = performed_exercises.session_id and ca.coach_id = auth.uid() and ca.status = 'active'
    )
  );

-- Performed sets
alter table performed_sets enable row level security;
create policy "perfsets: athlete manages"
  on performed_sets for all using (
    exists (
      select 1 from performed_exercises pe
        join training_sessions ts on ts.id = pe.session_id
      where pe.id = performed_sets.performed_exercise_id and ts.athlete_id = auth.uid()
    )
  );
create policy "perfsets: coach reads"
  on performed_sets for select using (
    exists (
      select 1 from performed_exercises pe
        join training_sessions ts on ts.id = pe.session_id
        join coach_athletes ca on ca.athlete_id = ts.athlete_id
      where pe.id = performed_sets.performed_exercise_id and ca.coach_id = auth.uid() and ca.status = 'active'
    )
  );

-- Session summaries
alter table session_summaries enable row level security;
create policy "summaries: athlete reads"
  on session_summaries for all using (athlete_id = auth.uid());
create policy "summaries: coach reads"
  on session_summaries for select using (
    exists (select 1 from coach_athletes where coach_id = auth.uid() and athlete_id = session_summaries.athlete_id and status = 'active')
  );

-- Bodyweight logs
alter table bodyweight_logs enable row level security;
create policy "bodyweight: athlete manages"
  on bodyweight_logs for all using (athlete_id = auth.uid());
create policy "bodyweight: coach reads"
  on bodyweight_logs for select using (
    exists (select 1 from coach_athletes where coach_id = auth.uid() and athlete_id = bodyweight_logs.athlete_id and status = 'active')
  );
