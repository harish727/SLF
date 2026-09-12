import { getSession } from '@/lib/auth/session';
import { getDashboardByUserId } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getOnboardingStatus } from '@/lib/auth/onboarding';

import { DashboardHeader }     from '@/components/dashboard/DashboardHeader';
import { StrengthMetricCard, BodyweightCard } from '@/components/dashboard/StrengthMetricCard';
import { Estimated1RMChart, BodyweightChart } from '@/components/dashboard/PerformanceCharts';
import { MeetPRCard }          from '@/components/dashboard/MeetPRCard';
import { TodayWorkoutCard }    from '@/components/dashboard/TodayWorkoutCard';
import { TrainingStatusCard, CurrentBlockCard } from '@/components/dashboard/TrainingCards';
import { CoachNoteCard }       from '@/components/dashboard/CoachNoteCard';
import { OnboardingBanner }    from '@/components/dashboard/OnboardingBanner';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [data, onboarding] = await Promise.all([
    Promise.resolve(getDashboardByUserId(session.userId)!),
    getOnboardingStatus(),
  ]);

  const showBanner = !onboarding?.completed;

  const { athlete, strength, bodyweight, meetPerformance, todayWorkout, trainingStatus, currentBlock, coachNote } = data;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-5 pt-6 pb-28 md:pb-10">

      {/* ── Header ─────────────────────────────────────────────── */}
      <DashboardHeader athlete={athlete} />

      {/* ── Onboarding banner (shown until profile is complete) ── */}
      {showBanner && <OnboardingBanner currentStep={onboarding?.currentStep ?? 0} />}

      {/* ── Strength KPI cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StrengthMetricCard label="Squat"    metric={strength.squat}    accent />
        <StrengthMetricCard label="Bench"    metric={strength.bench} />
        <StrengthMetricCard label="Deadlift" metric={strength.deadlift} />
        <BodyweightCard bw={bodyweight} />
      </div>

      {/* ── Performance trend charts ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Estimated1RMChart
          squat={strength.squat}
          bench={strength.bench}
          deadlift={strength.deadlift}
        />
        <BodyweightChart bw={bodyweight} />
      </div>

      {/* ── Meet PR + Today's workout ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MeetPRCard meet={meetPerformance} />
        <TodayWorkoutCard workout={todayWorkout} />
      </div>

      {/* ── Block + Training status ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CurrentBlockCard block={currentBlock} />
        <TrainingStatusCard status={trainingStatus} />
      </div>

      {/* ── Coach note ──────────────────────────────────────────── */}
      <CoachNoteCard note={coachNote} />

    </div>
  );
}
