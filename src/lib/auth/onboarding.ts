'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface OnboardingData {
  // step: personal
  dob: string;
  gender: string;
  height: string;
  weight: string;
  units: 'kg' | 'lbs';
  // step: training background
  experience: string;
  competitionLevel: string;
  gymType: string;
  gymName: string;
  equipmentAvailable: string[];
  daysPerWeek: number;
  preferredDays: string[];
  sessionDuration: string;
  consistency: string;
  // step: strength
  squatRm: string; squatRmReps: string; squatRmRpe: string; squatConfidence: string;
  benchRm: string; benchRmReps: string; benchRmRpe: string; benchConfidence: string;
  deadliftRm: string; deadliftRmReps: string; deadliftRmRpe: string; deadliftConfidence: string;
  // step: squat
  squatStyle: string; squatStance: string; squatBarPosition: string; squatFootwear: string;
  squatIssues: string[]; squatConfidenceRating: number;
  // step: bench
  benchGrip: string; benchArch: string; benchTouch: string;
  benchIssues: string[]; benchConfidenceRating: number;
  // step: deadlift
  deadliftStyle: string; deadliftBuild: string;
  deadliftIssues: string[]; deadliftConfidenceRating: number;
  // step: injuries
  affectedAreas: string[]; recentInjury: string; injuryNotes: string;
  // step: goals
  primaryGoal: string; priorityRanking: string[]; successDefinition: string;
  targetTotal: string; nextMeetName: string; nextMeetDate: string; nextMeetImportance: number;
  // step: preferences
  motivations: string[]; coachExpectations: string[]; feedbackStyle: string[]; checkinTime: string;
  // step: plan
  selectedPlan: 'member' | 'pro' | 'elite';
}

// Epley e1RM estimate
function estimateE1rm(weight: number, reps: number, rpe: number): number {
  if (reps === 1) return weight;
  // adjust for RPE: rpe 10 = true max, each point below ~5% off
  const rpeAdjust = 1 + (10 - rpe) * 0.05;
  return Math.round(weight * (1 + reps / 30) * rpeAdjust * 2) / 2;
}

