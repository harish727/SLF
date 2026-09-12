'use client';
import { useState, useRef } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LiftE1RM {
  name: string;
  e1rm: number;
  prevE1rm: number; // 0 = no previous
}

export interface SessionStats {
  sets: number;
  volume: number;       // kg
  avgRpe: number;
  duration: number;     // minutes
  exercises: number;
  blockName: string;
  weekNumber: number;
  dayLabel: string;
  lifts: LiftE1RM[];    // top lifts with e1RM
  // previous session for comparison
  prevSets: number;
  prevVolume: number;
  prevAvgRpe: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, dec = 1) { return n.toFixed(dec); }
function tonnage(kg: number) { return (kg / 1000).toFixed(2); }
function delta(curr: number, prev: number) {
  if (!prev) return null;
  const d = curr - prev;
  return { d, sign: d > 0 ? '↑' : d < 0 ? '↓' : '→', pos: d >= 0 };
}

const FEELINGS = [
  { emoji: '😫', label: 'Tough' },
  { emoji: '😐', label: 'OK' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '🔥', label: 'Fire' },
];

// ── Share card templates ──────────────────────────────────────────────────────

type Template = 'minimal' | 'performance' | 'photo';

function MinimalCard({ stats, date }: { stats: SessionStats; date: string }) {
  const topE1rm = stats.lifts.reduce((best, l) => l.e1rm > best ? l.e1rm : best, 0);
  return (
    <div className="bg-[#050B14] rounded-2xl p-8 space-y-6 text-center select-none" style={{ fontFamily: 'monospace' }}>
      <div className="space-y-1">
        <p className="text-[9px] tracking-[0.4em] text-slate-500 uppercase">Strength Lab by Fluffy</p>
        <p className="text-[9px] tracking-[0.3em] text-cyan-400 uppercase">SLF</p>
      </div>
      <div className="space-y-1">
        <p className="text-[9px] tracking-[0.3em] text-green-400 uppercase">Session Complete ✓</p>
        <p className="text-4xl font-black text-white">{fmt(topE1rm, 1)} KG</p>
        <p className="text-[9px] tracking-[0.3em] text-slate-500 uppercase">e1RM</p>
      </div>
      <div className="border-t border-white/10 pt-4 space-y-2">
        <p className="text-2xl font-black text-white">{tonnage(stats.volume)} T</p>
        <p className="text-[9px] tracking-[0.3em] text-slate-500 uppercase">Total Tonnage</p>
      </div>
      <div className="flex justify-center gap-8">
        <div>
          <p className="text-lg font-black text-white">{stats.sets}</p>
          <p className="text-[9px] tracking-widest text-slate-600 uppercase">Sets</p>
        </div>
        <div>
          <p className="text-lg font-black text-white">{fmt(stats.avgRpe)}</p>
          <p className="text-[9px] tracking-widest text-slate-600 uppercase">Avg RPE</p>
        </div>
      </div>
      <div className="border-t border-white/10 pt-4 space-y-1">
        <p className="text-[9px] tracking-[0.25em] text-slate-500 uppercase">{stats.blockName}</p>
        <p className="text-[9px] tracking-[0.25em] text-slate-600 uppercase">Week {String(stats.weekNumber).padStart(2, '0')}</p>
        <p className="text-[9px] tracking-[0.25em] text-slate-700 uppercase">{date}</p>
      </div>
    </div>
  );
}

