# SLF Backend Architecture — Phase 1

## Overview

The SLF backend is built on **Supabase** (PostgreSQL + Auth + Storage) with a clean separation between:

- **Database layer** — PostgreSQL schema with RLS
- **Auth layer** — Supabase Auth (email/password)
- **Business logic layer** — TypeScript services
- **API layer** — Next.js Server Actions / Route Handlers

## Core Data Model

### The Training Chain

```
ATHLETE
  ↓
PROGRAM (e.g., "12-Week Powerlifting Block")
  ↓
TRAINING BLOCK (e.g., "Accumulation")
  ↓
TRAINING WEEK (e.g., "Week 06")
  ↓
TRAINING DAY (e.g., "Monday — Lower Body")
  ↓
WORKOUT (planned session)
  ├── WORKOUT EXERCISES (e.g., Back Squat)
  │    └── WORKOUT SETS (prescribed: 4 × 5 @ RPE 7)
  │
  └── TRAINING SESSION (actual session)
       └── PERFORMED SETS (logged: 140 × 5 @ RPE 7)
            ├── e1RM (auto-calculated: 163.3 kg)
            ├── Volume (700 kg)
            └── Feedback (RPE, feeling)
```

### Key Tables

| Table | Purpose | Ownership |
|-------|---------|-----------|
| `profiles` | User identity (extends Supabase Auth) | Athlete / Coach |
| `athlete_profiles` | Sport-specific data | Athlete |
| `coach_athletes` | Coaching relationships | Coach ↔ Athlete |
| `exercises` | Exercise library (20 seeded) | System |
| `programs` | Training programs | Coach creates, Athlete follows |
| `training_blocks` | Program phases | Coach |
| `training_weeks` | Weekly structure | Coach |
| `training_days` | Daily sessions | Coach |
| `workouts` | Planned workouts | Coach |
| `workout_exercises` | Exercises in a workout | Coach |
| `workout_sets` | Prescribed sets | Coach |
| `training_sessions` | Actual athlete sessions | Athlete |
| `performed_sets` | Logged sets (weight, reps, RPE) | Athlete |
| `session_summaries` | Cached analytics | System |
| `bodyweight_logs` | Weight tracking | Athlete |

## Authentication & Authorization

### Supabase Auth

- Email/password signup
- Email verification
- Session management via cookies
- Automatic profile creation on signup

### Row-Level Security (RLS)

Every table has policies:

```sql
-- Athlete can only see their own data
SELECT * FROM training_sessions
WHERE athlete_id = auth.uid()

-- Coach can see assigned athletes' data
SELECT * FROM training_sessions
WHERE athlete_id IN (
  SELECT athlete_id FROM coach_athletes
  WHERE coach_id = auth.uid()
)
```

This is enforced at the **database level**, not just in React.

## Business Logic Layer

### Services

Located in `src/lib/services/`:

#### `training.service.ts`

Handles the complete training workflow:

```typescript
// Start a session
startSession(workoutId) → { sessionId }

// Log a set (weight, reps, RPE)
logSet({ sessionId, exerciseId, weight, reps, rpe }) → { setId, e1rm }

// Finish session (calculates summary)
finishSession({ sessionId, feeling, feedback }) → { summary }
```

The `finishSession` function:

1. Fetches all performed sets
2. Calculates:
   - Total volume (weight × reps)
   - Average RPE
   - e1RM per lift (Squat, Bench, Deadlift)
   - Comparison vs previous session
3. Creates `session_summary` record
4. Updates `training_session` status to "completed"

### Validation

All inputs validated with **Zod**:

```typescript
const LogSetSchema = z.object({
  sessionId:    z.string().uuid(),
  exerciseId:   z.string().uuid(),
  weightKg:     z.number().min(0),
  reps:         z.number().int().min(1),
  rpe:          z.number().min(1).max(10).nullable(),
});
```

## API Structure

### Server Actions (Next.js)

Located in `src/lib/auth/actions.ts` and `src/lib/services/`:

```typescript
// Auth
loginAction(email, password)
signupAction(firstName, lastName, email, password)
logoutAction()
completeOnboardingAction(profile)

// Training
startSession(workoutId)
logSet(input)
finishSession(input)
```

Called directly from Client Components:

```typescript
'use client';
import { logSet } from '@/lib/services/training.service';

export function SetRow() {
  async function handleComplete(weight, reps, rpe) {
    const result = await logSet({ sessionId, exerciseId, weight, reps, rpe });
    if (result.error) toast(result.error);
    else toast(`Set logged — e1RM: ${result.e1rm} kg`);
  }
}
```