export async function saveOnboardingAction(data: OnboardingData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  const uid = user.id;

  // ── 1. Update profiles (personal) ─────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileErr } = await (supabase as any)
    .from('profiles')
    .update({ date_of_birth: data.dob || null, units: data.units })
    .eq('id', uid);
  if (profileErr) return { error: (profileErr as Error).message };

  // ── 2. athlete_profiles (height / weight / training age) ──────────────────
  const trainingAgeMap: Record<string, number> = {
    'beginner': 0, '< 1 year': 0.5, '1–2 years': 1.5, '3–5 years': 4, '5–10 years': 7, '10+ years': 12,
  };
  const heightKg = data.units === 'lbs'
    ? parseFloat(data.weight) * 0.453592
    : parseFloat(data.weight);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error: apErr } = await db.from('athlete_profiles').upsert({
    profile_id: uid,
    height_cm: parseFloat(data.height) || null,
    training_age_years: trainingAgeMap[data.experience] ?? null,
    preferred_training_days: data.preferredDays,
    training_frequency: data.daysPerWeek,
  }, { onConflict: 'profile_id' });
  if (apErr) return { error: apErr.message };

  // ── 3. bodyweight log ─────────────────────────────────────────────────────
  if (data.weight) {
    await db.from('bodyweight_logs').insert({ athlete_id: uid, weight_kg: heightKg, source: 'onboarding' });
  }

  // ── 4. athlete_powerlifting_profiles ──────────────────────────────────────
  const { error: plErr } = await db.from('athlete_powerlifting_profiles').upsert({
    profile_id: uid,
    competition_level: data.competitionLevel || 'none',
    gym_type: data.gymType || null,
    gym_name: data.gymName || null,
    equipment_available: data.equipmentAvailable,
    days_per_week: data.daysPerWeek,
    preferred_days: data.preferredDays,
    session_duration: data.sessionDuration || null,
    consistency: data.consistency || null,
    next_meet_name: data.nextMeetName || null,
    next_meet_date: data.nextMeetDate || null,
    next_meet_importance: data.nextMeetImportance || null,
    selected_plan: data.selectedPlan,
  }, { onConflict: 'profile_id' });
  if (plErr) return { error: plErr.message };

  // ── 5. athlete_lift_profiles (upsert each lift) ───────────────────────────
  const lifts: Array<{ lift: 'squat' | 'bench' | 'deadlift'; row: Record<string, unknown> }> = [
    {
      lift: 'squat',
      row: {
        profile_id: uid, lift: 'squat',
        current_1rm_kg: parseFloat(data.squatRm) || null,
        rm_reps: parseInt(data.squatRmReps) || null,
        rm_weight_kg: parseFloat(data.squatRm) || null,
        rm_rpe: parseFloat(data.squatRmRpe) || null,
        estimated_1rm_kg: data.squatRmReps && data.squatRm
          ? estimateE1rm(parseFloat(data.squatRm), parseInt(data.squatRmReps), parseFloat(data.squatRmRpe) || 8)
          : null,
        strength_confidence: data.squatConfidence || null,
        style: data.squatStyle || null,
        stance: data.squatStance || null,
        bar_position: data.squatBarPosition || null,
        footwear: data.squatFootwear || null,
        confidence_rating: data.squatConfidenceRating || null,
      },
    },
    {
      lift: 'bench',
      row: {
        profile_id: uid, lift: 'bench',
        current_1rm_kg: parseFloat(data.benchRm) || null,
        rm_reps: parseInt(data.benchRmReps) || null,
        rm_weight_kg: parseFloat(data.benchRm) || null,
        rm_rpe: parseFloat(data.benchRmRpe) || null,
        estimated_1rm_kg: data.benchRmReps && data.benchRm
          ? estimateE1rm(parseFloat(data.benchRm), parseInt(data.benchRmReps), parseFloat(data.benchRmRpe) || 8)
          : null,
        strength_confidence: data.benchConfidence || null,
        grip: data.benchGrip || null,
        arch: data.benchArch || null,
        touch_style: data.benchTouch || null,
        confidence_rating: data.benchConfidenceRating || null,
      },
    },
    {
      lift: 'deadlift',
      row: {
        profile_id: uid, lift: 'deadlift',
        current_1rm_kg: parseFloat(data.deadliftRm) || null,
        rm_reps: parseInt(data.deadliftRmReps) || null,
        rm_weight_kg: parseFloat(data.deadliftRm) || null,
        rm_rpe: parseFloat(data.deadliftRmRpe) || null,
        estimated_1rm_kg: data.deadliftRmReps && data.deadliftRm
          ? estimateE1rm(parseFloat(data.deadliftRm), parseInt(data.deadliftRmReps), parseFloat(data.deadliftRmRpe) || 8)
          : null,
        strength_confidence: data.deadliftConfidence || null,
        style: data.deadliftStyle || null,
        build_description: data.deadliftBuild || null,
        confidence_rating: data.deadliftConfidenceRating || null,
      },
    },
  ];

  for (const { row } of lifts) {
    const { error } = await db.from('athlete_lift_profiles').upsert(row, { onConflict: 'profile_id,lift' });
    if (error) return { error: error.message };
  }

  // ── 6. athlete_lift_issues (delete + re-insert) ───────────────────────────
  await db.from('athlete_lift_issues').delete().eq('profile_id', uid);
  const issueRows = [
    ...data.squatIssues.map((issue) => ({ profile_id: uid, lift: 'squat', issue })),
    ...data.benchIssues.map((issue) => ({ profile_id: uid, lift: 'bench', issue })),
    ...data.deadliftIssues.map((issue) => ({ profile_id: uid, lift: 'deadlift', issue })),
  ];
  if (issueRows.length) {
    const { error } = await db.from('athlete_lift_issues').insert(issueRows);
    if (error) return { error: error.message };
  }

  // ── 7. athlete_injury_flags ───────────────────────────────────────────────
  const { error: injErr } = await db.from('athlete_injury_flags').upsert({
    profile_id: uid, affected_areas: data.affectedAreas,
    recent_injury: data.recentInjury || null, notes: data.injuryNotes || null,
  }, { onConflict: 'profile_id' });
  if (injErr) return { error: injErr.message };

  // ── 8. athlete_goals ──────────────────────────────────────────────────────
  const { error: goalErr } = await db.from('athlete_goals').upsert({
    profile_id: uid, primary_goal: data.primaryGoal || null,
    priority_ranking: data.priorityRanking, success_definition: data.successDefinition || null,
    target_total_kg: parseFloat(data.targetTotal) || null,
  }, { onConflict: 'profile_id' });
  if (goalErr) return { error: goalErr.message };

  // ── 9. athlete_preferences ────────────────────────────────────────────────
  const { error: prefErr } = await db.from('athlete_preferences').upsert({
    profile_id: uid, motivations: data.motivations, coach_expectations: data.coachExpectations,
    feedback_style: data.feedbackStyle, checkin_time: data.checkinTime || null,
  }, { onConflict: 'profile_id' });
  if (prefErr) return { error: prefErr.message };

  // ── 10. athlete_onboarding (mark complete) ────────────────────────────────
  const { error: obErr } = await db.from('athlete_onboarding').upsert({
    profile_id: uid, completed: true, completed_at: new Date().toISOString(), current_step: 10,
    step_personal: true, step_training: true, step_strength: true,
    step_squat: true, step_bench: true, step_deadlift: true,
    step_injuries: true, step_goals: true, step_plan: true,
  }, { onConflict: 'profile_id' });
  if (obErr) return { error: obErr.message };

  redirect('/');
}

export async function skipOnboardingAction(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('athlete_onboarding').upsert({
    profile_id: user.id,
    completed: false,
    current_step: 0,
  }, { onConflict: 'profile_id' });
  redirect('/');
}

export async function getOnboardingStatus(): Promise<{ completed: boolean; currentStep: number } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('athlete_onboarding')
    .select('completed, current_step')
    .eq('profile_id', user.id)
    .maybeSingle();
  if (!data) return { completed: false, currentStep: 0 };
  return { completed: data.completed, currentStep: data.current_step };
}

export async function saveOnboardingStepAction(currentStep: number): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('athlete_onboarding')
    .upsert({ profile_id: user.id, current_step: currentStep }, { onConflict: 'profile_id' });
}
