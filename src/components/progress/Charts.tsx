// Shared pure-SVG chart primitives — no dependencies

interface Point { label: string; value: number; }

// ── Line chart ────────────────────────────────────────────────────────────────

interface LineChartProps {
  data: Point[];
  color?: string;
  height?: number;
  showDots?: boolean;
  showLabels?: boolean;
  fillOpacity?: number;
}

export function LineChart({
  data, color = '#22D3EE', height = 80,
  showDots = true, showLabels = true, fillOpacity = 0.12,
}: LineChartProps) {
  if (data.length < 2) return null;
  const W = 300; const H = height; const padX = 4; const padY = 8;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals); const max = Math.max(...vals);
  const range = max - min || 1;

  const pts = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * (W - padX * 2),
    y: H - padY - ((d.value - min) / range) * (H - padY * 2 - 16),
    ...d,
  }));

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
  const gradId = `lg-${color.replace('#', '')}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity * 2} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y}
          r={i === pts.length - 1 ? 3.5 : 2}
          fill={color} opacity={i === pts.length - 1 ? 1 : 0.5} />
      ))}
      {showLabels && pts.map((p, i) => (
        <text key={i} x={p.x} y={H - 1} textAnchor="middle"
          fontSize="7" fill="#475569" fontFamily="monospace">{p.label}</text>
      ))}
    </svg>
  );
}

// ── Multi-line chart ──────────────────────────────────────────────────────────

interface MultiLineChartProps {
  labels: string[];
  series: { name: string; color: string; values: number[] }[];
  height?: number;
}

export function MultiLineChart({ labels, series, height = 100 }: MultiLineChartProps) {
  const W = 300; const H = height; const padX = 4; const padY = 8;
  const allVals = series.flatMap((s) => s.values);
  const min = Math.min(...allVals); const max = Math.max(...allVals);
  const range = max - min || 1;

  function toX(i: number) { return padX + (i / (labels.length - 1)) * (W - padX * 2); }
  function toY(v: number) { return H - padY - ((v - min) / range) * (H - padY * 2 - 12); }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      {series.map((s) => {
        const pts = s.values.map((v, i) => ({ x: toX(i), y: toY(v) }));
        const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
        return (
          <g key={s.name}>
            <path d={line} fill="none" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 3 : 1.5} fill={s.color} opacity={i === pts.length - 1 ? 1 : 0.6} />
            ))}
          </g>
        );
      })}
      {labels.map((l, i) => (
        <text key={i} x={toX(i)} y={H - 1} textAnchor="middle" fontSize="7" fill="#475569" fontFamily="monospace">{l}</text>
      ))}
    </svg>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────

interface BarChartProps {
  data: Point[];
  color?: string;
  height?: number;
  highlightLast?: boolean;
}

export function BarChart({ data, color = '#22D3EE', height = 80, highlightLast = true }: BarChartProps) {
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals); const max = Math.max(...vals);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => {
        const pct = ((d.value - min) / range) * 70 + 20;
        const isLast = highlightLast && i === data.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
            <span className="text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color }}>
              {d.value}
            </span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${pct}%`,
                background: isLast ? color : `${color}33`,
                boxShadow: isLast ? `0 0 8px ${color}44` : 'none',
              }}
            />
            <span className="text-[9px] font-mono text-slate-600">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Intensity donut ───────────────────────────────────────────────────────────

interface DonutProps {
  zones: { zone: string; sets: number; color: string }[];
}

export function IntensityDonut({ zones }: DonutProps) {
  const total = zones.reduce((a, z) => a + z.sets, 0);
  const R = 36; const cx = 50; const cy = 50; const stroke = 14;
  let offset = 0;
  const circ = 2 * Math.PI * R;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#ffffff08" strokeWidth={stroke} />
        {zones.map((z, i) => {
          const pct = z.sets / total;
          const dash = pct * circ;
          const gap  = circ - dash;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={R} fill="none"
              stroke={z.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circ}
              strokeLinecap="butt"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          );
          offset += pct;
          return el;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="900" fill="white" fontFamily="monospace">{total}</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="6" fill="#64748b" fontFamily="monospace">SETS</text>
      </svg>
      <div className="space-y-1.5 flex-1">
        {zones.map((z) => (
          <div key={z.zone} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: z.color }} />
              <span className="text-[10px] text-slate-500 font-mono">{z.zone}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(z.sets / total) * 100}%`, background: z.color }} />
              </div>
              <span className="text-[10px] font-black text-slate-400 w-6 text-right">{Math.round((z.sets / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

export function StatPill({ label, value, sub, up }: { label: string; value: string; sub?: string; up?: boolean }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 space-y-0.5">
      <p className="text-[9px] font-black text-slate-600 tracking-[0.25em] uppercase">{label}</p>
      <p className="text-lg font-black text-white font-mono leading-none">{value}</p>
      {sub !== undefined && (
        <p className={`text-[10px] font-bold ${up === true ? 'text-green-400' : up === false ? 'text-red-400' : 'text-slate-500'}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase">{children}</p>;
}

// ── Card wrapper ──────────────────────────────────────────────────────────────

export function Card({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`relative bg-[#0A1628] rounded-2xl p-5 space-y-4 overflow-hidden ${accent ? 'border border-cyan-400/15' : 'border border-white/[0.07]'}`}>
      {accent && <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/60 via-cyan-400/20 to-transparent" />}
      {children}
    </div>
  );
}