## Database Triggers

### e1RM Calculation

Automatically computed on `performed_sets` insert:

```sql
CREATE TRIGGER trg_compute_e1rm
  BEFORE INSERT ON performed_sets
  FOR EACH ROW
  EXECUTE FUNCTION compute_e1rm();

-- Epley formula: weight × (1 + reps/30)
```

### Updated At

All tables have `updated_at` auto-updated:

```sql
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

## Session Summary Calculation

When an athlete finishes a session:

```
performed_sets
  ├── weight_kg, reps, rpe
  ├── e1rm_kg (computed by trigger)
  └── exercise_id → exercise.slug
       ├── "back-squat" → squat_e1rm
       ├── "bench-press" → bench_e1rm
       └── "deadlift" → deadlift_e1rm

↓

session_summary
  ├── total_volume_kg = Σ(weight × reps)
  ├── avg_rpe = Σ(rpe) / count
  ├── squat_e1rm_kg = max(squat e1RMs)
  ├── bench_e1rm_kg = max(bench e1RMs)
  ├── deadlift_e1rm_kg = max(deadlift e1RMs)
  ├── total_e1rm_kg = sum of above
  ├── e1rm_change_kg = current - previous
  └── volume_change_kg = current - previous
```

## Frontend Integration

### Session Summary Modal

The `SessionSummaryModal` component now receives real data:

```typescript
interface SessionStats {
  sets: number;
  volume: number;
  avgRpe: number;
  duration: number;
  exercises: number;
  blockName: string;
  weekNumber: number;
  lifts: LiftE1RM[];  // ← from DB
  prevSets: number;
  prevVolume: number;
  prevAvgRpe: number;
}
```

### Data Flow

```
Train UI
  ↓
logSet() Server Action
  ↓
Supabase performed_sets insert
  ↓
e1RM trigger calculates
  ↓
Frontend updates UI
  ↓
finishSession() Server Action
  ↓
Supabase session_summary upsert
  ↓
SessionSummaryModal displays real data
```

## Environment Setup

### `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Supabase Clients

**Browser (Client Components):**
```typescript
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

**Server (Server Components / Actions):**
```typescript
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

## Security

### RLS Policies

- Athlete can only read/write their own data
- Coach can only read/write assigned athletes' data
- Admin has broader access
- Enforced at database level

### Validation

- All inputs validated with Zod before DB operations
- Type-safe queries with generated TypeScript types
- No raw SQL from user input

### Authentication

- Supabase Auth handles password hashing
- Session stored in secure HTTP-only cookies
- Middleware refreshes session on every request

## What's Next

### Phase 2: Performance Analytics

Add tables for:
- `bodyweight_logs` — weight tracking
- `recovery_logs` — sleep, fatigue, soreness
- `competitions` — meet data
- `competition_attempts` — lift attempts

### Phase 3: Coaching Features

Add tables for:
- `training_media` — video uploads
- `coach_feedback` — video feedback
- `weekly_reviews` — coach notes
- `conversations` — messaging

### Phase 4: Business

Add tables for:
- `membership_plans` — subscription tiers
- `subscriptions` — athlete subscriptions
- `payments` — transaction history
- `offers` — discounts

### Phase 5: Advanced Analytics

- MRV estimation
- Performance projections
- Wearable integrations
- Advanced recovery modeling

## Files Created

```
supabase/
  migrations/
    001_core_schema.sql          ← Full database schema

src/lib/
  supabase/
    client.ts                    ← Browser Supabase client
    server.ts                    ← Server Supabase client
    types.ts                     ← Generated TypeScript types
  
  auth/
    actions.ts                   ← Auth Server Actions (updated)
    session.ts                   ← Session helper (updated)
  
  services/
    training.service.ts          ← Training business logic

src/
  middleware.ts                  ← Auth middleware (new)

.env.local.example               ← Environment template
BACKEND_SETUP.md                 ← Setup guide
```

## Key Metrics

- **Tables**: 14 core tables
- **Enums**: 13 types
- **RLS Policies**: 20+ policies
- **Triggers**: 2 (e1RM, updated_at)
- **Seed Data**: 20 exercises
- **Lines of SQL**: ~600
- **Lines of TypeScript**: ~400

## Testing the Backend

1. Create a Supabase project
2. Run the migration SQL
3. Set `.env.local` with credentials
4. `npm run dev`
5. Sign up → verify email → onboarding
6. Start a training session
7. Log sets
8. Finish session → see real summary data

The entire flow is now backed by a real database with proper auth, validation, and business logic.