function PerformanceCard({ stats, date }: { stats: SessionStats; date: string }) {
  const total = stats.lifts.reduce((s, l) => s + l.e1rm, 0);
  return (
    <div className="bg-[#050B14] rounded-2xl p-8 space-y-5 select-none" style={{ fontFamily: 'monospace' }}>
      <div className="flex items-center justify-between">
        <p className="text-[9px] tracking-[0.3em] text-cyan-400 uppercase">SLF Performance Report</p>
        <p className="text-[9px] tracking-widest text-slate-600 uppercase">{date}</p>
      </div>
      <div className="border-t border-white/10 pt-4 space-y-2">
        {stats.lifts.map((l) => (
          <div key={l.name} className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase w-8">{l.name.slice(0, 2).toUpperCase()}</span>
            <span className="flex-1 border-b border-dotted border-white/10 mx-3" />
            <span className="text-sm font-black text-white">{fmt(l.e1rm, 1)}</span>
          </div>
        ))}
        {total > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-[10px] text-slate-400 uppercase">Total</span>
            <span className="flex-1 border-b border-dotted border-white/10 mx-3" />
            <span className="text-sm font-black text-cyan-400">{fmt(total, 1)}</span>
          </div>
        )}
      </div>
      <div className="border-t border-white/10 pt-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-base font-black text-white">{tonnage(stats.volume)}T</p>
          <p className="text-[8px] tracking-widest text-slate-600 uppercase">Volume</p>
        </div>
        <div>
          <p className="text-base font-black text-white">{stats.sets}</p>
          <p className="text-[8px] tracking-widest text-slate-600 uppercase">Sets</p>
        </div>
        <div>
          <p className="text-base font-black text-white">{fmt(stats.avgRpe)}</p>
          <p className="text-[8px] tracking-widest text-slate-600 uppercase">RPE</p>
        </div>
      </div>
      <div className="border-t border-white/10 pt-3 flex items-center justify-between">
        <p className="text-[9px] tracking-[0.25em] text-slate-600 uppercase">{stats.blockName} · W{String(stats.weekNumber).padStart(2, '0')}</p>
        <p className="text-[9px] tracking-[0.3em] text-cyan-400 uppercase">SLF</p>
      </div>
    </div>
  );
}

