-- ─────────────────────────────────────────────────────────────────────────────
-- SLF — Onboarding / Athlete Intake Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Enums ─────────────────────────────────────────────────────────────────────

create type competition_level as enum (
  'none', 'trained_not_competed', 'local', 'state', 'national', 'international'
);

create type lift_key as enum ('squat', 'bench', 'deadlift');

create type plan_tier as enum ('member', 'pro', 'elite');

create type session_duration as enum (
  'under_45', '45_60', '60_90', '90_120', '120_plus'
);

create type training_consistency as enum (
  'very_consistent', 'mostly_consistent', 'sometimes_inconsistent', 'frequently_interrupted'
);

create type gym_type as enum (
  'commercial', 'powerlifting_gym', 'home_gym', 'sports_facility', 'other'
);

-- ── athlete_powerlifting_profiles ─────────────────────────────────────────────

create table athlete_powerlifting_profiles (
  id                    uuid primary key default uuid_generate_v4(),
  profile_id            uuid not null unique references public.profiles(id) on delete cascade,
  competition_level     competition_level not null default 'none',
  federation            text,
  weight_class          text,
  -- training environment
  gym_type              gym_type,
  gym_name              text,
  equipment_available   text[],           -- e.g. ['power_rack','calibrated_plates','belt_squat']
  -- schedule
  days_per_week         int,
  preferred_days        text[],
  session_duration      session_duration,
  consistency           training_consistency,
  -- next meet
  next_meet_name        text,
  next_meet_date        date,
  next_meet_importance  int check (next_meet_importance between 1 and 5),
  -- coaching
  selected_plan         plan_tier not null default 'member',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_plprofiles_profile on athlete_powerlifting_profiles(profile_id);

-- ── athlete_lift_profiles ─────────────────────────────────────────────────────
-- One row per lift (squat / bench / deadlift)

create table athlete_lift_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  profile_id          uuid not null references public.profiles(id) on delete cascade,
  lift                lift_key not null,
  -- strength
  current_1rm_kg      numeric(6,2),
  estimated_1rm_kg    numeric(6,2),       -- computed from reps/weight/rpe if 1rm unknown
  rm_reps             int,                -- e.g. 5 (for 5RM)
  rm_weight_kg        numeric(6,2),
  rm_rpe              numeric(3,1),
  strength_confidence text,               -- 'very_confident','fairly_confident','not_sure','unknown'
  -- technique
  style               text,               -- squat: low_bar/high_bar | dl: conventional/sumo | bench: -
  stance              text,               -- squat: close/shoulder/wide/very_wide
  grip                text,               -- bench: close/medium/wide
  bar_position        text,               -- squat: low_bar/high_bar
  footwear            text,               -- squat: flat/weightlifting/raised/barefoot
  arch                text,               -- bench: flat/small/medium/large
  touch_style         text,               -- bench: soft/controlled/aggressive
  build_description   text,               -- deadlift: short_torso_long_arms / balanced / long_torso_short_arms
  confidence_rating   int check (confidence_rating between 1 and 5),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (profile_id, lift)
);

create index idx_liftprofiles_profile on athlete_lift_profiles(profile_id);

-- ── athlete_lift_issues ───────────────────────────────────────────────────────

create table athlete_lift_issues (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  lift        lift_key not null,
  issue       text not null,
  created_at  timestamptz not null default now()
);

create index idx_liftissues_profile on athlete_lift_issues(profile_id);

-- ── athlete_injury_flags ──────────────────────────────────────────────────────

