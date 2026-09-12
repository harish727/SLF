// Auto-generated from supabase/migrations/001_core_schema.sql
// Re-generate with: npx supabase gen types typescript --local > src/lib/supabase/types.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ── Enums ─────────────────────────────────────────────────────────────────────

export type UserRole        = 'athlete' | 'coach' | 'admin';
export type UserStatus      = 'active' | 'suspended' | 'deleted';
export type UnitsPref       = 'kg' | 'lbs';
export type CoachRelStatus  = 'active' | 'paused' | 'ended';
export type ExerciseCategory = 'competition' | 'variation' | 'accessory' | 'mobility' | 'conditioning' | 'warmup';
export type MovementPattern = 'squat' | 'hinge' | 'press' | 'pull' | 'carry' | 'other';
export type EquipmentType   = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'kettlebell' | 'band' | 'other';
export type ProgramStatus   = 'draft' | 'active' | 'completed' | 'archived';
export type BlockType       = 'accumulation' | 'strength' | 'intensification' | 'peak' | 'deload' | 'test';
export type WeekStatus      = 'upcoming' | 'active' | 'completed' | 'skipped';
export type DayStatus       = 'upcoming' | 'active' | 'completed' | 'skipped' | 'rest';
export type SetType         = 'warmup' | 'working' | 'backoff' | 'top_set' | 'amrap' | 'dropset';
export type SessionStatus   = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

