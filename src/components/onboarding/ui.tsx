'use client';

interface OptionBtnProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function OptionBtn({ label, selected, onClick, className = '' }: OptionBtnProps) {
  return (
    <button type="button" onClick={onClick}
      className={`h-11 rounded-xl border text-sm font-semibold transition-all ${
        selected
          ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400'
          : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-white/20'
      } ${className}`}>
      {label}
    </button>
  );
}

interface ChipProps { label: string; selected: boolean; onClick: () => void; }

export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all text-left ${
        selected
          ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400'
          : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-white/20'
      }`}>
      {label}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black text-slate-500 tracking-[0.25em] uppercase">{label}</label>
      {children}
    </div>
  );
}

export const inputCls =
  'w-full h-12 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 transition-colors';

export function ConfidenceSlider({ value, onChange, lowLabel = 'Not confident', highLabel = 'Very confident' }: {
  value: number; onChange: (v: number) => void; lowLabel?: string; highLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`flex-1 h-10 rounded-xl border text-sm font-black transition-all ${
              value === n
                ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-500 hover:border-white/20'
            }`}>{n}</button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-slate-600 font-semibold">
        <span>{lowLabel}</span><span>{highLabel}</span>
      </div>
    </div>
  );
}

export function StepHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h2 className="text-xl font-black text-white tracking-tight">{title}</h2>
      <p className="text-slate-500 text-sm mt-1">{sub}</p>
    </div>
  );
}

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-2 mb-8">
      <div className="flex justify-between text-[10px] font-black text-slate-600 tracking-widest uppercase">
        <span>Step {current} of {total}</span><span>{pct}%</span>
      </div>
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StepNav({ onBack, onNext, nextLabel = 'Continue', loading, isFirst }: {
  onBack?: () => void; onNext?: () => void; nextLabel?: string; loading?: boolean; isFirst?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-4">
      {!isFirst && (
        <button type="button" onClick={onBack}
          className="flex-1 h-12 bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08] text-white font-black text-sm tracking-widest uppercase rounded-xl transition-colors">
          Back
        </button>
      )}
      <button type="button" onClick={onNext} disabled={loading}
        className="flex-1 h-12 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-[#050B14] font-black text-sm tracking-widest uppercase rounded-xl transition-colors flex items-center justify-center gap-2">
        {loading ? (
          <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>Saving...</>
        ) : nextLabel}
      </button>
    </div>
  );
}
