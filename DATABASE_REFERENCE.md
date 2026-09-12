# SLF Database Quick Reference

## Tables & Columns

### Identity & Profiles

#### `profiles`
```
id (UUID, PK) → auth.users.id
first_name (text)
last_name (text)
display_name (text)
avatar_path (text)
phone (text)
date_of_birth (date)
timezone (text, default: 'Asia/Kolkata')
units (enum: 'kg' | 'lbs', default: 'kg')
role (enum: 'athlete' | 'coach' | 'admin', default: 'athlete')
status (enum: 'active' | 'suspended' | 'deleted', default: 'active')
created_at (timestamptz)
updated_at (timestamptz)
```

#### `athlete_profiles`
```
id (UUID, PK)
profile_id (UUID, FK → profiles.id, UNIQUE)
training_age_years (numeric)
sport (text)
competition_level (text)
federation (text)
current_weight_class (text)
preferred_training_days (text[])
training_frequency (int)
gym_name (text)
height_cm (numeric)
notes (text)
created_at (timestamptz)
updated_at (timestamptz)
```

#### `coach_athletes`
```
id (UUID, PK)
coach_id (UUID, FK → profiles.id)
athlete_id (UUID, FK → profiles.id)
status (enum: 'active' | 'paused' | 'ended', default: 'active')
started_at (date)
ended_at (date)
created_at (timestamptz)
updated_at (timestamptz)
UNIQUE (coach_id, athlete_id)
```

### Exercise Library

#### `exercises`
```
id (UUID, PK)
name (text)
slug (text, UNIQUE)
category (enum: 'competition' | 'variation' | 'accessory' | 'mobility' | 'conditioning' | 'warmup')
movement_pattern (enum: 'squat' | 'hinge' | 'press' | 'pull' | 'carry' | 'other')
equipment (enum: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'kettlebell' | 'band' | 'other')
is_competition_lift (boolean, default: false)
description (text)
is_active (boolean, default: true)
created_by (UUID, FK → profiles.id)
created_at (timestamptz)
updated_at (timestamptz)
```

### Programming

#### `programs`
```
id (UUID, PK)
athlete_id (UUID, FK → profiles.id)
coach_id (UUID, FK → profiles.id)
name (text)
description (text)
status (enum: 'draft' | 'active' | 'completed' | 'archived', default: 'draft')
start_date (date)
end_date (date)
created_at (timestamptz)
updated_at (timestamptz)
```

#### `training_blocks`
```
id (UUID, PK)
program_id (UUID, FK → programs.id)
name (text)
description (text)
block_type (enum: 'accumulation' | 'strength' | 'intensification' | 'peak' | 'deload' | 'test')
sequence (int, default: 1)
start_date (date)
end_date (date)
status (enum: 'draft' | 'active' | 'completed' | 'archived', default: 'draft')
created_at (timestamptz)
updated_at (timestamptz)
```

#### `training_weeks`
```
id (UUID, PK)
block_id (UUID, FK → training_blocks.id)
week_number (int)
label (text)
start_date (date)
end_date (date)
status (enum: 'upcoming' | 'active' | 'completed' | 'skipped', default: 'upcoming')
created_at (timestamptz)
updated_at (timestamptz)
UNIQUE (block_id, week_number)
```

#### `training_days`
```
id (UUID, PK)
week_id (UUID, FK → training_weeks.id)
day_number (int)
scheduled_date (date)
day_name (text)                    -- e.g. "Monday"
title (text)                       -- e.g. "Lower Body"
focus (text)                       -- e.g. "Squat + Deadlift"
status (enum: 'upcoming' | 'active' | 'completed' | 'skipped' | 'rest', default: 'upcoming')
created_at (timestamptz)
updated_at (timestamptz)
```

### Workouts (Planned)

#### `workouts`
```
id (UUID, PK)
training_day_id (UUID, FK → training_days.id, UNIQUE)
name (text)
instructions (text)
estimated_duration_minutes (int)
created_at (timestamptz)
updated_at (timestamptz)
```

#### `workout_exercises`
```
id (UUID, PK)
workout_id (UUID, FK → workouts.id)
exercise_id (UUID, FK → exercises.id)
sequence (int, default: 1)
tempo (text)                       -- e.g. "3-1-1-0"
rest_seconds (int)
notes (text)
is_optional (boolean, default: false)
created_at (timestamptz)
updated_at (timestamptz)
```

#### `workout_sets`
```
id (UUID, PK)
workout_exercise_id (UUID, FK → workout_exercises.id)
set_number (int)
set_type (enum: 'warmup' | 'working' | 'backoff' | 'top_set' | 'amrap' | 'dropset', default: 'working')
prescribed_weight_kg (numeric)
prescribed_reps (int)
target_rpe (numeric)
percentage_1rm (numeric)
tempo (text)
notes (text)
created_at (timestamptz)
updated_at (timestamptz)
```

