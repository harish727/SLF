# SLF Backend Setup & Testing Checklist

## Pre-Setup

- [ ] Node.js 18+ installed
- [ ] npm or yarn available
- [ ] Supabase account created (https://supabase.com)
- [ ] Git repository initialized

## Phase 1: Supabase Project Setup

### Create Project

- [ ] Go to https://supabase.com
- [ ] Click "New Project"
- [ ] Name: `slf-fitness-coach`
- [ ] Choose region (closest to users)
- [ ] Set strong database password
- [ ] Wait for project initialization (~2 min)

### Get Credentials

- [ ] Go to **Settings → API**
- [ ] Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Save credentials securely

### Configure Environment

- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Paste `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Paste `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Verify `.env.local` is in `.gitignore`

## Phase 2: Database Migration

### Run Migration

- [ ] Go to Supabase dashboard
- [ ] Navigate to **SQL Editor**
- [ ] Click **New Query**
- [ ] Open `supabase/migrations/001_core_schema.sql`
- [ ] Copy entire file contents
- [ ] Paste into SQL Editor
- [ ] Click **Run**
- [ ] Wait for completion (should see "Success")

### Verify Tables Created

- [ ] Go to **Table Editor**
- [ ] Verify these tables exist:
  - [ ] `profiles`
  - [ ] `athlete_profiles`
  - [ ] `coach_athletes`
  - [ ] `exercises`
  - [ ] `programs`
  - [ ] `training_blocks`
  - [ ] `training_weeks`
  - [ ] `training_days`
  - [ ] `workouts`
  - [ ] `workout_exercises`
  - [ ] `workout_sets`
  - [ ] `training_sessions`
  - [ ] `performed_sets`
  - [ ] `session_summaries`
  - [ ] `bodyweight_logs`

### Verify Seed Data

- [ ] Go to **Table Editor → exercises**
- [ ] Verify 20 exercises are seeded:
  - [ ] Back Squat
  - [ ] Bench Press
  - [ ] Deadlift
  - [ ] (and 17 others)

### Verify Triggers

- [ ] Go to **SQL Editor**
- [ ] Run: `SELECT * FROM pg_trigger WHERE tgname LIKE 'trg_%';`
- [ ] Verify these triggers exist:
  - [ ] `trg_compute_e1rm`
  - [ ] `trg_profiles_updated_at`
  - [ ] `trg_on_auth_user_created`
  - [ ] (and others)

### Verify RLS Policies

- [ ] Go to **Authentication → Policies**
- [ ] Verify policies exist for each table
- [ ] Check that RLS is enabled on all tables

## Phase 3: Authentication Setup

### Enable Email Auth

- [ ] Go to **Authentication → Providers**
- [ ] Find **Email**
- [ ] Toggle **Enabled**
- [ ] Go to **Settings → Email**
- [ ] Configure SMTP or use Supabase default
- [ ] (Optional) Customize email templates

### Test Auth

- [ ] Go to **Authentication → Users**
- [ ] Verify no users yet (empty)

## Phase 4: Local Development (Optional)

### Install Supabase CLI

- [ ] `npm install -g supabase`
- [ ] `supabase init`
- [ ] `supabase start`
- [ ] Wait for Docker containers to start

### Configure Local Environment

- [ ] Update `.env.local` with local Supabase URL
- [ ] Update `.env.local` with local anon key
- [ ] (From `supabase start` output)

## Phase 5: Frontend Setup

### Install Dependencies

- [ ] `npm install`
- [ ] Verify no errors

### Start Dev Server

- [ ] `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Verify app loads without errors

## Phase 6: End-to-End Testing

### Test Signup

- [ ] Go to http://localhost:3000/signup
- [ ] Enter:
  - [ ] First Name: "Test"
  - [ ] Last Name: "Athlete"
  - [ ] Email: "test@example.com"
  - [ ] Password: "TestPass123!"
- [ ] Click **Sign Up**
- [ ] Verify redirected to `/verify-email`
- [ ] Check Supabase **Authentication → Users**
  - [ ] New user should appear
  - [ ] Email should be unverified

### Test Email Verification

- [ ] Go to Supabase **Authentication → Users**
- [ ] Find the test user
- [ ] Click the user
- [ ] Click **Confirm email** (or similar)
- [ ] Go back to app
- [ ] Refresh page
- [ ] Should redirect to `/onboarding`

### Test Onboarding

- [ ] Fill out onboarding form:
  - [ ] Date of Birth
  - [ ] Gender
  - [ ] Height
  - [ ] Weight
  - [ ] Training Experience
  - [ ] Discipline
  - [ ] Goals
  - [ ] Days per week
  - [ ] Preferred days
- [ ] Click **Complete**
- [ ] Verify redirected to `/` (dashboard)
- [ ] Check Supabase **Table Editor → athlete_profiles**
  - [ ] New profile should appear

### Test Dashboard

- [ ] Verify dashboard loads
- [ ] Check for:
  - [ ] Athlete name displayed
  - [ ] Today's workout (if assigned)
  - [ ] Recent sessions (empty initially)
  - [ ] Strength metrics
  - [ ] Coach notes

### Test Training Session

- [ ] Go to `/train`
- [ ] Verify page loads
- [ ] Select a block, week, day
- [ ] Verify exercises load
- [ ] Click first exercise to expand
- [ ] Log a set:
  - [ ] Enter weight: 140
  - [ ] Enter reps: 5
  - [ ] Select RPE: 7
  - [ ] Click **Done — Set 1**
- [ ] Verify:
  - [ ] Toast shows "Set logged — 140 kg × 5 @ RPE 7"
  - [ ] Set appears as completed
  - [ ] Progress bar updates
- [ ] Check Supabase **Table Editor → performed_sets**
  - [ ] New set should appear
  - [ ] `e1rm_kg` should be calculated (not null)

### Test Session Completion

- [ ] Log 2-3 more sets
- [ ] Verify progress bar reaches 100%
- [ ] Click **✓ Finish Session**
- [ ] Verify **SessionSummaryModal** appears
- [ ] Check displayed data:
  - [ ] Total volume (should be calculated)
  - [ ] Tonnage (should be calculated)
  - [ ] Avg RPE (should be calculated)
  - [ ] Duration (should show time elapsed)
  - [ ] e1RM values (should be calculated)
- [ ] Select a feeling (e.g., 💪)
- [ ] Click **Done**
- [ ] Verify modal closes
- [ ] Check Supabase **Table Editor → session_summaries**
  - [ ] New summary should appear
  - [ ] All calculated fields should be populated

### Test Session Card

- [ ] Go back to `/train`
- [ ] Start another session
- [ ] Log a few sets
- [ ] Finish session
- [ ] In **SessionSummaryModal**, click **📸 Create Session Card**
- [ ] Verify **ShareCardScreen** appears
- [ ] Test each template:
  - [ ] Click **Minimal** → verify card preview
  - [ ] Click **Performance** → verify card preview
  - [ ] Click **Photo** → verify card preview
  - [ ] Click **Photo** → click **📸 Add Session Photo**
  - [ ] Select a photo from device
  - [ ] Verify photo appears in preview
- [ ] Click **Save Image** (should download)
- [ ] Click **Share** (should open share dialog)

## Phase 7: Data Verification

### Check Database State

- [ ] Go to Supabase **Table Editor**
- [ ] Verify data in each table:
  - [ ] `profiles` — user profile
  - [ ] `athlete_profiles` — athlete data
  - [ ] `training_sessions` — session record
  - [ ] `performed_sets` — logged sets with e1RM
  - [ ] `session_summaries` — summary with analytics

### Check RLS Security

- [ ] Create a second test user
- [ ] Log in as second user
- [ ] Verify they cannot see first user's data
- [ ] Go to browser DevTools → Network
- [ ] Check API calls
- [ ] Verify RLS policies are working (no data leaks)

### Check Calculations

- [ ] Verify e1RM calculations:
  - [ ] For 140 kg × 5 reps: should be ~163.3 kg
  - [ ] For 100 kg × 10 reps: should be ~133.3 kg
- [ ] Verify volume calculations:
  - [ ] 140 × 5 + 140 × 5 + 140 × 5 = 2100 kg
- [ ] Verify tonnage:
  - [ ] 2100 kg = 2.1 t

## Phase 8: Performance Testing

### Check Load Times

- [ ] Measure page load times:
  - [ ] `/` (dashboard): < 2s
  - [ ] `/train`: < 2s
  - [ ] `/progress`: < 2s
- [ ] Measure API response times:
  - [ ] `logSet()`: < 500ms
  - [ ] `finishSession()`: < 1s

### Check Database Indexes

- [ ] Go to Supabase **SQL Editor**
- [ ] Run: `SELECT * FROM pg_indexes WHERE tablename IN ('performed_sets', 'training_sessions', 'bodyweight_logs');`
- [ ] Verify indexes exist on:
  - [ ] `performed_sets(session_id)`
  - [ ] `performed_sets(exercise_id, performed_at)`
  - [ ] `training_sessions(athlete_id, started_at)`

## Phase 9: Error Handling

### Test Validation Errors

- [ ] Try to log a set with invalid data:
  - [ ] Weight: -10 (should fail)
  - [ ] Reps: 0 (should fail)
  - [ ] RPE: 15 (should fail)
- [ ] Verify error messages are clear

### Test Authorization Errors

- [ ] Try to access another user's session (via URL manipulation)
- [ ] Verify access denied (RLS policy blocks it)

### Test Database Errors

- [ ] Disconnect internet
- [ ] Try to log a set
- [ ] Verify error message is shown
- [ ] Reconnect internet
- [ ] Verify app recovers

## Phase 10: Documentation Review

- [ ] Read `BACKEND_SETUP.md`
- [ ] Read `BACKEND_ARCHITECTURE.md`
- [ ] Read `DATABASE_REFERENCE.md`
- [ ] Read `WIRING_FRONTEND.md`
- [ ] Verify all documentation is accurate

## Phase 11: Cleanup & Finalization

### Clean Up Test Data

- [ ] Delete test users from Supabase
- [ ] Delete test sessions
- [ ] Verify database is clean

### Verify Environment

- [ ] `.env.local` is in `.gitignore`
- [ ] No credentials in code
- [ ] No credentials in git history

### Final Verification

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] No console errors
- [ ] No console warnings

## Phase 12: Ready for Production

- [ ] All tests pass
- [ ] All documentation complete
- [ ] All data verified
- [ ] All security checks pass
- [ ] Ready to wire frontend

## Troubleshooting Checklist

If something goes wrong:

### "Invalid API key"
- [ ] Check `.env.local` has correct URL
- [ ] Check `.env.local` has correct anon key
- [ ] Verify keys are from correct Supabase project
- [ ] Restart dev server

### "RLS policy violation"
- [ ] Check user is authenticated
- [ ] Check browser cookies (DevTools → Application)
- [ ] Verify user ID matches row's athlete_id
- [ ] Check RLS policies in Supabase

### "Table doesn't exist"
- [ ] Re-run migration SQL
- [ ] Check for SQL errors in Supabase
- [ ] Verify all tables in Table Editor

### "e1RM not calculating"
- [ ] Check trigger exists: `trg_compute_e1rm`
- [ ] Check `performed_sets.e1rm_kg` is not null
- [ ] Verify trigger is firing (check logs)

### "Session not found"
- [ ] Check `training_sessions` table
- [ ] Verify session_id is correct
- [ ] Check athlete_id matches current user

### "Email not sending"
- [ ] Check Supabase email settings
- [ ] Check spam folder
- [ ] Verify SMTP configuration
- [ ] Check Supabase logs

## Sign-Off

- [ ] All checklist items completed
- [ ] All tests passing
- [ ] All documentation reviewed
- [ ] Ready for frontend wiring

**Date Completed**: _______________
**Completed By**: _______________
**Notes**: _______________

---

**Next Step**: See `WIRING_FRONTEND.md` to connect the frontend to the backend.
