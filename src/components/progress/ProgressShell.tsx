'use client';
import { useState } from 'react';
import type { ProgressData } from '@/lib/db';
import { OverviewTab }    from '@/components/progress/OverviewTab';
import { LiftTab }        from '@/components/progress/LiftTab';
import { BodyweightTab }  from '@/components/progress/BodyweightTab';

type Tab = 'overview' | 'squat' | 'bench' | 'deadlift' | 'bodyweight';
type Period = '3M' | '6M' | '1Y' | 'ALL';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',   label: 'Overview'   },
  { id: 'squat',      label: 'Squat'      },
  { id: 'bench',      label: 'Bench'      },
  { id: 'deadlift',   label: 'Deadlift'   },
  { id: 'bodyweight', label: 'Bodyweight' },
];

const LIFT_COLORS: Record<string, string> = {
  squat: '#22D3EE', bench: '#818CF8', deadlift: '#34D399',
};

export function ProgressShell({ data }: { data: ProgressData }) {
  const [tab, setTab]       = useState<Tab>('overview');
  const [period, setPeriod] = useState<Period>('3M');

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-28 md:pb-10 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Progress</h1>
          <p className="text-[10px] text-slate-600 font-mono mt-1 tracking-widest uppercase">
            Strength Analytics
          </p>
        </div>
        {/* Period selector */}
        <div className="flex gap-1">
          {(['3M', '6M', '1Y', 'ALL'] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-colors ${
                period === p
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                  : 'text-slate-600 hover:text-slate-400'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tab nav — horizontal scroll */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black tracking-wide transition-all ${
              tab === id
                ? id === 'overview' || id === 'bodyweight'
                  ? 'bg-cyan-400 text-[#050B14]'
                  : 'text-[#050B14]'
                : 'bg-[#0A1628] border border-white/[0.07] text-slate-500 hover:text-slate-300'
            }`}
            style={tab === id && id !== 'overview' && id !== 'bodyweight'
              ? { background: LIFT_COLORS[id] }
              : undefined
            }>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview'   && <OverviewTab d={data} />}
      {tab === 'squat'      && <LiftTab lift="Squat"    color={LIFT_COLORS.squat}    data={data.squat}    bodyweight={data.bodyweight.current} />}
      {tab === 'bench'      && <LiftTab lift="Bench"    color={LIFT_COLORS.bench}    data={data.bench}    bodyweight={data.bodyweight.current} />}
      {tab === 'deadlift'   && <LiftTab lift="Deadlift" color={LIFT_COLORS.deadlift} data={data.deadlift} bodyweight={data.bodyweight.current} />}
      {tab === 'bodyweight' && <BodyweightTab d={data} />}
    </div>
  );
}