function PhotoCard({ stats, date, photoUrl }: { stats: SessionStats; date: string; photoUrl: string | null }) {
  const topE1rm = stats.lifts.reduce((best, l) => l.e1rm > best ? l.e1rm : best, 0);
  return (
    <div className="relative rounded-2xl overflow-hidden select-none aspect-[9/16] max-h-[420px]">
      {/* Background */}
      {photoUrl ? (
        <img src={photoUrl} alt="Session" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#050B14] to-[#0D1F35]" />
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3" style={{ fontFamily: 'monospace' }}>
        <p className="text-[9px] tracking-[0.3em] text-green-400 uppercase">Session Complete ✓</p>
        <div>
          <p className="text-3xl font-black text-white leading-none">{fmt(topE1rm, 1)} KG</p>
          <p className="text-[9px] tracking-[0.25em] text-slate-400 uppercase mt-1">e1RM</p>
        </div>
        <div className="flex gap-4">
          <div>
            <p className="text-base font-black text-white">{tonnage(stats.volume)} T</p>
            <p className="text-[8px] tracking-widest text-slate-500 uppercase">Tonnage</p>
          </div>
          <div>
            <p className="text-base font-black text-white">{stats.sets}</p>
            <p className="text-[8px] tracking-widest text-slate-500 uppercase">Hard Sets</p>
          </div>
        </div>
        <div className="border-t border-white/20 pt-3 flex items-center justify-between">
          <p className="text-[9px] tracking-[0.2em] text-slate-500 uppercase">{stats.blockName} · W{String(stats.weekNumber).padStart(2, '0')}</p>
          <p className="text-[9px] tracking-[0.3em] text-cyan-400 uppercase">SLF</p>
        </div>
      </div>
      {/* Top brand */}
      <div className="absolute top-4 right-4">
        <p className="text-[9px] tracking-[0.3em] text-white/40 uppercase" style={{ fontFamily: 'monospace' }}>SLF</p>
      </div>
    </div>
  );
}

// ── Share card screen ─────────────────────────────────────────────────────────

function ShareCardScreen({ stats, date, photoUrl, onBack }: {
  stats: SessionStats; date: string; photoUrl: string | null; onBack: () => void;
}) {
  const [template, setTemplate] = useState<Template>(photoUrl ? 'photo' : 'minimal');

  const templates: { id: Template; label: string }[] = [
    { id: 'minimal', label: 'Minimal' },
    { id: 'performance', label: 'Performance' },
    { id: 'photo', label: 'Photo' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase">Session Card</p>
      </div>

      {/* Template picker */}
      <div className="flex gap-2">
        {templates.map((t) => (
          <button key={t.id} onClick={() => setTemplate(t.id)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-all ${
              template === t.id
                ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400'
                : 'bg-white/[0.04] border-white/[0.06] text-slate-500 hover:text-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Card preview */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.08]">
        {template === 'minimal'     && <MinimalCard stats={stats} date={date} />}
        {template === 'performance' && <PerformanceCard stats={stats} date={date} />}
        {template === 'photo'       && <PhotoCard stats={stats} date={date} photoUrl={photoUrl} />}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="h-11 bg-white/[0.06] border border-white/[0.1] text-white font-black text-xs tracking-widest uppercase rounded-xl hover:bg-white/[0.1] transition-colors">
          Save Image
        </button>
        <button className="h-11 bg-cyan-400 hover:bg-cyan-300 text-[#050B14] font-black text-xs tracking-widest uppercase rounded-xl transition-colors">
          Share
        </button>
      </div>
    </div>
  );
}

// ── Main summary modal ────────────────────────────────────────────────────────

export function SessionSummaryModal({ stats, blockName, weekNumber, onClose }: {
  stats: SessionStats;
  blockName: string;
  weekNumber: number;
  onClose: () => void;
}) {
  const [feeling, setFeeling] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoUrl(URL.createObjectURL(file));
  }

  const topE1rm = stats.lifts.reduce((best, l) => l.e1rm > best ? l.e1rm : best, 0);
  const tonnageVal = stats.volume / 1000;

  const date = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  }).toUpperCase();

  // Highlights: new e1RM bests
  const highlights = stats.lifts.filter((l) => l.prevE1rm > 0 && l.e1rm > l.prevE1rm);

  function handleSubmit() {
    setSubmitted(true);
    if (!showCard) setTimeout(onClose, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0A1628] border border-white/[0.1] rounded-2xl p-6 space-y-6 max-h-[92vh] overflow-y-auto">

        {showCard ? (
          <ShareCardScreen stats={stats} date={date} photoUrl={photoUrl} onBack={() => setShowCard(false)} />
        ) : (
          <>
            {/* ── Header ── */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] font-black text-green-400 tracking-[0.3em] uppercase">Session Complete</p>
                <p className="text-[9px] text-slate-600 font-mono mt-1 tracking-widest">{date}</p>
              </div>
              {topE1rm > 0 && (
                <div>
                  <p className="text-4xl font-black text-white font-mono">{fmt(topE1rm, 1)} KG</p>
                  <p className="text-[9px] text-slate-500 tracking-[0.3em] uppercase mt-1">Session e1RM</p>
                </div>
              )}
            </div>

            {/* ── Primary stats ── */}
            <div className="border-t border-white/[0.06] pt-5 grid grid-cols-2 gap-3">
              {[
                { label: 'Total Volume',  value: `${(stats.volume).toLocaleString()} kg` },
                { label: 'Tonnage',       value: `${tonnage(stats.volume)} t` },
                { label: 'Hard Sets',     value: String(stats.sets) },
                { label: 'Avg RPE',       value: fmt(stats.avgRpe) },
                { label: 'Exercises',     value: String(stats.exercises) },
                { label: 'Duration',      value: `${stats.duration} min` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/[0.03] rounded-xl p-3">
                  <p className="text-base font-black text-white font-mono">{value}</p>
                  <p className="text-[9px] text-slate-600 tracking-widest uppercase mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* ── Lift e1RMs ── */}
            {stats.lifts.length > 0 && (
              <div className="border-t border-white/[0.06] pt-4 space-y-2">
                <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase">Performance</p>
                {stats.lifts.map((l) => {
                  const d = delta(l.e1rm, l.prevE1rm);
                  return (
                    <div key={l.name} className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-slate-400 font-mono">{l.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white font-mono">{fmt(l.e1rm, 1)} kg</span>
                        {d && (
                          <span className={`text-[10px] font-black ${d.pos ? 'text-green-400' : 'text-red-400'}`}>
                            {d.sign}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Highlights ── */}
            {highlights.length > 0 && (
              <div className="border-t border-white/[0.06] pt-4 space-y-2">
                <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase">Today's Highlights</p>
                {highlights.map((l) => (
                  <div key={l.name} className="flex items-center gap-2 bg-green-400/5 border border-green-400/10 rounded-xl px-3 py-2">
                    <span className="text-sm">🔥</span>
                    <div>
                      <p className="text-xs font-black text-white">{l.name} — {fmt(l.e1rm, 1)} kg</p>
                      <p className="text-[9px] text-green-400 tracking-wide">New training e1RM</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── vs Last session ── */}
            {stats.prevSets > 0 && (
              <div className="border-t border-white/[0.06] pt-4 space-y-2">
                <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase">vs Last Session</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Volume', curr: tonnageVal, prev: stats.prevVolume / 1000, unit: 't', dec: 2 },
                    { label: 'Avg RPE', curr: stats.avgRpe, prev: stats.prevAvgRpe, unit: '', dec: 1 },
                    { label: 'Sets', curr: stats.sets, prev: stats.prevSets, unit: '', dec: 0 },
                  ].map(({ label, curr, prev, unit, dec }) => {
                    const d = delta(curr, prev);
                    return (
                      <div key={label} className="bg-white/[0.03] rounded-xl p-3 text-center">
                        <p className="text-sm font-black text-white font-mono">{curr.toFixed(dec)}{unit}</p>
                        {d && (
                          <p className={`text-[9px] font-black mt-0.5 ${d.pos ? 'text-green-400' : 'text-slate-500'}`}>
                            {d.sign} {Math.abs(d.d).toFixed(dec)}{unit}
                          </p>
                        )}
                        <p className="text-[8px] text-slate-600 tracking-widest uppercase mt-1">{label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Block context ── */}
            <div className="border-t border-white/[0.06] pt-4 text-center space-y-1">
              <p className="text-[9px] text-slate-600 tracking-[0.25em] uppercase">{blockName}</p>
              <p className="text-[9px] text-slate-700 tracking-[0.25em] uppercase">Week {String(weekNumber).padStart(2, '0')}</p>
            </div>

            {/* ── Photo + Create card ── */}
            <div className="border-t border-white/[0.06] pt-4 space-y-3">
              <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase">Session Card</p>
              <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
              <button onClick={() => photoInputRef.current?.click()}
                className={`w-full h-11 rounded-xl border text-[10px] font-black tracking-widest uppercase transition-all ${
                  photoUrl
                    ? 'bg-green-400/10 border-green-400/30 text-green-400'
                    : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
                }`}>
                {photoUrl ? '✓ Photo Added — Tap to Change' : '📸 Add Session Photo (Optional)'}
              </button>
              <button onClick={() => setShowCard(true)}
                className="w-full h-12 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-white font-black text-sm tracking-widest uppercase rounded-xl transition-all">
                Create Session Card →
              </button>
            </div>

            {/* ── Session feeling ── */}
            <div className="border-t border-white/[0.06] pt-4 space-y-3">
              <p className="text-[9px] font-black text-slate-600 tracking-[0.25em] uppercase">How did this session feel?</p>
              <div className="flex gap-2">
                {FEELINGS.map((f, i) => (
                  <button key={i} onClick={() => setFeeling(i)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                      feeling === i
                        ? 'bg-cyan-400/10 border-cyan-400/30'
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                    }`}>
                    <span className="text-xl">{f.emoji}</span>
                    <span className="text-[8px] font-bold text-slate-500 tracking-wide">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSubmit}
              className={`w-full h-12 font-black text-sm tracking-widest uppercase rounded-xl transition-all ${
                submitted
                  ? 'bg-green-400 text-[#050B14]'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-[#050B14]'
              }`}>
              {submitted ? '✓ Saved' : 'Done'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
