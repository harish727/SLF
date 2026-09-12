import type { LiftProgressData } from '@/lib/db';
import { Card, SectionLabel, StatPill, LineChart, BarChart, IntensityDonut } from './Charts';

const ZONE_COLORS = ['#22D3EE', '#818CF8', '#F59E0B', '#EF4444'];

interface LiftTabProps {
  lift: string;
  color: string;
  data: LiftProgressData;
  bodyweight: number;
}

export function LiftTab({ lift, color, data, bodyweight }: LiftTabProps) {
  const bwRatio = (data.current / bodyweight).toFixed(2);

  return (
    <div className="space-y-4">

      {/* Hero KPIs */}
      <Card accent>
        <div className="flex items-start justify-between">
          <div>
            <SectionLabel>{lift} — Current e1RM</SectionLabel>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black text-white font-mono">{data.current}</span>
              <span className="text-sm text-slate-500">kg</span>
            </div>
            <p className="text-[10px] font-mono mt-1" style={{ color }}>
              {bwRatio}× bodyweight
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className={`text-xs font-black px-3 py-1.5 rounded-full border ${
              data.change3m >= 0
                ? 'bg-green-400/10 border-green-400/20 text-green-400'
                : 'bg-red-400/10 border-red-400/20 text-red-400'
            }`}>
              {data.change3m >= 0 ? '↑' : '↓'} {Math.abs(data.change3m)} kg / 3M
            </div>
            <p className="text-[9px] text-slate-600 font-mono">+{data.changePct}%</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/[0.06]">
          <StatPill label="Meet PR"     value={`${data.meetPR} kg`} />
          <StatPill label="Training PR" value={`${data.trainingPR} kg`} />
          <StatPill label="Last Session" value={`${data.lastSession} kg`} />
        </div>
      </Card>

      {/* e1RM progression */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionLabel>e1RM Progression</SectionLabel>
          <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color }}>
            +{data.weeklyTrend} kg/wk
          </div>
        </div>
        <LineChart
          data={data.e1rmHistory.map((h) => ({ label: h.week, value: h.value }))}
          color={color}
          height={90}
        />
        <div className="grid grid-cols-3 gap-2">
          <StatPill label="Trend"       value={`+${data.weeklyTrend} kg`} sub="per week" up={true} />
          <StatPill label="Consistency" value={`${data.consistency}%`} />
          <StatPill label="Hard Sets"   value={`${data.hardSets}`} sub={`MRV ~${data.estimatedMRV}`} />
        </div>
      </Card>

      {/* Volume vs e1RM */}
      <Card>
        <SectionLabel>Volume vs Strength Response</SectionLabel>
        <div className="space-y-3">
          {/* Volume bars */}
          <div>
            <p className="text-[9px] text-slate-600 mb-2">Weekly Volume (kg)</p>
            <BarChart
              data={data.volumeHistory.map((h) => ({ label: h.week, value: h.volume }))}
              color={color}
              height={64}
            />
          </div>
          {/* e1RM line overlay */}
          <div>
            <p className="text-[9px] text-slate-600 mb-2">e1RM Response</p>
            <LineChart
              data={data.volumeHistory.map((h) => ({ label: h.week, value: h.e1rm }))}
              color={color}
              height={64}
              fillOpacity={0.06}
            />
          </div>
        </div>
      </Card>

      {/* Intensity distribution */}
      <Card>
        <SectionLabel>Intensity Distribution</SectionLabel>
        <IntensityDonut
          zones={data.intensityZones.map((z, i) => ({ ...z, color: ZONE_COLORS[i] }))}
        />
      </Card>

      {/* Recoverability */}
      <Card>
        <SectionLabel>Estimated Recoverability</SectionLabel>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Current: {data.hardSets} hard sets</span>
            <span>Ceiling: ~{data.estimatedMRV} sets</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (data.hardSets / data.estimatedMRV) * 100)}%`,
                background: data.hardSets / data.estimatedMRV > 0.85 ? '#F59E0B' : color,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-600">
            {data.hardSets / data.estimatedMRV > 0.85
              ? '⚠ Approaching estimated recoverability ceiling'
              : '✓ Within estimated recoverable range'}
          </p>
        </div>
      </Card>
    </div>
  );
}
