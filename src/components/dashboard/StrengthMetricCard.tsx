import type { StrengthMetric, BodyweightData } from '@/lib/db';

interface StrengthCardProps {
  label: string;
  metric: StrengthMetric;
  accent?: boolean;
}

export function StrengthMetricCard({ label, metric, accent }: StrengthCardProps) {
  const up = metric.change3m >= 0;
  return (
    <div className={`relative bg-[#0A1628] border rounded-2xl p-4 overflow-hidden ${accent ? 'border-cyan-400/20' : 'border-white/[0.07]'}`}>
      {accent && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/70 via-cyan-400/20 to-transparent" />
      )}
      <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-white font-mono">{metric.current}</span>
        <span className="text-xs text-slate-500 font-medium">kg</span>
      </div>
      <p className="text-[9px] text-slate-600 tracking-widest uppercase mt-0.5">Estimated 1RM</p>
      <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${up ? 'text-green-400' : 'text-red-400'}`}>
        <span>{up ? '↑' : '↓'}</span>
        <span>{Math.abs(metric.change3m)} kg</span>
        <span className="text-slate-600 font-normal text-[10px]">/ 3 months</span>
      </div>
    </div>
  );
}

export function BodyweightCard({ bw }: { bw: BodyweightData }) {
  const up = bw.change3m >= 0;
  const goalPct = Math.min(100, Math.round(((bw.start - bw.current) / (bw.start - bw.goal)) * 100));

  return (
    <div className="relative bg-[#0A1628] border border-white/[0.07] rounded-2xl p-4 overflow-hidden">
      <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase mb-2">Bodyweight</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-white font-mono">{bw.current}</span>
        <span className="text-xs text-slate-500 font-medium">kg</span>
      </div>
      <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${up ? 'text-red-400' : 'text-green-400'}`}>
        <span>{up ? '↑' : '↓'}</span>
        <span>{Math.abs(bw.change3m)} kg</span>
        <span className="text-slate-600 font-normal text-[10px]">/ 3 months</span>
      </div>
      {/* Goal progress */}
      <div className="mt-3">
        <div className="flex justify-between text-[9px] text-slate-600 mb-1">
          <span>Goal: {bw.goal} kg</span>
          <span>{goalPct}%</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400/60 rounded-full transition-all"
            style={{ width: `${goalPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
