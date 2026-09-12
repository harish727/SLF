import type { MeetPerformance } from '@/lib/db';

export function MeetPRCard({ meet }: { meet: MeetPerformance }) {
  const lifts = [
    { label: 'Squat',     value: meet.squat },
    { label: 'Bench',     value: meet.bench },
    { label: 'Deadlift',  value: meet.deadlift },
  ];

  return (
    <div className="bg-[#0A1628] border border-white/[0.07] rounded-2xl p-5 space-y-4">
      <div>
        <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase">Meet Performance</p>
        <p className="text-[10px] text-slate-600 mt-1 truncate">{meet.competition}</p>
      </div>

      <div className="space-y-2">
        {lifts.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">{label}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white font-mono">{value}</span>
              <span className="text-xs text-slate-600">kg</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-slate-600 tracking-widest uppercase">Total</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-cyan-400 font-mono">{meet.total}</span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-600 tracking-widest uppercase">Date</p>
          <p className="text-xs font-mono text-slate-400 mt-0.5">{meet.date}</p>
        </div>
      </div>
    </div>
  );
}
