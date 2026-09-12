-- ─────────────────────────────────────────────────────────────────────────────
-- SLF — Phase 1 Core Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensions ────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ── Enums ─────────────────────────────────────────────────────────────────────

create type user_role        as enum ('athlete', 'coach', 'admin');
create type user_status      as enum ('active', 'suspended', 'deleted');
create type units_pref       as enum ('kg', 'lbs');

create type coach_rel_status as enum ('active', 'paused', 'ended');

create type exercise_category    as enum ('competition', 'variation', 'accessory', 'mobility', 'conditioning', 'warmup');
create type movement_pattern     as enum ('squat', 'hinge', 'press', 'pull', 'carry', 'other');
create type equipment_type       as enum ('barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'band', 'other');

create type program_status   as enum ('draft', 'active', 'completed', 'archived');
create type block_type       as enum ('accumulation', 'strength', 'intensification', 'peak', 'deload', 'test');
create type week_status      as enum ('upcoming', 'active', 'completed', 'skipped');
create type day_status       as enum ('upcoming', 'active', 'completed', 'skipped', 'rest');
create type set_type         as enum ('warmup', 'working', 'backoff', 'top_set', 'amrap', 'dropset');

create type session_status   as enum ('not_started', 'in_progress', 'paused', 'completed', 'cancelled');

-- ── 01. Profiles ──────────────────────────────────────────────────────────────
-- Extends auth.users (Supabase Auth owns the identity)

create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  first_name      text not null,
  last_name       text not null,
  display_name    text,
  avatar_path     text,
  phone           text,
  date_of_birth   date,
  timezone        text not null default 'Asia/Kolkata',
  units           units_pref not null default 'kg',
  role            user_role not null default 'athlete',
  status          user_status not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── 02. Athlete profiles ──────────────────────────────────────────────────────

create table athlete_profiles (
  id                      uuid primary key default uuid_generate_v4(),
  profile_id              uuid not null unique references profiles(id) on delete cascade,
  training_age_years      numeric(4,1),
  sport                   text,
  competition_level       text,
  federation              text,
  current_weight_class    text,
  preferred_training_days text[],
  training_frequency      int,
  gym_name                text,
  height_cm               numeric(5,1),
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ── 03. Coach ↔ Athlete relationship ─────────────────────────────────────────

create table coach_athletes (
  id          uuid primary key default uuid_generate_v4(),
  coach_id    uuid not null references profiles(id) on delete restrict,
  athlete_id  uuid not null references profiles(id) on delete restrict,
  status      coach_rel_status not null default 'active',
  started_at  date,
  ended_at    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (coach_id, athlete_id)
);

create index idx_coach_athletes_coach   on coach_athletes(coach_id);
create index idx_coach_athletes_athlete on coach_athletes(athlete_id);

-- ── 04. Exercise library ──────────────────────────────────────────────────────

create table exercises (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  slug                text not null unique,
  category            exercise_category not null default 'accessory',
  movement_pattern    movement_pattern not null default 'other',
  equipment           equipment_type not null default 'barbell',
  is_competition_lift boolean not null default false,
  description         text,
  is_active           boolean not null default true,
  created_by          uuid references profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── 05. Programs ──────────────────────────────────────────────────────────────

create table programs (
  id          uuid primary key default uuid_generate_v4(),
  athlete_id  uuid not null references profiles(id) on delete cascade,
  coach_id    uuid references profiles(id) on delete set null,
  name        text not null,
  description text,
  status      program_status not null default 'draft',
  start_date  date,
  end_date    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_programs_athlete on programs(athlete_id);

-- ── 06. Training blocks ───────────────────────────────────────────────────────

create table training_blocks (
  id          uuid primary key default uuid_generate_v4(),
  program_id  uuid not null references programs(id) on delete cascade,
  name        text not null,
  description text,
  block_type  block_type not null default 'accumulation',
  sequence    int not null default 1,
  start_date  date,
  end_date    date,
  status      program_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_blocks_program on training_blocks(program_id);

-- ── 07. Training weeks ────────────────────────────────────────────────────────

create table training_weeks (
  id          uuid primary key default uuid_generate_v4(),
  block_id    uuid not null references training_blocks(id) on delete cascade,
  week_number int not null,
  label       text,
  start_date  date,
  end_date    date,
  status      week_status not null default 'upcoming',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (block_id, week_number)
);

create index idx_weeks_block on training_weeks(block_id);

-- ── 08. Training days ─────────────────────────────────────────────────────────

create table training_days (
  id             uuid primary key default uuid_generate_v4(),
  week_id        uuid not null references training_weeks(id) on delete cascade,
  day_number     int not null,
  scheduled_date date,
  day_name       text,                    -- e.g. "Monday"
  title          text,                    -- e.g. "Lower Body"
  focus          text,                    -- e.g. "Squat + Deadlift"
  status         day_status not null default 'upcoming',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_days_week on training_days(week_id);

-- ── 09. Workouts (planned) ────────────────────────────────────────────────────

create table workouts (
  id                         uuid primary key default uuid_generate_v4(),
  training_day_id            uuid not null unique references training_days(id) on delete cascade,
  name                       text,
  instructions               text,
  estimated_duration_minutes int,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

-- ── 10. Workout exercises ─────────────────────────────────────────────────────

create table workout_exercises (
  id              uuid primary key default uuid_generate_v4(),
  workout_id      uuid not null references workouts(id) on delete cascade,
  exercise_id     uuid not null references exercises(id) on delete restrict,
  sequence        int not null default 1,
  tempo           text,
  rest_seconds    int,
  notes           text,
  is_optional     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_workout_exercises_workout on workout_exercises(workout_id);

-- ── 11. Prescribed sets ───────────────────────────────────────────────────────

create table workout_sets (
  id                    uuid primary key default uuid_generate_v4(),
  workout_exercise_id   uuid not null references workout_exercises(id) on delete cascade,
  set_number            int not null,
  set_type              set_type not null default 'working',
  prescribed_weight_kg  numeric(6,2),
  prescribed_reps       int,
  target_rpe            numeric(3,1),
  percentage_1rm        numeric(5,2),
  tempo                 text,
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_workout_sets_exercise on workout_sets(workout_exercise_id);

-- ── 12. Training sessions (actual) ───────────────────────────────────────────

create table training_sessions (
  id                uuid primary key default uuid_generate_v4(),
  athlete_id        uuid not null references profiles(id) on delete cascade,
  workout_id        uuid not null references workouts(id) on delete restrict,
  started_at        timestamptz,
  completed_at      timestamptz,
  status            session_status not null default 'not_started',
  duration_seconds  int,
  session_rpe       numeric(3,1),
  athlete_feedback  text,
  feeling           int check (feeling between 1 and 5),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_sessions_athlete     on training_sessions(athlete_id);
create index idx_sessions_athlete_date on training_sessions(athlete_id, started_at desc);

-- ── 13. Performed sets ────────────────────────────────────────────────────────
-- The most important table in the system.

create table performed_sets (
  id               uuid primary key default uuid_generate_v4(),
  session_id       uuid not null references training_sessions(id) on delete cascade,
  workout_set_id   uuid references workout_sets(id) on delete set null,
  exercise_id      uuid not null references exercises(id) on delete restrict,
  set_number       int not null,
  weight_kg        numeric(6,2) not null,
  reps             int not null,
  rpe              numeric(3,1),
  e1rm_kg          numeric(6,2),           -- computed on insert (Epley)
  is_pr            boolean not null default false,
  is_e1rm_best     boolean not null default false,
  completed        boolean not null default true,
  performed_at     timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

create index idx_performed_sets_session  on performed_sets(session_id);
create index idx_performed_sets_exercise on performed_sets(exercise_id, performed_at desc);
create index idx_performed_sets_athlete  on performed_sets(session_id, exercise_id);

-- ── 14. Session summaries (cached analytics) ──────────────────────────────────

create table session_summaries (
  id                   uuid primary key default uuid_generate_v4(),
  session_id           uuid not null unique references training_sessions(id) on delete cascade,
  athlete_id           uuid not null references profiles(id) on delete cascade,
  total_sets           int not null default 0,
  completed_sets       int not null default 0,
  total_reps           int not null default 0,
  total_volume_kg      numeric(10,2) not null default 0,
  avg_rpe              numeric(3,1),
  duration_seconds     int,
  squat_e1rm_kg        numeric(6,2),
  bench_e1rm_kg        numeric(6,2),
  deadlift_e1rm_kg     numeric(6,2),
  total_e1rm_kg        numeric(6,2),
  prev_total_e1rm_kg   numeric(6,2),
  e1rm_change_kg       numeric(6,2),
  prev_volume_kg       numeric(10,2),
  volume_change_kg     numeric(10,2),
  created_at           timestamptz not null default now()
);

create index idx_summaries_athlete on session_summaries(athlete_id);

-- ── 15. Bodyweight logs ───────────────────────────────────────────────────────

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

-- ── 16. e1RM trigger (Epley formula) ─────────────────────────────────────────

create or replace function compute_e1rm()
returns trigger language plpgsql as $$
begin
  if new.reps = 1 then
    new.e1rm_kg := new.weight_kg;
  else
    new.e1rm_kg := round((new.weight_kg * (1 + new.reps::numeric / 30))::numeric, 2);
  end if;
  return new;
end;
$$;

create trigger trg_compute_e1rm
  before insert or update of weight_kg, reps
  on performed_sets
  for each row execute function compute_e1rm();

-- ── 17. updated_at trigger ────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at          before update on profiles          for each row execute function set_updated_at();
create trigger trg_athlete_profiles_updated_at  before update on athlete_profiles  for each row execute function set_updated_at();
create trigger trg_coach_athletes_updated_at    before update on coach_athletes    for each row execute function set_updated_at();
create trigger trg_exercises_updated_at         before update on exercises         for each row execute function set_updated_at();
create trigger trg_programs_updated_at          before update on programs          for each row execute function set_updated_at();
create trigger trg_blocks_updated_at            before update on training_blocks   for each row execute function set_updated_at();
create trigger trg_weeks_updated_at             before update on training_weeks    for each row execute function set_updated_at();
create trigger trg_days_updated_at              before update on training_days     for each row execute function set_updated_at();
create trigger trg_workouts_updated_at          before update on workouts          for each row execute function set_updated_at();
create trigger trg_workout_exercises_updated_at before update on workout_exercises for each row execute function set_updated_at();
create trigger trg_workout_sets_updated_at      before update on workout_sets      for each row execute function set_updated_at();
create trigger trg_sessions_updated_at          before update on training_sessions for each row execute function set_updated_at();

-- ── 18. Auto-create profile on signup ────────────────────────────────────────

create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'athlete')
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── 19. RLS ───────────────────────────────────────────────────────────────────

alter table profiles          enable row level security;
alter table athlete_profiles  enable row level security;
alter table coach_athletes    enable row level security;
alter table exercises         enable row level security;
alter table programs          enable row level security;
alter table training_blocks   enable row level security;
alter table training_weeks    enable row level security;
alter table training_days     enable row level security;
alter table workouts          enable row level security;
alter table workout_exercises enable row level security;
alter table workout_sets      enable row level security;
alter table training_sessions enable row level security;
alter table performed_sets    enable row level security;
alter table session_summaries enable row level security;
alter table bodyweight_logs   enable row level security;

-- profiles: own row + coach can read their athletes
create policy "profiles: own"
  on profiles for all
  using (auth.uid() = id);

create policy "profiles: coach reads athletes"
  on profiles for select
  using (
    exists (
      select 1 from coach_athletes
      where coach_id = auth.uid()
        and athlete_id = profiles.id
        and status = 'active'
    )
  );

-- athlete_profiles: own row + assigned coach
create policy "athlete_profiles: own"
  on athlete_profiles for all
  using (profile_id = auth.uid());

create policy "athlete_profiles: coach reads"
  on athlete_profiles for select
  using (
    exists (
      select 1 from coach_athletes
      where coach_id = auth.uid()
        and athlete_id = athlete_profiles.profile_id
        and status = 'active'
    )
  );

-- coach_athletes: coach manages, athlete reads own
create policy "coach_athletes: coach manages"
  on coach_athletes for all
  using (coach_id = auth.uid());

create policy "coach_athletes: athlete reads own"
  on coach_athletes for select
  using (athlete_id = auth.uid());

-- exercises: everyone reads, coach/admin writes
create policy "exercises: read all"
  on exercises for select using (true);

create policy "exercises: coach writes"
  on exercises for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role in ('coach', 'admin'))
  );

-- programs: athlete reads own, coach manages their athletes
create policy "programs: athlete reads own"
  on programs for select
  using (athlete_id = auth.uid());

create policy "programs: coach manages"
  on programs for all
  using (coach_id = auth.uid());

-- training_blocks → training_weeks → training_days → workouts → workout_exercises → workout_sets
-- All follow the same pattern: athlete reads own chain, coach manages

create policy "blocks: athlete reads"
  on training_blocks for select
  using (exists (select 1 from programs where programs.id = training_blocks.program_id and programs.athlete_id = auth.uid()));

create policy "blocks: coach manages"
  on training_blocks for all
  using (exists (select 1 from programs where programs.id = training_blocks.program_id and programs.coach_id = auth.uid()));

create policy "weeks: athlete reads"
  on training_weeks for select
  using (exists (
    select 1 from training_blocks b join programs p on p.id = b.program_id
    where b.id = training_weeks.block_id and p.athlete_id = auth.uid()
  ));

create policy "weeks: coach manages"
  on training_weeks for all
  using (exists (
    select 1 from training_blocks b join programs p on p.id = b.program_id
    where b.id = training_weeks.block_id and p.coach_id = auth.uid()
  ));

create policy "days: athlete reads"
  on training_days for select
  using (exists (
    select 1 from training_weeks w join training_blocks b on b.id = w.block_id join programs p on p.id = b.program_id
    where w.id = training_days.week_id and p.athlete_id = auth.uid()
  ));

create policy "days: coach manages"
  on training_days for all
  using (exists (
    select 1 from training_weeks w join training_blocks b on b.id = w.block_id join programs p on p.id = b.program_id
    where w.id = training_days.week_id and p.coach_id = auth.uid()
  ));

create policy "workouts: athlete reads"
  on workouts for select
  using (exists (
    select 1 from training_days d join training_weeks w on w.id = d.week_id
      join training_blocks b on b.id = w.block_id join programs p on p.id = b.program_id
    where d.id = workouts.training_day_id and p.athlete_id = auth.uid()
  ));

create policy "workouts: coach manages"
  on workouts for all
  using (exists (
    select 1 from training_days d join training_weeks w on w.id = d.week_id
      join training_blocks b on b.id = w.block_id join programs p on p.id = b.program_id
    where d.id = workouts.training_day_id and p.coach_id = auth.uid()
  ));

create policy "workout_exercises: athlete reads"
  on workout_exercises for select
  using (exists (
    select 1 from workouts wo join training_days d on d.id = wo.training_day_id
      join training_weeks w on w.id = d.week_id join training_blocks b on b.id = w.block_id
      join programs p on p.id = b.program_id
    where wo.id = workout_exercises.workout_id and p.athlete_id = auth.uid()
  ));

create policy "workout_exercises: coach manages"
  on workout_exercises for all
  using (exists (
    select 1 from workouts wo join training_days d on d.id = wo.training_day_id
      join training_weeks w on w.id = d.week_id join training_blocks b on b.id = w.block_id
      join programs p on p.id = b.program_id
    where wo.id = workout_exercises.workout_id and p.coach_id = auth.uid()
  ));

create policy "workout_sets: athlete reads"
  on workout_sets for select
  using (exists (
    select 1 from workout_exercises we join workouts wo on wo.id = we.workout_id
      join training_days d on d.id = wo.training_day_id join training_weeks w on w.id = d.week_id
      join training_blocks b on b.id = w.block_id join programs p on p.id = b.program_id
    where we.id = workout_sets.workout_exercise_id and p.athlete_id = auth.uid()
  ));

create policy "workout_sets: coach manages"
  on workout_sets for all
  using (exists (
    select 1 from workout_exercises we join workouts wo on wo.id = we.workout_id
      join training_days d on d.id = wo.training_day_id join training_weeks w on w.id = d.week_id
      join training_blocks b on b.id = w.block_id join programs p on p.id = b.program_id
    where we.id = workout_sets.workout_exercise_id and p.coach_id = auth.uid()
  ));

-- training_sessions: athlete owns, coach reads
create policy "sessions: athlete manages"
  on training_sessions for all
  using (athlete_id = auth.uid());

create policy "sessions: coach reads"
  on training_sessions for select
  using (exists (
    select 1 from coach_athletes
    where coach_id = auth.uid() and athlete_id = training_sessions.athlete_id and status = 'active'
  ));

-- performed_sets: follows session ownership
create policy "performed_sets: athlete manages"
  on performed_sets for all
  using (exists (select 1 from training_sessions where id = performed_sets.session_id and athlete_id = auth.uid()));

create policy "performed_sets: coach reads"
  on performed_sets for select
  using (exists (
    select 1 from training_sessions ts join coach_athletes ca on ca.athlete_id = ts.athlete_id
    where ts.id = performed_sets.session_id and ca.coach_id = auth.uid() and ca.status = 'active'
  ));

-- session_summaries: athlete reads own, coach reads athletes
create policy "summaries: athlete reads"
  on session_summaries for all
  using (athlete_id = auth.uid());

create policy "summaries: coach reads"
  on session_summaries for select
  using (exists (
    select 1 from coach_athletes where coach_id = auth.uid() and athlete_id = session_summaries.athlete_id and status = 'active'
  ));

-- bodyweight: athlete manages own, coach reads
create policy "bodyweight: athlete manages"
  on bodyweight_logs for all
  using (athlete_id = auth.uid());

create policy "bodyweight: coach reads"
  on bodyweight_logs for select
  using (exists (
    select 1 from coach_athletes where coach_id = auth.uid() and athlete_id = bodyweight_logs.athlete_id and status = 'active'
  ));

-- ── 20. Seed: exercise library ────────────────────────────────────────────────

insert into exercises (name, slug, category, movement_pattern, equipment, is_competition_lift) values
  ('Back Squat',            'back-squat',            'competition',  'squat',  'barbell', true),
  ('Front Squat',           'front-squat',           'variation',    'squat',  'barbell', false),
  ('Paused Squat',          'paused-squat',           'variation',    'squat',  'barbell', false),
  ('High Bar Squat',        'high-bar-squat',         'variation',    'squat',  'barbell', false),
  ('Bench Press',           'bench-press',            'competition',  'press',  'barbell', true),
  ('Close Grip Bench',      'close-grip-bench',       'variation',    'press',  'barbell', false),
  ('Paused Bench',          'paused-bench',           'variation',    'press',  'barbell', false),
  ('Overhead Press',        'overhead-press',         'accessory',    'press',  'barbell', false),
  ('Deadlift',              'deadlift',               'competition',  'hinge',  'barbell', true),
  ('Romanian Deadlift',     'romanian-deadlift',      'accessory',    'hinge',  'barbell', false),
  ('Paused Deadlift',       'paused-deadlift',        'variation',    'hinge',  'barbell', false),
  ('Sumo Deadlift',         'sumo-deadlift',          'variation',    'hinge',  'barbell', false),
  ('Bulgarian Split Squat', 'bulgarian-split-squat',  'accessory',    'squat',  'dumbbell', false),
  ('Leg Press',             'leg-press',              'accessory',    'squat',  'machine',  false),
  ('Hamstring Curl',        'hamstring-curl',         'accessory',    'hinge',  'machine',  false),
  ('Barbell Row',           'barbell-row',            'accessory',    'pull',   'barbell', false),
  ('Weighted Pull-up',      'weighted-pull-up',       'accessory',    'pull',   'bodyweight', false),
  ('Dumbbell Row',          'dumbbell-row',           'accessory',    'pull',   'dumbbell', false),
  ('Tricep Pushdown',       'tricep-pushdown',        'accessory',    'press',  'cable',   false),
  ('Nordic Curl',           'nordic-curl',            'accessory',    'hinge',  'bodyweight', false);
