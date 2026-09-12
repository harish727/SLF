# Next Steps: Wire Frontend to Backend

Now that the backend is ready, the frontend needs to be updated to use real data instead of the fake `db.ts`.

## Current State

- Frontend uses fake in-memory data from `src/lib/db.ts`
- Auth uses fake cookie-based session
- Training data is hardcoded
- Session summary shows fake data

## Target State

- Frontend fetches real data from Supabase
- Auth uses Supabase Auth
- Training data comes from database
- Session summary shows real calculated data

## Step-by-Step Wiring

### 1. Update Auth Pages

**File**: `src/app/(auth)/login/page.tsx`

Replace the fake form submission with the real `loginAction`:

```typescript
'use client';
import { loginAction } from '@/lib/auth/actions';

export default function LoginPage() {
  async function handleSubmit(email: string, password: string) {
    const result = await loginAction(email, password);
    if (result.error) {
      // Show error
    } else {
      // Redirect handled by server action
    }
  }
  // ... rest of component
}
```

**File**: `src/app/(auth)/signup/page.tsx`

```typescript
'use client';
import { signupAction } from '@/lib/auth/actions';

export default function SignupPage() {
  async function handleSubmit(firstName, lastName, email, password) {
    const result = await signupAction(firstName, lastName, email, password);
    if (result.error) {
      // Show error
    } else {
      // Redirect handled by server action
    }
  }
  // ... rest of component
}
```

### 2. Update Onboarding

**File**: `src/app/(app)/onboarding/page.tsx`

```typescript
'use client';
import { completeOnboardingAction } from '@/lib/auth/actions';

export default function OnboardingPage() {
  async function handleSubmit(profile) {
    await completeOnboardingAction(profile);
    // Redirect handled by server action
  }
  // ... rest of component
}
```

### 3. Update Train Page

**File**: `src/app/(app)/train/page.tsx`

Replace the fake data fetch:

```typescript
// BEFORE
import { getTrainingByUserId } from '@/lib/db';

export default async function TrainPage() {
  const session = await getSession();
  const data = getTrainingByUserId(session.userId);  // ← FAKE
  return <TrainShell data={data} />;
}

// AFTER
import { createClient } from '@/lib/supabase/server';

export default async function TrainPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const supabase = await createClient();
  
  // Fetch athlete's active program
  const { data: program } = await supabase
    .from('programs')
    .select(`
      *,
      training_blocks(
        *,
        training_weeks(
          *,
          training_days(
            *,
            workouts(
              *,
              workout_exercises(
                *,
                exercises(*),
                workout_sets(*)
              )
            )
          )
        )
      )
    `)
    .eq('athlete_id', session.userId)
    .eq('status', 'active')
    .single();

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">No active program assigned.</p>
      </div>
    );
  }

  return <TrainShell data={program} />;
}
```

### 4. Update TrainShell Component

**File**: `src/components/train/TrainShell.tsx`

The component already has the right structure. Just ensure it's using the real data passed from the page.

### 5. Wire Session Completion

**File**: `src/components/train/SessionSummaryModal.tsx`

Update to call the real backend:

```typescript
'use client';
import { finishSession } from '@/lib/services/training.service';

export function SessionSummaryModal({ stats, blockName, weekNumber, onClose }) {
  async function handleSubmit() {
    const result = await finishSession({
      sessionId: stats.sessionId,  // ← need to pass this
      feeling: feeling,
      feedback: null,
    });

    if (result.error) {
      toast(result.error);
    } else {
      // Show real summary data
      setSubmitted(true);
      setTimeout(onClose, 1200);
    }
  }
  // ... rest of component
}
```

### 6. Update ExerciseCard Component

**File**: `src/components/train/ExerciseCard.tsx`

Wire the set completion to the backend:

```typescript
'use client';
import { logSet } from '@/lib/services/training.service';

export function ExerciseCard({ exercise, sets, onSetComplete }) {
  const handleComplete = useCallback(async (setIdx, weight, reps, rpe) => {
    const result = await logSet({
      sessionId: sessionId,  // ← need to pass this
      workoutSetId: sets[setIdx].id,
      exerciseId: exercise.id,
      setNumber: setIdx + 1,
      weightKg: weight,
      reps: reps,
      rpe: rpe,
    });

    if (result.error) {
      toast(result.error);
    } else {
      toast(`Set logged — e1RM: ${result.e1rm} kg`);
      onSetComplete(exercise.id, setIdx, weight, reps, rpe);
    }
  }, [sessionId, exercise.id, onSetComplete]);
  // ... rest of component
}
```

### 7. Update Dashboard