create table athlete_injury_flags (
  id                    uuid primary key default uuid_generate_v4(),
  profile_id            uuid not null unique references public.profiles(id) on delete cascade,
  affected_areas        text[],           -- ['shoulder','knee','back',...]
  recent_injury         text,             -- 'yes','no','prefer_not_to_say'
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ── athlete_goals ─────────────────────────────────────────────────────────────

create table athlete_goals (
  id                  uuid primary key default uuid_generate_v4(),
  profile_id          uuid not null unique references public.profiles(id) on delete cascade,
  primary_goal        text,
  priority_ranking    text[],             -- ordered list: ['strength','technique',...]
  success_definition  text,               -- free text: "what would make next 12 weeks a success"
  target_total_kg     numeric(7,2),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── athlete_preferences ───────────────────────────────────────────────────────

create table athlete_preferences (
  id                    uuid primary key default uuid_generate_v4(),
  profile_id            uuid not null unique references public.profiles(id) on delete cascade,
  motivations           text[],           -- ['competition','prs','data',...]
  coach_expectations    text[],           -- ['push_me','accountability',...]
  feedback_style        text[],           -- ['short_direct','detailed',...]
  checkin_time          text,             -- 'morning','afternoon','evening','no_preference'
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ── athlete_onboarding ────────────────────────────────────────────────────────
-- Versioned record — tracks completion state per step

create table athlete_onboarding (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid not null unique references public.profiles(id) on delete cascade,
  version         int not null default 1,
  current_step    int not null default 0,
  completed       boolean not null default false,
  completed_at    timestamptz,
  -- per-step completion flags
  step_personal   boolean not null default false,
  step_training   boolean not null default false,
  step_strength   boolean not null default false,
  step_squat      boolean not null default false,
  step_bench      boolean not null default false,
  step_deadlift   boolean not null default false,
  step_injuries   boolean not null default false,
  step_goals      boolean not null default false,
  step_plan       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── updated_at triggers ───────────────────────────────────────────────────────

create trigger trg_plprofiles_updated_at
  before update on athlete_powerlifting_profiles
  for each row execute function public.set_updated_at();

create trigger trg_liftprofiles_updated_at
  before update on athlete_lift_profiles
  for each row execute function public.set_updated_at();

create trigger trg_injuryflags_updated_at
  before update on athlete_injury_flags
  for each row execute function public.set_updated_at();

create trigger trg_goals_updated_at
  before update on athlete_goals
  for each row execute function public.set_updated_at();

create trigger trg_preferences_updated_at
  before update on athlete_preferences
  for each row execute function public.set_updated_at();

create trigger trg_onboarding_updated_at
  before update on athlete_onboarding
  for each row execute function public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table athlete_powerlifting_profiles enable row level security;
alter table athlete_lift_profiles         enable row level security;
alter table athlete_lift_issues           enable row level security;
alter table athlete_injury_flags          enable row level security;
alter table athlete_goals                 enable row level security;
alter table athlete_preferences           enable row level security;
alter table athlete_onboarding            enable row level security;

-- athlete owns all onboarding data; coach can read

create policy "pl_profiles: own"
  on athlete_powerlifting_profiles for all using (profile_id = auth.uid());
create policy "pl_profiles: coach reads"
  on athlete_powerlifting_profiles for select using (
    exists (select 1 from public.coach_athletes where coach_id = auth.uid() and athlete_id = profile_id and status = 'active')
  );

create policy "lift_profiles: own"
  on athlete_lift_profiles for all using (profile_id = auth.uid());
create policy "lift_profiles: coach reads"
  on athlete_lift_profiles for select using (
    exists (select 1 from public.coach_athletes where coach_id = auth.uid() and athlete_id = profile_id and status = 'active')
  );

create policy "lift_issues: own"
  on athlete_lift_issues for all using (profile_id = auth.uid());
create policy "lift_issues: coach reads"
  on athlete_lift_issues for select using (
    exists (select 1 from public.coach_athletes where coach_id = auth.uid() and athlete_id = profile_id and status = 'active')
  );

create policy "injury_flags: own"
  on athlete_injury_flags for all using (profile_id = auth.uid());
create policy "injury_flags: coach reads"
  on athlete_injury_flags for select using (
    exists (select 1 from public.coach_athletes where coach_id = auth.uid() and athlete_id = profile_id and status = 'active')
  );

create policy "goals: own"
  on athlete_goals for all using (profile_id = auth.uid());
create policy "goals: coach reads"
  on athlete_goals for select using (
    exists (select 1 from public.coach_athletes where coach_id = auth.uid() and athlete_id = profile_id and status = 'active')
  );

create policy "preferences: own"
  on athlete_preferences for all using (profile_id = auth.uid());
create policy "preferences: coach reads"
  on athlete_preferences for select using (
    exists (select 1 from public.coach_athletes where coach_id = auth.uid() and athlete_id = profile_id and status = 'active')
  );

create policy "onboarding: own"
  on athlete_onboarding for all using (profile_id = auth.uid());
create policy "onboarding: coach reads"
  on athlete_onboarding for select using (
    exists (select 1 from public.coach_athletes where coach_id = auth.uid() and athlete_id = profile_id and status = 'active')
  );