### Training Execution

#### `training_sessions`
```
id (UUID, PK)
athlete_id (UUID, FK → profiles.id)
workout_id (UUID, FK → workouts.id)
started_at (timestamptz)
completed_at (timestamptz)
status (enum: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'cancelled', default: 'not_started')
duration_seconds (int)
session_rpe (numeric)              -- 1-10 scale
athlete_feedback (text)
feeling (int, CHECK: 1-5)          -- 😫 😐 🙂 💪 🔥
created_at (timestamptz)
updated_at (timestamptz)
```

#### `performed_sets` ⭐ Most Important
```
id (UUID, PK)
session_id (UUID, FK → training_sessions.id)
workout_set_id (UUID, FK → workout_sets.id)
exercise_id (UUID, FK → exercises.id)
set_number (int)
weight_kg (numeric)                -- ACTUAL weight logged
reps (int)                         -- ACTUAL reps logged
rpe (numeric)                      -- ACTUAL RPE logged
e1rm_kg (numeric)                  -- AUTO-COMPUTED by trigger (Epley)
is_pr (boolean, default: false)
is_e1rm_best (boolean, default: false)
completed (boolean, default: true)
performed_at (timestamptz)
created_at (timestamptz)
```

### Analytics

#### `session_summaries`
```
id (UUID, PK)
session_id (UUID, FK → training_sessions.id, UNIQUE)
athlete_id (UUID, FK → profiles.id)
total_sets (int)
completed_sets (int)
total_reps (int)
total_volume_kg (numeric)          -- Σ(weight × reps)
avg_rpe (numeric)
duration_seconds (int)
squat_e1rm_kg (numeric)            -- max squat e1RM
bench_e1rm_kg (numeric)            -- max bench e1RM
deadlift_e1rm_kg (numeric)         -- max deadlift e1RM
total_e1rm_kg (numeric)            -- sum of above
prev_total_e1rm_kg (numeric)       -- previous session total
e1rm_change_kg (numeric)           -- current - previous
prev_volume_kg (numeric)           -- previous session volume
volume_change_kg (numeric)         -- current - previous
created_at (timestamptz)
```

#### `bodyweight_logs`
```
id (UUID, PK)
athlete_id (UUID, FK → profiles.id)
recorded_at (timestamptz)
weight_kg (numeric)
source (text)                      -- 'manual' | 'scale' | 'imported' | 'coach'
notes (text)
created_at (timestamptz)
```

## Key Queries

### Get athlete's current program

```sql
SELECT p.* FROM programs p
WHERE p.athlete_id = $1
  AND p.status = 'active'
ORDER BY p.start_date DESC
LIMIT 1;
```

### Get this week's workouts

```sql
SELECT 
  d.id, d.day_name, d.title, d.focus,
  w.id as workout_id,
  json_agg(json_build_object(
    'exercise_id', e.id,
    'exercise_name', e.name,
    'sets', (SELECT json_agg(json_build_object(
      'set_number', ws.set_number,
      'prescribed_weight_kg', ws.prescribed_weight_kg,
      'prescribed_reps', ws.prescribed_reps,
      'target_rpe', ws.target_rpe
    )) FROM workout_sets ws WHERE ws.workout_exercise_id = we.id)
  )) as exercises
FROM training_days d
JOIN training_weeks tw ON tw.id = d.week_id
JOIN workouts w ON w.training_day_id = d.id
JOIN workout_exercises we ON we.workout_id = w.id
JOIN exercises e ON e.id = we.exercise_id
WHERE tw.block_id = $1
  AND tw.week_number = $2
GROUP BY d.id, w.id;
```

### Get session summary with comparison

```sql
SELECT 
  ss.total_volume_kg,
  ss.avg_rpe,
  ss.squat_e1rm_kg,
  ss.bench_e1rm_kg,
  ss.deadlift_e1rm_kg,
  ss.total_e1rm_kg,
  ss.e1rm_change_kg,
  ss.volume_change_kg,
  ss.created_at
FROM session_summaries ss
WHERE ss.athlete_id = $1
ORDER BY ss.created_at DESC
LIMIT 10;
```

### Get athlete's e1RM progression

```sql
SELECT 
  e.name,
  ps.performed_at,
  ps.e1rm_kg,
  ps.weight_kg,
  ps.reps
FROM performed_sets ps
JOIN exercises e ON e.id = ps.exercise_id
JOIN training_sessions ts ON ts.id = ps.session_id
WHERE ts.athlete_id = $1
  AND e.slug IN ('back-squat', 'bench-press', 'deadlift')
ORDER BY e.name, ps.performed_at DESC;
```

