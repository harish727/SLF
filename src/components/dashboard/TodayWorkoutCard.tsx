import type { TodayWorkout } from '@/lib/db';
import Link from 'next/link';

export function TodayWorkoutCard({ workout }: { workout: TodayWorkout }) {
  const done = workout.completedCount;
  const total = workout.exercisesCount;
  const pct = Math.round((done / total) * 100);
  const isComplete = done === total;
  const isStarted = done > 0;

  return (
    <div className="relative bg-[#0A1628] border border-cyan-400/15 rounded-2xl p-5 overflow-hidden space-y-4">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/70 via-cyan-400/20 to-transparent" />

      <div>
        <p className="text-[9px] font-black text-cyan-400/70 tracking-[0.3em] uppercase">Today's Training</p>
        <h3 className="text-xl font-black text-white tracking-tight mt-1">{workout.title}</h3>
        <p className="text-slate-500 text-xs mt-0.5">{workout.category}</p>
      </div>

      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
          {total} exercises
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/30" />
          ~{workout.estimatedMinutes} min
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-[10px] text-slate-600 mb-1.5">
          <span>{done} / {total} completed</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {isComplete ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-400 font-black text-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Completed
          </div>
          <Link href="/train" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors font-semibold">
            View session →
          </Link>
        </div>
      ) : (
        <Link
          href="/train"
          className="block w-full h-11 bg-cyan-400 hover:bg-cyan-300 text-[#050B14] font-black text-sm tracking-widest uppercase rounded-xl transition-colors text-center leading-[44px]"
        >
          {isStarted ? 'Continue Workout' : 'Start Workout'}
        </Link>
      )}
    </div>
  );
}
