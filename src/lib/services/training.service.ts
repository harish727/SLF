import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ── Schemas ───────────────────────────────────────────────────────────────────

const LogSetSchema = z.object({
  sessionId:    z.string().uuid(),
  workoutSetId: z.string().uuid().nullable(),
  exerciseId:   z.string().uuid(),
  setNumber:    z.number().int().min(1),
  weightKg:     z.number().min(0),
  reps:         z.number().int().min(1),
  rpe:          z.number().min(1).max(10).nullable(),
});

const FinishSessionSchema = z.object({
  sessionId: z.string().uuid(),
  feeling:   z.number().int().min(1).max(5).nullable(),
  feedback:  z.string().max(1000).nullable(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const SQUAT_SLUGS    = ['back-squat', 'front-squat', 'paused-squat', 'high-bar-squat', 'sumo-squat'];
const BENCH_SLUGS    = ['bench-press', 'close-grip-bench', 'paused-bench'];
const DEADLIFT_SLUGS = ['deadlift', 'paused-deadlift', 'sumo-deadlift'];

// ── Start session ─────────────────────────────────────────────────────────────

export async function startSession(workoutId: string): Promise<{ sessionId: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  // Check for an existing in-progress session for this workout
  const { data: existing } = await supabase
    .from('training_sessions')
    .select('id')
    .eq('athlete_id', user.id)
    .eq('workout_id', workoutId)
    .in('status', ['not_started', 'in_progress'])
    .maybeSingle();

  if (existing) return { sessionId: existing.id };

  const { data, error } = await supabase
    .from('training_sessions')
    .insert({
      athlete_id: user.id,
      workout_id: workoutId,
      status:     'in_progress',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message ?? 'insert_failed' };
  return { sessionId: data.id };
}

// ── Log a set ─────────────────────────────────────────────────────────────────

export async function logSet(
  input: z.infer<typeof LogSetSchema>
): Promise<{ setId: string; e1rm: number } | { error: string }> {
  const parsed = LogSetSchema.safeParse(input);
  if (!parsed.success) return { error: 'validation' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  // Verify session belongs to this athlete
  const { data: session } = await supabase
    .from('training_sessions')
    .select('id, athlete_id')
    .eq('id', parsed.data.sessionId)
    .eq('athlete_id', user.id)
    .single();

  if (!session) return { error: 'session_not_found' };

  const { data, error } = await supabase
    .from('performed_sets')
    .insert({
      session_id:     parsed.data.sessionId,
      workout_set_id: parsed.data.workoutSetId,
      exercise_id:    parsed.data.exerciseId,
      set_number:     parsed.data.setNumber,
      weight_kg:      parsed.data.weightKg,
      reps:           parsed.data.reps,
      rpe:            parsed.data.rpe,
      completed:      true,
    })
    .select('id, e1rm_kg')
    .single();

  if (error || !data) return { error: error?.message ?? 'insert_failed' };
  return { setId: data.id, e1rm: data.e1rm_kg ?? 0 };
}

// ── Finish session ────────────────────────────────────────────────────────────

export async function finishSession(
  input: z.infer<typeof FinishSessionSchema>
): Promise<{ summary: SessionSummaryResult } | { error: string }> {
  const parsed = FinishSessionSchema.safeParse(input);
  if (!parsed.success) return { error: 'validation' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  // Verify ownership
  const { data: session } = await supabase
    .from('training_sessions')
    .select('id, athlete_id, started_at')
    .eq('id', parsed.data.sessionId)
    .eq('athlete_id', user.id)
    .single();

  if (!session) return { error: 'session_not_found' };

  // Fetch all performed sets with exercise slugs
  const { data: sets } = await supabase
    .from('performed_sets')
    .select('*, exercises(slug)')
    .eq('session_id', parsed.data.sessionId)
    .eq('completed', true);

  if (!sets?.length) return { error: 'no_sets' };

  // ── Calculate summary ──────────────────────────────────────────────────────

  let totalVolume = 0;
  let totalReps   = 0;
  let rpeSum      = 0;
  let rpeCount    = 0;
  const e1rmByGroup: Record<'squat' | 'bench' | 'deadlift', number> = { squat: 0, bench: 0, deadlift: 0 };

  for (const s of sets) {
    totalVolume += s.weight_kg * s.reps;
    totalReps   += s.reps;
    if (s.rpe) { rpeSum += s.rpe; rpeCount++; }

    const slug = (s.exercises as { slug: string } | null)?.slug ?? '';
    const e1rm = s.e1rm_kg ?? 0;

    if (SQUAT_SLUGS.includes(slug)    && e1rm > e1rmByGroup.squat)    e1rmByGroup.squat    = e1rm;
    if (BENCH_SLUGS.includes(slug)    && e1rm > e1rmByGroup.bench)    e1rmByGroup.bench    = e1rm;
    if (DEADLIFT_SLUGS.includes(slug) && e1rm > e1rmByGroup.deadlift) e1rmByGroup.deadlift = e1rm;
  }

  const avgRpe     = rpeCount ? Math.round((rpeSum / rpeCount) * 10) / 10 : null;
  const totalE1rm  = e1rmByGroup.squat + e1rmByGroup.bench + e1rmByGroup.deadlift;
  const now        = new Date();
  const durationSec = session.started_at
    ? Math.round((now.getTime() - new Date(session.started_at).getTime()) / 1000)
    : null;

  // Fetch previous session summary for comparison
  const { data: prevSummary } = await supabase
    .from('session_summaries')
    .select('total_volume_kg, total_e1rm_kg, completed_sets')
    .eq('athlete_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const summaryInsert = {
    session_id:          parsed.data.sessionId,
    athlete_id:          user.id,
    total_sets:          sets.length,
    completed_sets:      sets.length,
    total_reps:          totalReps,
    total_volume_kg:     Math.round(totalVolume * 100) / 100,
    avg_rpe:             avgRpe,
    duration_seconds:    durationSec,
    squat_e1rm_kg:       e1rmByGroup.squat    || null,
    bench_e1rm_kg:       e1rmByGroup.bench    || null,
    deadlift_e1rm_kg:    e1rmByGroup.deadlift || null,
    total_e1rm_kg:       totalE1rm            || null,
    prev_total_e1rm_kg:  prevSummary?.total_e1rm_kg   ?? null,
    e1rm_change_kg:      totalE1rm && prevSummary?.total_e1rm_kg
                           ? Math.round((totalE1rm - prevSummary.total_e1rm_kg) * 10) / 10
                           : null,
    prev_volume_kg:      prevSummary?.total_volume_kg ?? null,
    volume_change_kg:    prevSummary?.total_volume_kg
                           ? Math.round((totalVolume - prevSummary.total_volume_kg) * 100) / 100
                           : null,
  };

  // ── Transactional writes ───────────────────────────────────────────────────

  const [{ error: sessionErr }, { error: summaryErr }] = await Promise.all([
    supabase
      .from('training_sessions')
      .update({
        status:           'completed',
        completed_at:     now.toISOString(),
        duration_seconds: durationSec,
        session_rpe:      parsed.data.feeling ? parsed.data.feeling * 2 : null,
        feeling:          parsed.data.feeling,
        athlete_feedback: parsed.data.feedback,
      })
      .eq('id', parsed.data.sessionId),

    supabase
      .from('session_summaries')
      .upsert(summaryInsert, { onConflict: 'session_id' }),
  ]);

  if (sessionErr || summaryErr) {
    return { error: sessionErr?.message ?? summaryErr?.message ?? 'write_failed' };
  }

  return {
    summary: {
      sets:           sets.length,
      volume:         totalVolume,
      avgRpe:         avgRpe ?? 0,
      durationSeconds: durationSec ?? 0,
      squatE1rm:      e1rmByGroup.squat    || null,
      benchE1rm:      e1rmByGroup.bench    || null,
      deadliftE1rm:   e1rmByGroup.deadlift || null,
      totalE1rm:      totalE1rm            || null,
      e1rmChange:     summaryInsert.e1rm_change_kg,
      volumeChange:   summaryInsert.volume_change_kg,
      prevSets:       prevSummary?.completed_sets ?? null,
    },
  };
}

// ── Return type ───────────────────────────────────────────────────────────────

export interface SessionSummaryResult {
  sets:            number;
  volume:          number;
  avgRpe:          number;
  durationSeconds: number;
  squatE1rm:       number | null;
  benchE1rm:       number | null;
  deadliftE1rm:    number | null;
  totalE1rm:       number | null;
  e1rmChange:      number | null;
  volumeChange:    number | null;
  prevSets:        number | null;
}
