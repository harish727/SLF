import type { ProgressData } from '@/lib/db';
import { Card, SectionLabel, StatPill, MultiLineChart, BarChart } from './Charts';

const LIFT_COLORS = { squat: '#22D3EE', bench: '#818CF8', deadlift: '#34D399' };

export function OverviewTab({ d }: { d: ProgressData }) {
  const bw = d.bodyweight.current;

  return (
    <div className="space-y-4">

      {/* Total e1RM hero */}
      <Card accent>
        <div className="flex items-start justify-between">
          <div>
            <SectionLabel>Current Total e1RM</SectionLabel>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black text-white font-mono">{d.totalE1RM}</span>
              <span className="text-sm text-slate-500">kg</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-black px-3 py-1.5 rounded-full">
            ↑ {d.totalChange3m} kg / 3M
          </div>
        </div>

        {/* Three lifts */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {(['squat', 'bench', 'deadlift'] as const).map((lift) => (
            <div key={lift} className="text-center">
              <p className="text-[9px] font-black tracking-widest uppercase mb-1"
                style={{ color: LIFT_COLORS[lift] }}>{lift}</p>
              <p className="text-xl font-black text-white font-mono">{d[lift].current}</p>
              <p className="text-[9px] text-slate-600 mt-0.5">e1RM</p>
              <p className={`text-[10px] font-bold mt-0.5 ${d[lift].change3m >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {d[lift].change3m >= 0 ? '+' : ''}{d[lift].change3m} kg
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 3-month multi-lift trend */}
      <Card>
        <SectionLabel>Estimated 1RM Trend — 3 Months</SectionLabel>
        <MultiLineChart
          labels={d.multiLiftTrend.map((m) => m.month)}
          series={[
            { name: 'Squat',    color: LIFT_COLORS.squat,    values: d.multiLiftTrend.map((m) => m.squat) },
            { name: 'Bench',    color: LIFT_COLORS.bench,    values: d.multiLiftTrend.map((m) => m.bench) },
            { name: 'Deadlift', color: LIFT_COLORS.deadlift, values: d.multiLiftTrend.map((m) => m.deadlift) },
          ]}
          height={100}
        />
        <div className="flex gap-4 pt-1">
          {(['squat', 'bench', 'deadlift'] as const).map((lift) => (
            <div key={lift} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: LIFT_COLORS[lift] }} />
              <span className="text-[10px] text-slate-500 capitalize">{lift}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Strength-to-bodyweight */}
      <Card>
        <SectionLabel>Strength / Bodyweight ({bw} kg)</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Squat / BW',    value: `${d.strengthToBodyweight.squat}×` },
            { label: 'Bench / BW',    value: `${d.strengthToBodyweight.bench}×` },
            { label: 'Deadlift / BW', value: `${d.strengthToBodyweight.deadlift}×` },
            { label: 'Total / BW',    value: `${d.strengthToBodyweight.total}×`, highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
              <p className="text-[9px] text-slate-600 tracking-widest uppercase font-black">{label}</p>
              <p className={`text-lg font-black font-mono mt-0.5 ${highlight ? 'text-cyan-400' : 'text-white'}`}>{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Block comparison */}
      <Card>
        <SectionLabel>Block-to-Block Comparison</SectionLabel>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[9px] text-slate-600 tracking-widest uppercase">
                <th className="text-left pb-2 font-black">Block</th>
                <th className="text-right pb-2 font-black" style={{ color: LIFT_COLORS.squat }}>SQ</th>
                <th className="text-right pb-2 font-black" style={{ color: LIFT_COLORS.bench }}>BP</th>
                <th className="text-right pb-2 font-black" style={{ color: LIFT_COLORS.deadlift }}>DL</th>
                <th className="text-right pb-2 font-black text-slate-600">VOL</th>
                <th className="text-right pb-2 font-black text-slate-600">RPE</th>
              </tr>
            </thead>
            <tbody className="space-y-1">
              {d.blockComparison.map((b, i) => (
                <tr key={b.label} className={i === d.blockComparison.length - 1 ? 'text-white' : 'text-slate-500'}>
                  <td className="py-1.5 font-black text-[10px]">{b.label}</td>
                  <td className="text-right font-mono">{b.squat}</td>
                  <td className="text-right font-mono">{b.bench}</td>
                  <td className="text-right font-mono">{b.deadlift}</td>
                  <td className="text-right font-mono text-slate-600">{(b.volume / 1000).toFixed(1)}k</td>
                  <td className="text-right font-mono text-slate-600">{b.avgRpe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Next meet */}
      <Card accent>
        <div className="flex items-start justify-between">
          <div>
            <SectionLabel>Next Meet</SectionLabel>
            <p className="text-sm font-black text-white mt-1">{d.nextMeet.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{d.nextMeet.date}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-cyan-400 font-mono">{d.nextMeet.daysOut}</p>
            <p className="text-[9px] text-slate-600 tracking-widest uppercase">days out</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06]">
          <StatPill label="Current Total" value={`${d.nextMeet.currentTotal} kg`} />
          <StatPill label="Target Total"  value={`${d.nextMeet.targetTotal} kg`}
            sub={`+${d.nextMeet.targetTotal - d.nextMeet.currentTotal} kg needed`} />
        </div>
        <div>
          <SectionLabel>Projected Openers</SectionLabel>
          <div className="flex gap-3 mt-2">
            {(['squat', 'bench', 'deadlift'] as const).map((lift) => (
              <div key={lift} className="flex-1 text-center">
                <p className="text-[9px] text-slate-600 uppercase tracking-widest">{lift.slice(0, 2).toUpperCase()}</p>
                <p className="text-base font-black text-white font-mono mt-0.5">
                  {d.nextMeet.projectedOpeners[lift]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
