'use client';
import { useState } from 'react';
import type { StrengthMetric, BodyweightData } from '@/lib/db';

type Period = '3M' | '6M' | 'ALL';

function MiniChart({ data, color = '#22D3EE' }: { data: { date: string; value: number }[]; color?: string }) {
  if (!data.length) return null;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const W = 300;
  const H = 80;
  const pad = 8;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((d.value - min) / range) * (H - pad * 2);
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 3.5 : 2} fill={color}
          opacity={i === points.length - 1 ? 1 : 0.4} />
      ))}
    </svg>
  );
}

type Exercise = 'squat' | 'bench' | 'deadlift';

interface Props {
  squat: StrengthMetric;
  bench: StrengthMetric;
  deadlift: StrengthMetric;
}

export function Estimated1RMChart({ squat, bench, deadlift }: Props) {
  const [exercise, setExercise] = useState<Exercise>('squat');
  const [period, setPeriod] = useState<Period>('3M');

  const map: Record<Exercise, StrengthMetric> = { squat, bench, deadlift };
  const current = map[exercise];

  return (
    <div className="bg-[#0A1628] border border-white/[0.07] rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase">Estimated 1RM</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white font-mono">{current.current}</span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
        </div>
        {/* Period selector */}
        <div className="flex gap-1">
          {(['3M', '6M', 'ALL'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                period === p ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise selector */}
      <div className="flex gap-1.5">
        {(['squat', 'bench', 'deadlift'] as Exercise[]).map((ex) => (
          <button
            key={ex}
            onClick={() => setExercise(ex)}
            className={`flex-1 text-[10px] font-black tracking-widest uppercase py-1.5 rounded-lg transition-colors ${
              exercise === ex
                ? 'bg-cyan-400 text-[#050B14]'
                : 'bg-white/[0.04] text-slate-500 hover:text-slate-300 border border-white/[0.06]'
            }`}
          >
            {ex}
          </button>
        ))}
      </div>

      <MiniChart data={current.history} color="#22D3EE" />

      {/* Min / Max labels */}
      <div className="flex justify-between text-[10px] font-mono text-slate-600">
        <span>{current.history[0]?.date}</span>
        <span>{current.history[current.history.length - 1]?.date}</span>
      </div>
    </div>
  );
}

export function BodyweightChart({ bw }: { bw: BodyweightData }) {
  const [period, setPeriod] = useState<Period>('3M');

  return (
    <div className="bg-[#0A1628] border border-white/[0.07] rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase">Bodyweight</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white font-mono">{bw.current}</span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
        </div>
        <div className="flex gap-1">
          {(['3M', '6M', 'ALL'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                period === p ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <MiniChart data={bw.history} color="#818CF8" />

      <div className="flex justify-between text-[10px] font-mono text-slate-600">
        <span>{bw.history[0]?.date}</span>
        <span>{bw.history[bw.history.length - 1]?.date}</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/[0.06]">
        {[
          { label: 'Start',  value: `${bw.start} kg` },
          { label: 'Change', value: `${bw.change3m > 0 ? '+' : ''}${bw.change3m} kg`, color: bw.change3m < 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Goal',   value: `${bw.goal} kg` },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <p className="text-[9px] text-slate-600 tracking-widest uppercase">{label}</p>
            <p className={`text-xs font-black font-mono mt-0.5 ${color ?? 'text-white'}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
