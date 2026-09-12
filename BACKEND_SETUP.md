# SLF Backend Setup Guide

## Phase 1: Database & Auth Infrastructure

This guide walks through setting up the complete SLF backend using Supabase.

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (https://supabase.com)

### 1. Create a Supabase project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Name it `slf-fitness-coach`
4. Choose a region close to your users
5. Set a strong database password
6. Wait for the project to initialize (~2 min)

### 2. Get your credentials

Once the project is ready:

1. Go to **Settings → API**
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Create `.env.local`

```bash
cp .env.local.example .env.local
```

Then paste your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Run the migration

In Supabase dashboard:

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_core_schema.sql`
4. Paste into the editor
5. Click **Run**

This creates:
- All tables (profiles, programs, workouts, sessions, etc.)
- Enums (user roles, statuses, etc.)
- Triggers (e1RM calculation, updated_at)
- RLS policies (row-level security)
- Seed data (exercise library)

### 5. Enable email authentication

In Supabase dashboard:

1. Go to **Authentication → Providers**
2. Find **Email**
3. Toggle **Enabled**
4. Under **Email Templates**, customize if desired
5. Go to **Settings → Email**
6. Configure SMTP or use Supabase's default

### 6. Test the setup

```bash
npm run dev
```

Then:

1. Go to http://localhost:3000/signup
2. Create an account
3. Check your email for verification link
4. Complete onboarding
5. Start a training session

### Local development (optional)

To develop without touching production:

```bash
npm install -g supabase
supabase init
supabase start
```

This runs PostgreSQL + Supabase locally in Docker.

Then update `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (from supabase start output)
```

### Database schema overview

The migration creates this core chain:

```
profiles (Supabase Auth users)
  ├── athlete_profiles
  ├── coach_athletes (relationship)
  │
  └── programs
       └── training_blocks
            └── training_weeks
                 └── training_days
                      └── workouts
                           └── workout_exercises
                                └── workout_sets
                                     └── training_sessions
                                          └── performed_sets (actual data)
                                               └── session_summaries (analytics)
```

### Key features enabled

✓ Email/password authentication
✓ Row-level security (RLS) — athletes can only see their own data
✓ e1RM auto-calculation (Epley formula)
✓ Session summary generation
✓ Coach ↔ athlete relationships
✓ Exercise library (20 common lifts)

### Next steps

1. **Phase 2**: Add performance analytics tables (bodyweight, recovery, competitions)
2. **Phase 3**: Add coaching features (feedback, reviews, messaging)
3. **Phase 4**: Add membership/billing (Razorpay integration)
4. **Phase 5**: Add advanced analytics (MRV, projections, wearable integrations)

### Troubleshooting

**"Invalid API key"**
- Check `.env.local` has correct URL and key
- Verify keys are from the correct Supabase project

**"RLS policy violation"**
- Ensure you're authenticated (check browser DevTools → Application → Cookies)
- Verify the user ID matches the row's athlete_id

**"Table doesn't exist"**
- Re-run the migration SQL
- Check Supabase SQL Editor for errors

**"e1RM not calculating"**
- The trigger runs automatically on insert
- Check `performed_sets` table — `e1rm_kg` should be populated

### Support

For issues:
1. Check Supabase logs: **Settings → Logs**
2. Check browser console for API errors
3. Verify RLS policies in **Authentication → Policies**
