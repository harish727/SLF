# SLF Backend Infrastructure — Visual Summary

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STRENGTH LAB BY FLUFFY                             │
│                         (SLF) Backend Infrastructure                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React)                                 │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Auth       │  │   Train      │  │  Dashboard   │  │  Progress    │   │
│  │   Pages      │  │   Page       │  │   Page       │  │  Page        │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ↓                         ↓
        ┌──────────────────────┐  ┌──────────────────────┐
        │  Server Actions      │  │  Route Handlers      │
        │  (Next.js)           │  │  (Next.js)           │
        └──────────────────────┘  └──────────────────────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ↓                         ↓
        ┌──────────────────────┐  ┌──────────────────────┐
        │  Validation (Zod)    │  │  Authorization       │
        │                      │  │  (RLS Policies)      │
        └──────────────────────┘  └──────────────────────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ↓                         ↓
        ┌──────────────────────┐  ┌──────────────────────┐
        │  Business Logic      │  │  Supabase Client     │
        │  (TypeScript         │  │  (Type-safe)         │
        │   Services)          │  │                      │
        └──────────────────────┘  └──────────────────────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ↓                         ↓
        ┌──────────────────────┐  ┌──────────────────────┐
        │  Supabase Auth       │  │  PostgreSQL          │
        │  (Email/Password)    │  │  (Database)          │
        └──────────────────────┘  └──────────────────────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ↓                         ↓
        ┌──────────────────────┐  ┌──────────────────────┐
        │  Session Cookies     │  │  Triggers            │
        │  (Secure)            │  │  (e1RM Calculation)  │
        └──────────────────────┘  └──────────────────────┘