### Get coach's athletes needing attention

```sql
SELECT 
  p.id, p.first_name, p.last_name,
  MAX(ts.completed_at) as last_session,
  COUNT(ts.id) as sessions_this_week
FROM profiles p
JOIN coach_athletes ca ON ca.athlete_id = p.id
LEFT JOIN training_sessions ts ON ts.athlete_id = p.id
  AND ts.completed_at >= NOW() - INTERVAL '7 days'
WHERE ca.coach_id = $1
  AND ca.status = 'active'
GROUP BY p.id
ORDER BY last_session ASC NULLS FIRST;
```

## Indexes

```sql
idx_coach_athletes_coach
idx_coach_athletes_athlete
idx_programs_athlete
idx_blocks_program
idx_weeks_block
idx_days_week
idx_workout_exercises_workout
idx_workout_sets_exercise
idx_sessions_athlete
idx_sessions_athlete_date
idx_performed_sets_session
idx_performed_sets_exercise
idx_performed_sets_athlete
idx_summaries_athlete
idx_bodyweight_athlete
```

## Enums

```
user_role:        'athlete' | 'coach' | 'admin'
user_status:      'active' | 'suspended' | 'deleted'
units_pref:       'kg' | 'lbs'
coach_rel_status: 'active' | 'paused' | 'ended'
exercise_category: 'competition' | 'variation' | 'accessory' | 'mobility' | 'conditioning' | 'warmup'
movement_pattern: 'squat' | 'hinge' | 'press' | 'pull' | 'carry' | 'other'
equipment_type:   'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'kettlebell' | 'band' | 'other'
program_status:   'draft' | 'active' | 'completed' | 'archived'
block_type:       'accumulation' | 'strength' | 'intensification' | 'peak' | 'deload' | 'test'
week_status:      'upcoming' | 'active' | 'completed' | 'skipped'
day_status:       'upcoming' | 'active' | 'completed' | 'skipped' | 'rest'
set_type:         'warmup' | 'working' | 'backoff' | 'top_set' | 'amrap' | 'dropset'
session_status:   'not_started' | 'in_progress' | 'paused' | 'completed' | 'cancelled'
```

## Triggers

### `trg_compute_e1rm`
Automatically calculates e1RM on `performed_sets` insert/update using Epley formula:
```
e1rm = weight × (1 + reps/30)
```

### `trg_*_updated_at`
Automatically updates `updated_at` timestamp on any table update.

### `trg_on_auth_user_created`
Automatically creates a `profiles` row when a new user signs up via Supabase Auth.

## RLS Policies

All tables have row-level security enabled:

- **Athlete**: Can read/write only their own rows
- **Coach**: Can read/write only assigned athletes' rows
- **Admin**: Broader access (not yet implemented)

Example:
```sql
-- Athlete can only see their own sessions
SELECT * FROM training_sessions
WHERE athlete_id = auth.uid()

-- Coach can see assigned athletes' sessions
SELECT * FROM training_sessions
WHERE athlete_id IN (
  SELECT athlete_id FROM coach_athletes
  WHERE coach_id = auth.uid() AND status = 'active'
)
```

## Seed Data

20 exercises pre-loaded:

- Back Squat, Front Squat, Paused Squat, High Bar Squat
- Bench Press, Close Grip Bench, Paused Bench, Overhead Press
- Deadlift, Romanian Deadlift, Paused Deadlift, Sumo Deadlift
- Bulgarian Split Squat, Leg Press, Hamstring Curl
- Barbell Row, Weighted Pull-up, Dumbbell Row
- Tricep Pushdown, Nordic Curl

## Common Operations

### Create a program

```typescript
const { data } = await supabase
  .from('programs')
  .insert({
    athlete_id: athleteId,
    coach_id: coachId,
    name: 'Powerlifting Nationals Prep',
    status: 'active',
    start_date: '2024-09-01',
    end_date: '2024-11-30',
  })
  .select()
  .single();
```

### Log a set

```typescript
const { data } = await supabase
  .from('performed_sets')
  .insert({
    session_id: sessionId,
    exercise_id: exerciseId,
    set_number: 1,
    weight_kg: 140,
    reps: 5,
    rpe: 7,
  })
  .select('id, e1rm_kg')
  .single();
// e1rm_kg is auto-computed by trigger
```

### Get session summary

```typescript
const { data } = await supabase
  .from('session_summaries')
  .select('*')
  .eq('session_id', sessionId)
  .single();
```

## Performance Considerations

- Indexes on frequently queried columns (athlete_id, exercise_id, performed_at)
- e1RM computed once at insert (not on every query)
- Session summaries cached (not recalculated)
- RLS policies optimized with indexed foreign keys