**File**: `src/app/(app)/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const supabase = await createClient();

  // Fetch athlete profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.userId)
    .single();

  // Fetch today's workout
  const { data: todayWorkout } = await supabase
    .from('training_days')
    .select(`
      *,
      workouts(
        *,
        workout_exercises(
          *,
          exercises(*),
          workout_sets(*)
        )
      )
    `)
    .eq('scheduled_date', new Date().toISOString().split('T')[0])
    .single();

  // Fetch recent sessions
  const { data: recentSessions } = await supabase
    .from('session_summaries')
    .select('*')
    .eq('athlete_id', session.userId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch strength metrics
  const { data: strengthMetrics } = await supabase
    .from('performed_sets')
    .select('*, exercises(slug)')
    .eq('session_id', recentSessions?.[0]?.session_id)
    .order('performed_at', { ascending: false });

  return (
    <DashboardShell
      profile={profile}
      todayWorkout={todayWorkout}
      recentSessions={recentSessions}
      strengthMetrics={strengthMetrics}
    />
  );
}
```

### 8. Update Progress Page

**File**: `src/app/(app)/progress/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export default async function ProgressPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const supabase = await createClient();

  // Fetch e1RM progression
  const { data: e1rmHistory } = await supabase
    .from('performed_sets')
    .select('*, exercises(slug)')
    .eq('session_id', session.userId)  // ← need to join through sessions
    .order('performed_at', { ascending: false });

  // Fetch bodyweight history
  const { data: bodyweightHistory } = await supabase
    .from('bodyweight_logs')
    .select('*')
    .eq('athlete_id', session.userId)
    .order('recorded_at', { ascending: false });

  // Fetch session summaries
  const { data: sessionSummaries } = await supabase
    .from('session_summaries')
    .select('*')
    .eq('athlete_id', session.userId)
    .order('created_at', { ascending: false });

  return (
    <ProgressShell
      e1rmHistory={e1rmHistory}
      bodyweightHistory={bodyweightHistory}
      sessionSummaries={sessionSummaries}
    />
  );
}
```

## Data Type Updates

Update component props to match real database types:

```typescript
// BEFORE (fake)
interface TrainingData {
  activeBlockId: string;
  blocks: Block[];
}

// AFTER (real)
import type { Program, TrainingBlock, TrainingWeek, TrainingDay, Workout } from '@/lib/supabase/types';

interface TrainingData {
  id: string;
  athlete_id: string;
  name: string;
  training_blocks: (TrainingBlock & {
    training_weeks: (TrainingWeek & {
      training_days: (TrainingDay & {
        workouts: Workout[];
      })[];
    })[];
  })[];
}
```

## Session Management

Pass `sessionId` through the component tree:

```typescript
// TrainShell needs to create a session on mount
useEffect(() => {
  async function initSession() {
    const result = await startSession(workoutId);
    if (result.error) {
      toast(result.error);
    } else {
      setSessionId(result.sessionId);
    }
  }
  initSession();
}, [workoutId]);

// Pass to child components
<ExerciseCard sessionId={sessionId} ... />
<SessionSummaryModal sessionId={sessionId} ... />
```

## Environment Setup

Make sure `.env.local` is configured:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Testing Checklist

- [ ] Sign up works with real Supabase Auth
- [ ] Email verification works
- [ ] Onboarding saves to database
- [ ] Train page loads real program data
- [ ] Can start a session
- [ ] Can log sets (e1RM calculates)
- [ ] Can finish session (summary generates)
- [ ] Dashboard shows real data
- [ ] Progress page shows real history
- [ ] Coach can see assigned athletes

## Rollout Strategy

1. **Update auth pages first** (lowest risk)
2. **Update train page** (core feature)
3. **Update dashboard** (read-only)
4. **Update progress** (read-only)
5. **Test end-to-end** (signup → train → summary)

## Debugging

If something breaks:

1. Check browser console for errors
2. Check Supabase logs: **Settings → Logs**
3. Verify `.env.local` has correct credentials
4. Check RLS policies: **Authentication → Policies**
5. Verify user is authenticated: DevTools → Application → Cookies

## Performance Optimization

Once wired, consider:

- Caching frequently accessed data (programs, exercises)
- Pagination for large result sets (sessions, bodyweight logs)
- Real-time subscriptions for live session updates
- Optimistic UI updates while waiting for server

## Next Phase

Once frontend is fully wired:

1. **Phase 2**: Add performance analytics (bodyweight, recovery, competitions)
2. **Phase 3**: Add coaching features (feedback, reviews, messaging)
3. **Phase 4**: Add membership/billing
4. **Phase 5**: Add advanced analytics (MRV, projections)

---

**Estimated time to wire frontend**: 4-6 hours
**Complexity**: Medium (mostly data fetching and prop passing)
**Risk**: Low (backend is solid, just connecting UI to it)