// ── Row types ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string | null;
  avatar_path: string | null;
  phone: string | null;
  date_of_birth: string | null;
  timezone: string;
  units: UnitsPref;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface AthleteProfile {
  id: string;
  profile_id: string;
  training_age_years: number | null;
  sport: string | null;
  competition_level: string | null;
  federation: string | null;
  current_weight_class: string | null;
  preferred_training_days: string[] | null;
  training_frequency: number | null;
  gym_name: string | null;
  height_cm: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachAthlete {
  id: string;
  coach_id: string;
  athlete_id: string;
  status: CoachRelStatus;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  category: ExerciseCategory;
  movement_pattern: MovementPattern;
  equipment: EquipmentType;
  is_competition_lift: boolean;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  athlete_id: string;
  coach_id: string | null;
  name: string;
  description: string | null;
  status: ProgramStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingBlock {
  id: string;
  program_id: string;
  name: string;
  description: string | null;
  block_type: BlockType;
  sequence: number;
  start_date: string | null;
  end_date: string | null;
  status: ProgramStatus;
  created_at: string;
  updated_at: string;
}

export interface TrainingWeek {
  id: string;
  block_id: string;
  week_number: number;
  label: string | null;
  start_date: string | null;
  end_date: string | null;
  status: WeekStatus;
  created_at: string;
  updated_at: string;
}

export interface TrainingDay {
  id: string;
  week_id: string;
  day_number: number;
  scheduled_date: string | null;
  day_name: string | null;
  title: string | null;
  focus: string | null;
  status: DayStatus;
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: string;
  training_day_id: string;
  name: string | null;
  instructions: string | null;
  estimated_duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sequence: number;
  tempo: string | null;
  rest_seconds: number | null;
  notes: string | null;
  is_optional: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  set_type: SetType;
  prescribed_weight_kg: number | null;
  prescribed_reps: number | null;
  target_rpe: number | null;
  percentage_1rm: number | null;
  tempo: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingSession {
  id: string;
  athlete_id: string;
  workout_id: string;
  started_at: string | null;
  completed_at: string | null;
  status: SessionStatus;
  duration_seconds: number | null;
  session_rpe: number | null;
  athlete_feedback: string | null;
  feeling: number | null;
  created_at: string;
  updated_at: string;
}

export interface PerformedSet {
  id: string;
  session_id: string;
  workout_set_id: string | null;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe: number | null;
  e1rm_kg: number | null;        // computed by DB trigger
  is_pr: boolean;
  is_e1rm_best: boolean;
  completed: boolean;
  performed_at: string;
  created_at: string;
}

export interface SessionSummary {
  id: string;
  session_id: string;
  athlete_id: string;
  total_sets: number;
  completed_sets: number;
  total_reps: number;
  total_volume_kg: number;
  avg_rpe: number | null;
  duration_seconds: number | null;
  squat_e1rm_kg: number | null;
  bench_e1rm_kg: number | null;
  deadlift_e1rm_kg: number | null;
  total_e1rm_kg: number | null;
  prev_total_e1rm_kg: number | null;
  e1rm_change_kg: number | null;
  prev_volume_kg: number | null;
  volume_change_kg: number | null;
  created_at: string;
}

export interface BodyweightLog {
  id: string;
  athlete_id: string;
  recorded_at: string;
  weight_kg: number;
  source: string;
  notes: string | null;
  created_at: string;
}

// ── Onboarding row types ──────────────────────────────────────────────────────

export type CompetitionLevel = 'none' | 'trained_not_competed' | 'local' | 'state' | 'national' | 'international';
export type LiftKey = 'squat' | 'bench' | 'deadlift';
export type PlanTier = 'member' | 'pro' | 'elite';
export type SessionDuration = 'under_45' | '45_60' | '60_90' | '90_120' | '120_plus';
export type TrainingConsistency = 'very_consistent' | 'mostly_consistent' | 'sometimes_inconsistent' | 'frequently_interrupted';
export type GymType = 'commercial' | 'powerlifting_gym' | 'home_gym' | 'sports_facility' | 'other';

export interface AthletePowerliftingProfile {
  id: string; profile_id: string;
  competition_level: CompetitionLevel; federation: string | null; weight_class: string | null;
  gym_type: GymType | null; gym_name: string | null; equipment_available: string[] | null;
  days_per_week: number | null; preferred_days: string[] | null;
  session_duration: SessionDuration | null; consistency: TrainingConsistency | null;
  next_meet_name: string | null; next_meet_date: string | null; next_meet_importance: number | null;
  selected_plan: PlanTier; created_at: string; updated_at: string;
}

export interface AthleteLiftProfile {
  id: string; profile_id: string; lift: LiftKey;
  current_1rm_kg: number | null; estimated_1rm_kg: number | null;
  rm_reps: number | null; rm_weight_kg: number | null; rm_rpe: number | null;
  strength_confidence: string | null;
  style: string | null; stance: string | null; grip: string | null;
  bar_position: string | null; footwear: string | null; arch: string | null;
  touch_style: string | null; build_description: string | null;
  confidence_rating: number | null; created_at: string; updated_at: string;
}

export interface AthleteLiftIssue {
  id: string; profile_id: string; lift: LiftKey; issue: string; created_at: string;
}

export interface AthleteInjuryFlag {
  id: string; profile_id: string;
  affected_areas: string[] | null; recent_injury: string | null; notes: string | null;
  created_at: string; updated_at: string;
}

export interface AthleteGoal {
  id: string; profile_id: string;
  primary_goal: string | null; priority_ranking: string[] | null;
  success_definition: string | null; target_total_kg: number | null;
  created_at: string; updated_at: string;
}

export interface AthletePreference {
  id: string; profile_id: string;
  motivations: string[] | null; coach_expectations: string[] | null;
  feedback_style: string[] | null; checkin_time: string | null;
  created_at: string; updated_at: string;
}

export interface AthleteOnboarding {
  id: string; profile_id: string; version: number; current_step: number; completed: boolean;
  completed_at: string | null;
  step_personal: boolean; step_training: boolean; step_strength: boolean;
  step_squat: boolean; step_bench: boolean; step_deadlift: boolean;
  step_injuries: boolean; step_goals: boolean; step_plan: boolean;
  created_at: string; updated_at: string;
}

// ── Database interface (for Supabase client generic) ──────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles:                        { Row: Profile;                      Insert: Omit<Profile, 'created_at' | 'updated_at'>;                           Update: Partial<Omit<Profile, 'id'>> };
      athlete_profiles:                { Row: AthleteProfile;               Insert: Omit<AthleteProfile, 'id' | 'created_at' | 'updated_at'>;              Update: Partial<Omit<AthleteProfile, 'id'>> };
      athlete_powerlifting_profiles:   { Row: AthletePowerliftingProfile;   Insert: Omit<AthletePowerliftingProfile, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<AthletePowerliftingProfile, 'id'>> };
      athlete_lift_profiles:           { Row: AthleteLiftProfile;           Insert: Omit<AthleteLiftProfile, 'id' | 'created_at' | 'updated_at'>;          Update: Partial<Omit<AthleteLiftProfile, 'id'>> };
      athlete_lift_issues:             { Row: AthleteLiftIssue;             Insert: Omit<AthleteLiftIssue, 'id' | 'created_at'>;                           Update: Partial<Omit<AthleteLiftIssue, 'id'>> };
      athlete_injury_flags:            { Row: AthleteInjuryFlag;            Insert: Omit<AthleteInjuryFlag, 'id' | 'created_at' | 'updated_at'>;           Update: Partial<Omit<AthleteInjuryFlag, 'id'>> };
      athlete_goals:                   { Row: AthleteGoal;                  Insert: Omit<AthleteGoal, 'id' | 'created_at' | 'updated_at'>;                 Update: Partial<Omit<AthleteGoal, 'id'>> };
      athlete_preferences:             { Row: AthletePreference;            Insert: Omit<AthletePreference, 'id' | 'created_at' | 'updated_at'>;           Update: Partial<Omit<AthletePreference, 'id'>> };
      athlete_onboarding:              { Row: AthleteOnboarding;            Insert: Omit<AthleteOnboarding, 'id' | 'created_at' | 'updated_at'>;           Update: Partial<Omit<AthleteOnboarding, 'id'>> };
      coach_athletes:                  { Row: CoachAthlete;                 Insert: Omit<CoachAthlete, 'id' | 'created_at' | 'updated_at'>;                Update: Partial<Omit<CoachAthlete, 'id'>> };
      exercises:                       { Row: Exercise;                     Insert: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>;                    Update: Partial<Omit<Exercise, 'id'>> };
      programs:                        { Row: Program;                      Insert: Omit<Program, 'id' | 'created_at' | 'updated_at'>;                     Update: Partial<Omit<Program, 'id'>> };
      training_blocks:                 { Row: TrainingBlock;                Insert: Omit<TrainingBlock, 'id' | 'created_at' | 'updated_at'>;               Update: Partial<Omit<TrainingBlock, 'id'>> };
      training_weeks:                  { Row: TrainingWeek;                 Insert: Omit<TrainingWeek, 'id' | 'created_at' | 'updated_at'>;                Update: Partial<Omit<TrainingWeek, 'id'>> };
      training_days:                   { Row: TrainingDay;                  Insert: Omit<TrainingDay, 'id' | 'created_at' | 'updated_at'>;                 Update: Partial<Omit<TrainingDay, 'id'>> };
      workouts:                        { Row: Workout;                      Insert: Omit<Workout, 'id' | 'created_at' | 'updated_at'>;                     Update: Partial<Omit<Workout, 'id'>> };
      workout_exercises:               { Row: WorkoutExercise;              Insert: Omit<WorkoutExercise, 'id' | 'created_at' | 'updated_at'>;             Update: Partial<Omit<WorkoutExercise, 'id'>> };
      workout_sets:                    { Row: WorkoutSet;                   Insert: Omit<WorkoutSet, 'id' | 'created_at' | 'updated_at'>;                  Update: Partial<Omit<WorkoutSet, 'id'>> };
      training_sessions:               { Row: TrainingSession;              Insert: Omit<TrainingSession, 'id' | 'created_at' | 'updated_at'>;             Update: Partial<Omit<TrainingSession, 'id'>> };
      performed_sets:                  { Row: PerformedSet;                 Insert: Omit<PerformedSet, 'id' | 'e1rm_kg' | 'created_at'>;                   Update: Partial<Omit<PerformedSet, 'id'>> };
      session_summaries:               { Row: SessionSummary;               Insert: Omit<SessionSummary, 'id' | 'created_at'>;                             Update: Partial<Omit<SessionSummary, 'id'>> };
      bodyweight_logs:                 { Row: BodyweightLog;                Insert: Omit<BodyweightLog, 'id' | 'created_at'>;                              Update: Partial<Omit<BodyweightLog, 'id'>> };
    };
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      units_pref: UnitsPref;
      coach_rel_status: CoachRelStatus;
      exercise_category: ExerciseCategory;
      movement_pattern: MovementPattern;
      equipment_type: EquipmentType;
      program_status: ProgramStatus;
      block_type: BlockType;
      week_status: WeekStatus;
      day_status: DayStatus;
      set_type: SetType;
      session_status: SessionStatus;
      competition_level: CompetitionLevel;
      lift_key: LiftKey;
      plan_tier: PlanTier;
      session_duration: SessionDuration;
      training_consistency: TrainingConsistency;
      gym_type: GymType;
    };
  };
}
