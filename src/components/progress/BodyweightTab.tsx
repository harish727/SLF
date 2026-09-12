import type { ProgressData } from '@/lib/db';
import { Card, SectionLabel, StatPill, LineChart } from './Charts';

export function BodyweightTab({ d }: { d: ProgressData }) {
  const bw = d.bodyweight;

  return (
    <div className="space-y-4">

      <Card accent>
        <div className="flex items-start justify-between">
          <div>
            <SectionLabel>Bodyweight</SectionLabel>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black text-white font-mono">{bw.current}</span>
              <span className="text-sm text-slate-500">kg</span>
            </div>
          </div>
          <div className={`text-xs font-black px-3 py-1.5 rounded-full border ${
            bw.change3m <= 0
              ? 'bg-green-400/10 border-green-400/20 text-green-400'
              : 'bg-red-400/10 border-red-400/20 text-red-400'
          }`}>
            {bw.change3m > 0 ? '+' : ''}{bw.change3m} kg / 3M
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatPill label="Relative Strength" value={`${bw.relativeStrength}×`}
            sub={`↑ ${bw.relativeChange}% / 3M`} up={true} />
          <StatPill label="3M Change" value={`${bw.change3m} kg`}
            sub="vs start" up={bw.change3m <= 0} />
        </div>
      </Card>

      <Card>
        <SectionLabel>Bodyweight Trend</SectionLabel>
        <LineChart
          data={bw.history.map((h) => ({ label: h.week, value: h.value }))}
          color="#818CF8"
          height={90}
        />
      </Card>

      {/* Strength efficiency */}
      <Card>
        <SectionLabel>Strength Efficiency (Total e1RM / BW)</SectionLabel>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-cyan-400 font-mono">{bw.relativeStrength}×</span>
        </div>
        <p className="text-xs text-slate-500">
          Getting stronger relative to bodyweight — even while losing weight.
        </p>
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
          <StatPill label="SQ / BW" value={`${(d.strengthToBodyweight.squat)}×`} />
          <StatPill label="BP / BW" value={`${(d.strengthToBodyweight.bench)}×`} />
          <StatPill label="DL / BW" value={`${(d.strengthToBodyweight.deadlift)}×`} />
        </div>
      </Card>
    </div>
  );
}
