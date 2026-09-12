'use client';
import { useState, useCallback, useRef } from 'react';
import type { Exercise, SetPrescription } from '@/lib/db';

// ── RPE helpers ───────────────────────────────────────────────────────────────

function rpeBg(rpe: number): string {
  if (rpe <= 6) return 'bg-green-400/10 border-green-400/20 text-green-400';
  if (rpe === 7) return 'bg-lime-400/10 border-lime-400/20 text-lime-400';
  if (rpe === 8) return 'bg-amber-400/10 border-amber-400/20 text-amber-400';
  return 'bg-red-400/10 border-red-400/20 text-red-400';
}

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({ value, onChange, step = 2.5, min = 0 }: {
  value: number; onChange: (v: number) => void; step?: number; min?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(min, value - step))}
        className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.1] transition-all flex items-center justify-center font-black text-lg leading-none">−</button>
      <span className="text-base font-black text-white font-mono w-14 text-center">{value}</span>
      <button onClick={() => onChange(value + step)}
        className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.1] transition-all flex items-center justify-center font-black text-lg leading-none">+</button>
    </div>
  );
}

// ── RPE selector ──────────────────────────────────────────────────────────────

function RPESelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[4, 5, 6, 7, 8, 9].map((r) => (
        <button key={r} onClick={() => onChange(r)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-all ${value === r ? rpeBg(r) : 'bg-white/[0.04] border-white/[0.06] text-slate-600 hover:text-slate-400'}`}>
          {r}
        </button>
      ))}
    </div>
  );
}

// ── Upload video button ──────────────────────────────────────────────────────

function UploadVideoButton({ setNumber }: { setNumber: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setUploaded(true);
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="video/*" capture="environment"
        className="hidden" onChange={handleChange} />
      <button onClick={() => inputRef.current?.click()}
        title="Upload video"
        className={`h-11 px-3 rounded-xl border font-black text-xs tracking-widest uppercase transition-all active:scale-[0.98] flex items-center gap-1.5 ${
          uploaded
            ? 'bg-green-400/10 border-green-400/30 text-green-400'
            : 'bg-white/[0.06] border-white/[0.1] text-slate-400 hover:text-white hover:bg-white/[0.1]'
        }`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
        {uploaded ? '✓' : 'Video'}
      </button>
    </>
  );
}

// ── Set row ───────────────────────────────────────────────────────────────────

interface SetRowProps {
  set: SetPrescription;
  isActive: boolean;
  onComplete: (weight: number, reps: number, rpe: number) => void;
}

function SetRow({ set, isActive, onComplete }: SetRowProps) {
  const [weight, setWeight] = useState(set.loggedWeight ?? set.weight);
  const [reps,   setReps]   = useState(set.loggedReps   ?? set.reps);
  const [rpe,    setRpe]    = useState(set.loggedRpe    ?? set.rpe);

  if (set.completed) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] opacity-60">
        <span className="w-6 text-xs font-black text-slate-600 text-center">{set.setNumber}</span>
        <span className="flex-1 text-sm font-mono text-slate-400">{set.loggedWeight} kg · {set.loggedReps} reps</span>
        <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${rpeBg(set.loggedRpe ?? set.rpe)}`}>{set.loggedRpe ?? set.rpe}</span>
        <span className="text-green-400 text-sm">✓</span>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl opacity-40">
        <span className="w-6 text-xs font-black text-slate-600 text-center">{set.setNumber}</span>
        <span className="flex-1 text-sm font-mono text-slate-600">
          {set.weight > 0 ? `${set.weight} kg` : '—'} · {set.reps > 0 ? `${set.reps} reps` : '—'}
        </span>
        <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${rpeBg(set.rpe)}`}>{set.rpe}</span>
        <span className="w-5 h-5 rounded-full border border-white/10" />
      </div>
    );
  }

  return (
    <div className="bg-[#0D1F35] border border-cyan-400/20 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black text-cyan-400/70 tracking-[0.3em] uppercase">Set {set.setNumber}</span>
        <span className="text-[10px] text-slate-600 font-mono">
          Prescribed: {set.weight > 0 ? `${set.weight} kg` : '—'} × {set.reps > 0 ? set.reps : '—'} @ {set.rpe}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[9px] text-slate-600 tracking-widest uppercase mb-2">Weight (kg)</p>
          <Stepper value={weight} onChange={setWeight} step={2.5} />
        </div>
        <div>
          <p className="text-[9px] text-slate-600 tracking-widest uppercase mb-2">Reps</p>
          <Stepper value={reps} onChange={setReps} step={1} min={1} />
        </div>
      </div>
      <div>
        <p className="text-[9px] text-slate-600 tracking-widest uppercase mb-2">RPE</p>
        <RPESelector value={rpe} onChange={setRpe} />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onComplete(weight, reps, rpe)}
          className="flex-1 h-11 bg-cyan-400 hover:bg-cyan-300 text-[#050B14] font-black text-sm tracking-widest uppercase rounded-xl transition-colors active:scale-[0.98]">
          Done — Set {set.setNumber}
        </button>
        <UploadVideoButton setNumber={set.setNumber} />
      </div>
    </div>
  );
}

// ── Exercise card ─────────────────────────────────────────────────────────────

export interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  sets: SetPrescription[];                                    // lifted state from parent
  onSetComplete: (exerciseId: number, setIdx: number, weight: number, reps: number, rpe: number) => void;
  defaultOpen?: boolean;
}

export function ExerciseCard({ exercise, index, sets, onSetComplete, defaultOpen = false }: ExerciseCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  const completedCount = sets.filter((s) => s.completed).length;
  const totalCount     = sets.length;
  const allDone        = completedCount === totalCount;
  const activeSetIdx   = sets.findIndex((s) => !s.completed);

  const handleComplete = useCallback((setIdx: number, weight: number, reps: number, rpe: number) => {
    onSetComplete(exercise.id, setIdx, weight, reps, rpe);
  }, [exercise.id, onSetComplete]);

  const firstSet = exercise.sets[0];
  const prescription = firstSet.reps > 0
    ? `${totalCount} × ${firstSet.reps}${firstSet.rpe ? ` @ RPE ${firstSet.rpe}` : ''}`
    : firstSet.rpe ? `${totalCount} sets @ RPE ${firstSet.rpe}` : `${totalCount} sets`;

  return (
    <div className={`rounded-2xl border transition-all ${
      allDone ? 'bg-white/[0.02] border-white/[0.04] opacity-60'
      : open   ? 'bg-[#0A1628] border-white/[0.1]'
               : 'bg-[#0A1628] border-white/[0.07] hover:border-white/[0.12]'
    }`}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 p-4 text-left">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
          allDone ? 'bg-green-400/10 text-green-400' : 'bg-white/[0.06] text-slate-500'
        }`}>
          {allDone ? '✓' : String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`font-black text-sm tracking-wide ${allDone ? 'text-slate-500 line-through' : 'text-white'}`}>
            {exercise.name}
          </p>
          {!open && <p className="text-[10px] text-slate-600 font-mono mt-0.5">{prescription}</p>}
        </div>
        {!allDone && totalCount > 1 && (
          <div className="flex gap-1 shrink-0">
            {sets.map((s, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${
                s.completed ? 'bg-cyan-400' : i === activeSetIdx ? 'bg-cyan-400/40 animate-pulse' : 'bg-white/10'
              }`} />
            ))}
          </div>
        )}
        <svg className={`w-4 h-4 text-slate-600 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-sm font-black text-white font-mono">{prescription}</span>
            <span className="text-[10px] text-slate-600 font-mono">Last: {exercise.previous}</span>
          </div>
          <div className="space-y-1.5">
            {sets.map((s, i) => (
              <SetRow key={i} set={s} isActive={i === activeSetIdx}
                onComplete={(w, r, rpe) => handleComplete(i, w, r, rpe)} />
            ))}
          </div>
          {(exercise.tempo || exercise.note) && (
            <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
              {exercise.tempo && (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-600 tracking-[0.25em] uppercase w-12">Tempo</span>
                  <span className="text-xs font-mono text-slate-400">{exercise.tempo}</span>
                </div>
              )}
              {exercise.note && (
                <div className="flex items-start gap-2">
                  <span className="text-[9px] font-black text-slate-600 tracking-[0.25em] uppercase w-12 mt-0.5">Note</span>
                  <span className="text-xs text-slate-500 leading-relaxed">{exercise.note}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
