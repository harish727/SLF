import type { TrainingStatus, CurrentBlock } from '@/lib/db';

const recoveryColor: Record<string, string> = {
  Good:     'text-green-400',
  Moderate: 'text-amber-400',
  Poor:     'text-red-400',
};

const fatigueColor: Record<string, string> = {
  Low:      'text-green-400',
  Moderate: 'text-amber-400',
  High:     'text-red-400',
};

export function TrainingStatusCard({ status }: { status: TrainingStatus }) {
  const stats = [
    { label: 'Load',       value: `${status.load}%`,        color: 'text-white' },
    { label: 'Avg RPE',    value: `${status.rpe}`,           color: 'text-white' },
    { label: 'Adherence',  value: `${status.adherence}%`,   color: 'text-cyan-400' },
    { label: 'Recovery',   value: status.recovery,           color: recoveryColor[status.recovery] },
    { label: 'Fatigue',    value: status.fatigue,            color: fatigueColor[status.fatigue] },
  ];

  return (
    <div className="bg-[#0A1628] border border-white/[0.07] rounded-2xl p-5">
      <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase mb-4">Training Status</p>
      <div className="grid grid-cols-5 gap-2">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <p className={`text-base font-black font-mono ${color}`}>{value}</p>
            <p className="text-[9px] text-slate-600 tracking-widest uppercase mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CurrentBlockCard({ block }: { block: CurrentBlock }) {
  const pct = Math.round((block.week / block.totalWeeks) * 100);

  return (
    <div className="bg-[#0A1628] border border-white/[0.07] rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase">Current Block</p>
          <p className="text-sm font-black text-white mt-1">{block.name}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-600 tracking-widest uppercase">Phase</p>
          <p className="text-xs font-black text-cyan-400 mt-0.5">{block.phase}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[10px] text-slate-600 mb-1.5">
          <span>Week {block.week} of {block.totalWeeks}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-cyan-400/60 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="text-[10px] text-slate-600">
        Next: <span className="text-slate-400 font-semibold">{block.nextPhase}</span>
      </p>
    </div>
  );
}
