'use client';
import { useState, useCallback, useEffect } from 'react';
import type { AthleteTrainingData, SetPrescription } from '@/lib/db';
import { BlockSelector, WeekSelector, DaySelector } from '@/components/train/SessionSelectors';
import { ExerciseCard } from '@/components/train/ExerciseCard';
import { useToast } from '@/components/ui/Toast';
import { SessionSummaryModal } from '@/components/train/SessionSummaryModal';
import type { SessionStats } from '@/components/train/SessionSummaryModal';

type SetsState = Record<number, SetPrescription[]>;

function buildSetsState(exercises: AthleteTrainingData['blocks'][0]['weeks'][0]['days'][0]['exercises']): SetsState {
  const state: SetsState = {};
  for (const ex of exercises) state[ex.id] = ex.sets.map((s) => ({ ...s }));
  return state;
}

// Epley e1RM formula
function calcE1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export function TrainShell({ data }: { data: AthleteTrainingData }) {
  const { toast } = useToast();
  const [activeBlockId, setActiveBlockId] = useState(data.activeBlockId);
  const block = data.blocks.find((b) => b.id === activeBlockId)!;

  const [activeWeek, setActiveWeek] = useState(block.currentWeek);
  const week = block.weeks.find((w) => w.weekNumber === activeWeek)!;
  const days = week?.days ?? [];

  const [activeDayId, setActiveDayId] = useState<string>(
    days.find((d) => d.id.includes('mon'))?.id ?? days[0]?.id ?? ''
  );

  const day = days.find((d) => d.id === activeDayId);
  const exercises = day?.exercises ?? [];

  const [setsState, setSetsState] = useState<SetsState>(() => buildSetsState(exercises));
  const [showCompletion, setShowCompletion] = useState(false);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    setSetsState(buildSetsState(day?.exercises ?? []));
  }, [activeDayId, activeWeek, activeBlockId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetComplete = useCallback((
    exerciseId: number, setIdx: number,
    weight: number, reps: number, rpe: number
  ) => {
    setSetsState((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((s, i) =>
        i === setIdx
          ? { ...s, completed: true, loggedWeight: weight, loggedReps: reps, loggedRpe: rpe }
          : s
      ),
    }));
    toast(`Set logged — ${weight} kg × ${reps} @ RPE ${rpe}`);
  }, [toast]);

  const totalSets     = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exercises.reduce((acc, ex) => {
    const exSets = setsState[ex.id] ?? ex.sets;
    return acc + exSets.filter((s) => s.completed).length;
  }, 0);
  const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  const sessionDone = totalSets > 0 && completedSets === totalSets;
  const canFinish = completedSets > 0;

  const completedExercises = exercises.filter((ex) => {
    const exSets = setsState[ex.id] ?? ex.sets;
    return exSets.every((s) => s.completed);
  }).length;

  // Compute completion stats
  const completionStats: SessionStats = (() => {
    let volume = 0; let rpeSum = 0; let rpeCount = 0;
    const liftNames = ['Back Squat', 'Bench Press', 'Deadlift', 'Front Squat', 'Overhead Press'];
    const liftMap: Record<string, { best: number; prev: string }> = {};

    for (const ex of exercises) {
      const exSets = setsState[ex.id] ?? ex.sets;
      let bestE1rm = 0;
      for (const s of exSets) {
        if (s.completed && s.loggedWeight && s.loggedReps) {
          volume += s.loggedWeight * s.loggedReps;
          if (s.loggedRpe) { rpeSum += s.loggedRpe; rpeCount++; }
          const e = calcE1RM(s.loggedWeight, s.loggedReps);
          if (e > bestE1rm) bestE1rm = e;
        }
      }
      if (liftNames.includes(ex.name) && bestE1rm > 0) {
        liftMap[ex.name] = { best: bestE1rm, prev: ex.previous };
      }
    }

    // Parse previous e1RM from "weight × reps" string
    function parsePrevE1rm(prev: string): number {
      const m = prev.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+)/);
      if (!m) return 0;
      return calcE1RM(parseFloat(m[1]), parseInt(m[2]));
    }

    const lifts = Object.entries(liftMap).map(([name, { best, prev }]) => ({
      name,
      e1rm: Math.round(best * 10) / 10,
      prevE1rm: Math.round(parsePrevE1rm(prev) * 10) / 10,
    }));

    return {
      sets: completedSets,
      volume,
      avgRpe: rpeCount ? rpeSum / rpeCount : 0,
      duration: Math.round((Date.now() - startTime) / 60000),
      exercises: completedExercises,
      blockName: block.name,
      weekNumber: activeWeek,
      dayLabel: day?.label ?? '',
      lifts,
      // Stub previous session data — replace with real stored data
      prevSets: 0,
      prevVolume: 0,
      prevAvgRpe: 0,
    };
  })();

  function handleWeekChange(n: number) {
    setActiveWeek(n);
    const newDays = block.weeks.find((w) => w.weekNumber === n)?.days ?? [];
    setActiveDayId(newDays[0]?.id ?? '');
  }

  return (
    <>
      {showCompletion && (
        <SessionSummaryModal
          stats={completionStats}
          blockName={block.name}
          weekNumber={activeWeek}
          onClose={() => setShowCompletion(false)}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-32 md:pb-12 space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Train</h1>
            {day && (
              <p className="text-[10px] text-slate-600 font-mono mt-1 tracking-widest uppercase">
                {block.name} · W{String(activeWeek).padStart(2, '0')} · {day.label}
              </p>
            )}
          </div>
          {exercises.length > 0 && (
            <div className="flex gap-1.5 items-center">
              {exercises.map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full transition-all ${
                  i < completedExercises ? 'bg-cyan-400' : 'bg-white/10'
                }`} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0A1628] border border-white/[0.07] rounded-2xl p-4 space-y-4">
          <BlockSelector blocks={data.blocks} activeId={activeBlockId} onChange={setActiveBlockId} />
          <WeekSelector weeks={block.weeks} activeWeek={activeWeek} currentWeek={block.currentWeek} onChange={handleWeekChange} />
          {days.length > 0 && (
            <DaySelector days={days} activeDayId={activeDayId} onChange={setActiveDayId} />
          )}
        </div>

        {exercises.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase">
                {day?.fullLabel} · {day?.focus}
              </p>
              <p className="text-[10px] text-slate-600 font-mono">
                {completedSets} / {totalSets} sets
              </p>
            </div>

            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <ExerciseCard
                  key={`${activeDayId}-${ex.id}`}
                  exercise={ex}
                  index={i}
                  sets={setsState[ex.id] ?? ex.sets}
                  onSetComplete={handleSetComplete}
                  defaultOpen={i === 0 && completedExercises === 0}
                />
              ))}
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-slate-600">{completedSets} of {totalSets} sets complete</span>
                <span className={`font-black transition-colors ${
                  pct === 100 ? 'text-green-400' : pct >= 50 ? 'text-cyan-400' : 'text-slate-500'
                }`}>{pct}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    pct === 100
                      ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]'
                      : 'bg-gradient-to-r from-cyan-400 to-cyan-400/70'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <button
                onClick={() => canFinish && setShowCompletion(true)}
                className={`w-full h-12 font-black text-sm tracking-widest uppercase rounded-xl transition-all duration-300 ${
                  sessionDone
                    ? 'bg-green-400 hover:bg-green-300 text-[#050B14] shadow-[0_0_20px_rgba(74,222,128,0.25)] cursor-pointer'
                    : canFinish
                      ? 'bg-white/[0.08] border border-white/[0.15] text-white hover:bg-white/[0.12] cursor-pointer'
                      : 'bg-white/[0.03] border border-white/[0.06] text-slate-600 cursor-default'
                }`}
              >
                {sessionDone ? '✓ Finish Session' : canFinish ? `Finish Session · ${pct}%` : 'Log a set to finish'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16 space-y-2">
            <p className="text-slate-600 text-sm">No session for this week.</p>
            <p className="text-slate-700 text-xs">Select a different week or day.</p>
          </div>
        )}
      </div>
    </>
  );
}
