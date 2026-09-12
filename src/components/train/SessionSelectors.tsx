'use client';
import type { TrainingBlock, TrainingWeek, TrainingDay } from '@/lib/db';

// ── Block selector ────────────────────────────────────────────────────────────

interface BlockSelectorProps {
  blocks: TrainingBlock[];
  activeId: string;
  onChange: (id: string) => void;
}

export function BlockSelector({ blocks, activeId, onChange }: BlockSelectorProps) {
  const active = blocks.find((b) => b.id === activeId)!;
  return (
    <div>
      <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase mb-1.5">Block</p>
      <div className="relative">
        <select
          value={activeId}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-[#0A1628] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-black text-white focus:outline-none focus:border-cyan-400/40 transition-colors pr-10"
        >
          {blocks.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="absolute left-0 bottom-0 h-px w-full bg-gradient-to-r from-cyan-400/30 to-transparent rounded-b-xl" />
      </div>
      <p className="text-[10px] text-slate-600 mt-1.5 font-mono">
        {active.phase} · Week {active.currentWeek} / {active.totalWeeks}
      </p>
    </div>
  );
}

// ── Week selector ─────────────────────────────────────────────────────────────

interface WeekSelectorProps {
  weeks: TrainingWeek[];
  activeWeek: number;
  currentWeek: number;
  onChange: (n: number) => void;
}

export function WeekSelector({ weeks, activeWeek, currentWeek, onChange }: WeekSelectorProps) {
  return (
    <div>
      <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase mb-1.5">Week</p>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {weeks.map((w) => {
          const isActive  = w.weekNumber === activeWeek;
          const isCurrent = w.weekNumber === currentWeek;
          const isPast    = w.completed;
          const isFuture  = w.weekNumber > currentWeek;
          return (
            <button
              key={w.weekNumber}
              onClick={() => onChange(w.weekNumber)}
              className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs font-black transition-all ${
                isActive
                  ? 'bg-cyan-400 text-[#050B14]'
                  : isCurrent
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                  : isPast
                  ? 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'
                  : 'bg-transparent text-slate-700 border border-white/[0.04]'
              }`}
            >
              {w.label}
              {isPast && !isActive && (
                <span className="text-[8px] mt-0.5 text-green-400">✓</span>
              )}
              {isCurrent && !isActive && (
                <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Day selector ──────────────────────────────────────────────────────────────

interface DaySelectorProps {
  days: TrainingDay[];
  activeDayId: string;
  onChange: (id: string) => void;
}

export function DaySelector({ days, activeDayId, onChange }: DaySelectorProps) {
  if (!days.length) {
    return (
      <div>
        <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase mb-1.5">Day</p>
        <p className="text-xs text-slate-600 italic">No sessions for this week.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase mb-1.5">Day</p>
      <div className="flex gap-2">
        {days.map((d) => {
          const isActive = d.id === activeDayId;
          return (
            <button
              key={d.id}
              onClick={() => onChange(d.id)}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-cyan-400 text-[#050B14]'
                  : 'bg-[#0A1628] border border-white/[0.07] text-slate-500 hover:text-slate-300 hover:border-white/[0.12]'
              }`}
            >
              <span className="text-xs font-black tracking-wider">{d.label}</span>
              <span className={`text-[9px] mt-0.5 font-medium truncate max-w-[56px] ${isActive ? 'text-[#050B14]/70' : 'text-slate-600'}`}>
                {d.focus}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