```

## Data Flow: Complete Training Session

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ATHLETE COMPLETES A TRAINING SESSION                     │
└─────────────────────────────────────────────────────────────────────────────┘

1. ATHLETE STARTS SESSION
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Frontend: Click "Start Session"                                      │
   │ ↓                                                                    │
   │ Server Action: startSession(workoutId)                              │
   │ ↓                                                                    │
   │ Supabase: INSERT INTO training_sessions                             │
   │ ↓                                                                    │
   │ Response: { sessionId: "uuid" }                                     │
   └──────────────────────────────────────────────────────────────────────┘

2. ATHLETE LOGS A SET
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Frontend: Enter weight, reps, RPE                                    │
   │ ↓                                                                    │
   │ Validation: Zod schema check                                        │
   │ ↓                                                                    │
   │ Server Action: logSet({                                             │
   │   sessionId, exerciseId, weight, reps, rpe                          │
   │ })                                                                   │
   │ ↓                                                                    │
   │ Authorization: Check athlete owns session (RLS)                     │
   │ ↓                                                                    │
   │ Supabase: INSERT INTO performed_sets                                │
   │ ↓                                                                    │
   │ Database Trigger: compute_e1rm()                                    │
   │   e1rm = weight × (1 + reps/30)                                     │
   │ ↓                                                                    │
   │ Response: { setId: "uuid", e1rm: 163.3 }                            │
   │ ↓                                                                    │
   │ Frontend: Show "Set logged — e1RM: 163.3 kg"                        │
   └──────────────────────────────────────────────────────────────────────┘

3. ATHLETE FINISHES SESSION
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Frontend: Click "Finish Session"                                     │
   │ ↓                                                                    │
   │ Server Action: finishSession({                                      │
   │   sessionId, feeling, feedback                                      │
   │ })                                                                   │
   │ ↓                                                                    │
   │ Authorization: Check athlete owns session (RLS)                     │
   │ ↓                                                                    │
   │ Fetch: SELECT * FROM performed_sets WHERE session_id = ?            │
   │ ↓                                                                    │
   │ Calculate:                                                          │
   │   • total_volume = Σ(weight × reps)                                 │
   │   • avg_rpe = Σ(rpe) / count                                        │
   │   • squat_e1rm = max(squat e1RMs)                                    │
   │   • bench_e1rm = max(bench e1RMs)                                    │
   │   • deadlift_e1rm = max(deadlift e1RMs)                             │
   │   • e1rm_change = current - previous                                │
   │   • volume_change = current - previous                              │
   │ ↓                                                                    │
   │ Supabase: UPDATE training_sessions SET status = 'completed'         │
   │ Supabase: INSERT INTO session_summaries                             │
   │ ↓                                                                    │
   │ Response: { summary: { ... } }                                      │
   │ ↓                                                                    │
   │ Frontend: Show SessionSummaryModal with real data                   │
   └──────────────────────────────────────────────────────────────────────┘

4. ATHLETE CREATES SESSION CARD
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Frontend: Click "Create Session Card"                               │
   │ ↓                                                                    │
   │ Choose template: Minimal / Performance / Photo                      │
   │ ↓                                                                    │
   │ Optional: Upload gym photo                                          │
   │ ↓                                                                    │
   │ Generate card image with stats overlay                              │
   │ ↓                                                                    │
   │ Save or share                                                       │
   └──────────────────────────────────────────────────────────────────────┘
```

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          IDENTITY & PROFILES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐ │
│  │    profiles      │      │ athlete_profiles │      │ coach_athletes   │ │
│  ├──────────────────┤      ├──────────────────┤      ├──────────────────┤ │
│  │ id (PK)          │◄─────│ profile_id (FK)  │      │ coach_id (FK)    │ │
│  │ first_name       │      │ training_age     │      │ athlete_id (FK)  │ │
│  │ last_name        │      │ sport            │      │ status           │ │
│  │ role             │      │ height_cm        │      │ started_at       │ │
│  │ email            │      │ weight_kg        │      │ ended_at         │ │
│  │ created_at       │      │ created_at       │      │ created_at       │ │
│  └──────────────────┘      └──────────────────┘      └──────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROGRAMMING & STRUCTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│  │  programs    │───►│   blocks     │───►│    weeks     │                 │
│  ├──────────────┤    ├──────────────┤    ├──────────────┤                 │
│  │ id (PK)      │    │ id (PK)      │    │ id (PK)      │                 │
│  │ athlete_id   │    │ program_id   │    │ block_id     │                 │
│  │ coach_id     │    │ name         │    │ week_number  │                 │
│  │ name         │    │ block_type   │    │ status       │                 │
│  │ status       │    │ status       │    │ created_at   │                 │
│  │ created_at   │    │ created_at   │    │              │                 │
│  └──────────────┘    └──────────────┘    └──────────────┘                 │
│                                                    │                       │
│                                                    ↓                       │
│                                          ┌──────────────┐                 │
│                                          │     days     │                 │
│                                          ├──────────────┤                 │
│                                          │ id (PK)      │                 │
│                                          │ week_id      │                 │
│                                          │ day_name     │                 │
│                                          │ title        │                 │
│                                          │ focus        │                 │
│                                          │ status       │                 │
│                                          └──────────────┘                 │
│                                                    │                       │
│                                                    ↓                       │
│                                          ┌──────────────┐                 │
│                                          │   workouts   │                 │
│                                          ├──────────────┤                 │
│                                          │ id (PK)      │                 │
│                                          │ training_day │                 │
│                                          │ name         │                 │
│                                          │ created_at   │                 │
│                                          └──────────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      EXERCISES & PRESCRIPTIONS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    │
│  │   exercises      │    │workout_exercises │    │  workout_sets    │    │
│  ├──────────────────┤    ├──────────────────┤    ├──────────────────┤    │
│  │ id (PK)          │◄───│ exercise_id (FK) │    │ id (PK)          │    │
│  │ name             │    │ workout_id (FK)  │───►│ workout_ex_id    │    │
│  │ slug             │    │ sequence         │    │ set_number       │    │
│  │ category         │    │ tempo            │    │ prescribed_weight│    │
│  │ equipment        │    │ rest_seconds     │    │ prescribed_reps  │    │
│  │ is_competition   │    │ created_at       │    │ target_rpe       │    │
│  │ created_at       │    │                  │    │ created_at       │    │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      TRAINING EXECUTION & ANALYTICS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    │
│  │training_sessions │    │ performed_sets   │    │session_summaries │    │
│  ├──────────────────┤    ├──────────────────┤    ├──────────────────┤    │
│  │ id (PK)          │◄───│ session_id (FK)  │    │ id (PK)          │    │
│  │ athlete_id       │    │ exercise_id (FK) │    │ session_id (FK)  │    │
│  │ workout_id       │    │ weight_kg        │    │ athlete_id       │    │
│  │ started_at       │    │ reps             │    │ total_volume_kg  │    │
│  │ completed_at     │    │ rpe              │    │ avg_rpe          │    │
│  │ status           │    │ e1rm_kg ◄────────┼────│ squat_e1rm_kg    │    │
│  │ duration_seconds │    │ (auto-computed)  │    │ bench_e1rm_kg    │    │
│  │ feeling          │    │ completed        │    │ deadlift_e1rm_kg │    │
│  │ created_at       │    │ performed_at     │    │ e1rm_change_kg   │    │
│  └──────────────────┘    │ created_at       │    │ volume_change_kg │    │
│                          └──────────────────┘    │ created_at       │    │
│                                                  └──────────────────┘    │
│                                                                             │
│  ┌──────────────────┐                                                      │
│  │ bodyweight_logs  │                                                      │
│  ├──────────────────┤                                                      │
│  │ id (PK)          │                                                      │
│  │ athlete_id (FK)  │                                                      │
│  │ weight_kg        │                                                      │
│  │ recorded_at      │                                                      │
│  │ source           │                                                      │
│  │ created_at       │                                                      │
│  └──────────────────┘                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND COMPONENTS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        TrainShell                                    │  │
│  │  (Main training page container)                                     │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │ SessionSelectors (Block, Week, Day)                           │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │ ExerciseCard (repeated for each exercise)                     │ │  │
│  │  │                                                                │ │  │
│  │  │  ┌──────────────────────────────────────────────────────────┐ │ │  │
│  │  │  │ SetRow (repeated for each set)                          │ │ │  │
│  │  │  │                                                          │ │ │  │
│  │  │  │ Weight Stepper ─► logSet() ─► e1RM calculated          │ │ │  │
│  │  │  │ Reps Stepper   ─► logSet() ─► e1RM calculated          │ │ │  │
│  │  │  │ RPE Selector   ─► logSet() ─► e1RM calculated          │ │ │  │
│  │  │  │                                                          │ │ │  │
│  │  │  │ [Done — Set 1] ─► Server Action ─► Supabase            │ │ │  │
│  │  │  └──────────────────────────────────────────────────────────┘ │ │  │
│  │  │                                                                │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │ Progress Bar (% complete)                                     │ │  │
│  │  │ [✓ Finish Session] ─► finishSession() ─► SessionSummaryModal │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    SessionSummaryModal                              │  │
│  │  (Shows real data from session_summaries table)                     │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │ Session Stats (volume, tonnage, RPE, duration)                │ │  │
│  │  │ Lift e1RMs (Squat, Bench, Deadlift)                           │ │  │
│  │  │ Today's Highlights (new PRs)                                  │ │  │
│  │  │ vs Last Session (comparison)                                  │ │  │
│  │  │ Session Feeling (😫 😐 🙂 💪 🔥)                              │ │  │
│  │  │ [📸 Create Session Card] ─► ShareCardScreen                  │ │  │
│  │  │ [Done] ─► Close modal                                         │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │                  ShareCardScreen                              │ │  │
│  │  │  (Choose template & generate shareable card)                  │ │  │
│  │  │                                                                │ │  │
│  │  │  [Minimal] [Performance] [Photo]                              │ │  │
│  │  │                                                                │ │  │
│  │  │  Card Preview (updates based on template)                     │ │  │
│  │  │                                                                │ │  │
│  │  │  [Save Image] [Share]                                         │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY LAYERS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Layer 1: AUTHENTICATION                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Supabase Auth (email/password)                                      │   │
│  │ ↓                                                                   │   │
│  │ Secure HTTP-only cookies                                           │   │
│  │ ↓                                                                   │   │
│  │ Middleware refreshes session on every request                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Layer 2: AUTHORIZATION                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Middleware checks auth before allowing access to /app routes       │   │
│  │ ↓                                                                   │   │
│  │ Server Actions verify user ownership                               │   │
│  │ ↓                                                                   │   │
│  │ RLS Policies enforce at database level                             │   │
│  │                                                                     │   │
│  │ Example:                                                            │   │
│  │ SELECT * FROM training_sessions                                    │   │
│  │ WHERE athlete_id = auth.uid()  ← Enforced by RLS                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Layer 3: VALIDATION                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Zod schemas validate all inputs before DB operations               │   │
│  │ ↓                                                                   │   │
│  │ Type-safe queries prevent runtime errors                           │   │
│  │ ↓                                                                   │   │
│  │ No raw SQL (injection-proof)                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Layer 4: DATA ISOLATION                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Athlete A cannot see Athlete B's data (RLS)                        │   │
│  │ Coach can only see assigned athletes (RLS)                         │   │
│  │ Admin has broader access (future)                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Next.js Dev Server (localhost:3000)                                       │
│  ↓                                                                         │
│  Supabase Local (Docker)                                                   │
│  ├── PostgreSQL                                                            │
│  ├── Auth                                                                  │
│  └── Storage                                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Vercel (Next.js)                                                          │
│  ├── Frontend                                                              │
│  ├── Server Actions                                                        │
│  └── Route Handlers                                                        │
│       ↓                                                                    │
│  Supabase Cloud                                                            │
│  ├── PostgreSQL (managed)                                                  │
│  ├── Auth (managed)                                                        │
│  ├── Storage (managed)                                                     │
│  └── Backups (automatic)                                                   │
│       ↓                                                                    │
│  Razorpay (Payments)                                                       │
│  Resend (Email)                                                            │
│  Sentry (Error Monitoring)                                                 │
│  PostHog (Analytics)                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Summary

**SLF Backend Infrastructure is complete and ready for:**

✅ Production deployment
✅ Frontend integration
✅ Real athlete data
✅ Real coaching workflows
✅ Real analytics

**Next Step**: Wire the frontend components to use the backend services.

See `WIRING_FRONTEND.md` for detailed instructions.
