'use client';
import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type FeedbackStatus = 'NEW' | 'REVIEWED' | 'ACTION REQUIRED';

interface VideoFeedback {
  id: number;
  exercise: string;
  session: string;
  status: FeedbackStatus;
  preview: string;
  comments: number;
  time: string;
}

interface WeeklyReview {
  week: string;
  available: boolean;
  summary: string;
  lifts: { name: string; strength: '↑' | '→' | '↓'; technique: '↑' | '→' | '↓'; fatigue: '↑' | '→' | '↓' }[];
  notes: { well: string[]; attention: string[]; next: string[] };
}

interface BlockReview {
  block: string;
  phase: string;
  weeks: number;
  start: { sq: number; bp: number; dl: number };
  end: { sq: number; bp: number; dl: number };
  ratings: { label: string; value: number }[];
  conclusion: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const videoFeedback: VideoFeedback[] = [
  { id: 1, exercise: 'Back Squat', session: '11 Sep', status: 'NEW', preview: 'Your depth and control have improved significantly. Upper-back position is much better than last block.', comments: 3, time: '2h ago' },
  { id: 2, exercise: 'Bench Press', session: '10 Sep', status: 'ACTION REQUIRED', preview: 'Setup needs work. Retract scapula harder before unracking.', comments: 2, time: '1d ago' },
  { id: 3, exercise: 'Deadlift', session: '8 Sep', status: 'REVIEWED', preview: 'Good bar path. Hips rising slightly early — cue: push the floor away.', comments: 1, time: '3d ago' },
];

const weeklyReview: WeeklyReview = {
  week: 'WEEK 06',
  available: true,
  summary: 'Strong week. Volume was completed with good RPE control. Squat quality improved.',
  lifts: [
    { name: 'SQUAT',     strength: '↑', technique: '↑', fatigue: '→' },
    { name: 'BENCH',     strength: '↑', technique: '→', fatigue: '→' },
    { name: 'DEADLIFT',  strength: '↑', technique: '↑', fatigue: '↓' },
  ],
  notes: {
    well:      ['Squat technique improved', 'Better RPE accuracy', 'Consistent training attendance'],
    attention: ['Bench setup', 'Deadlift fatigue', 'Sleep consistency'],
    next:      ['Maintain squat volume', 'Increase bench intensity', 'Reduce deadlift accessories'],
  },
};

const blockReview: BlockReview = {
  block: 'BLOCK 03',
  phase: 'STRENGTH / INTENSIFICATION',
  weeks: 6,
  start: { sq: 177.5, bp: 122.5, dl: 210 },
  end:   { sq: 185,   bp: 125,   dl: 220 },
  ratings: [
    { label: 'Strength',  value: 8 },
    { label: 'Technique', value: 9 },
    { label: 'Fatigue',   value: 6 },
    { label: 'Recovery',  value: 7 },
  ],
  conclusion: 'This block produced a good strength response, particularly in squat and deadlift. Volume tolerance was good until Week 5, where fatigue started to accumulate. Next block will reduce deadlift volume while maintaining intensity.',
};

const messages = [
  { id: 1, text: 'How is your recovery after the last deadlift session?', from: 'Coach', time: 'Today 10:42', isCoach: true },
  { id: 2, text: 'Much better. Sleep has been around 7–8 hours.', from: 'You', time: 'Today 10:45', isCoach: false },
  { id: 3, text: 'Good. Keep the same schedule this week.', from: 'Coach', time: 'Today 10:47', isCoach: true },
];

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const styles: Record<FeedbackStatus, string> = {
    'NEW':             'bg-cyan-400/10 border-cyan-400/30 text-cyan-400',
    'REVIEWED':        'bg-white/[0.04] border-white/[0.08] text-slate-500',
    'ACTION REQUIRED': 'bg-amber-400/10 border-amber-400/30 text-amber-400',
  };
  return (
    <span className={`text-[9px] font-black tracking-[0.2em] px-2 py-0.5 rounded-lg border ${styles[status]}`}>
      {status}
    </span>
  );
}

// ── Bar rating ────────────────────────────────────────────────────────────────

function BarRating({ label, value }: { label: string; value: number }) {
  const color = value >= 8 ? 'bg-cyan-400' : value >= 6 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">{label}</span>
        <span className="text-[10px] font-mono text-slate-500">{value}/10</span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}

// ── Lift delta ────────────────────────────────────────────────────────────────

function LiftDelta({ name, before, after }: { name: string; before: number; after: number }) {
  const delta = after - before;
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-xs font-black text-slate-400 w-8">{name}</span>
      <div className="flex items-center gap-3 font-mono text-xs">
        <span className="text-slate-600">{before}</span>
        <span className="text-slate-700">→</span>
        <span className="text-white font-black">{after}</span>
        <span className="text-cyan-400 text-[10px]">+{delta}</span>
      </div>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = ['Feedback', 'Weekly Review', 'Block Review', 'Messages'] as const;
type Tab = typeof TABS[number];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CoachFeedbackPage() {
  const [tab, setTab] = useState<Tab>('Feedback');
  const [msg, setMsg] = useState('');

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-5 pt-6">

      {/* Header */}
      <header>
        <h1 className="text-2xl font-black text-white tracking-tight">Coach Feedback</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.25em] mt-1.5">
          Your coaching environment
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all ${
              tab === t ? 'bg-cyan-400 text-[#050B14]' : 'text-slate-500 hover:text-slate-300'
            }`}>
            {t === 'Weekly Review' ? 'Weekly' : t === 'Block Review' ? 'Block' : t}
          </button>
        ))}
      </div>

      {/* ── Video Feedback ── */}
      {tab === 'Feedback' && (
        <div className="space-y-3">
          {videoFeedback.map((item) => (
            <div key={item.id} className={`relative bg-[#0A1628] rounded-2xl p-5 border transition-all ${
              item.status === 'NEW' ? 'border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.05)]' :
              item.status === 'ACTION REQUIRED' ? 'border-amber-400/20' : 'border-white/[0.07]'
            }`}>
              {item.status === 'NEW' && (
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/60 via-cyan-400/20 to-transparent rounded-t-2xl" />
              )}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-black text-white text-sm">{item.exercise}</p>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">Session · {item.session}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🎥</span>
                <span className="text-[10px] text-slate-500 font-mono">{item.comments} coach comment{item.comments !== 1 ? 's' : ''}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">"{item.preview}"</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-600 font-mono">{item.time}</span>
                <button className="text-[10px] font-black text-cyan-400 tracking-widest uppercase hover:text-cyan-300 transition-colors">
                  ▶ Watch Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Weekly Review ── */}
      {tab === 'Weekly Review' && (
        <div className="space-y-4">
          <div className="bg-[#0A1628] border border-cyan-400/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black text-cyan-400/70 tracking-[0.3em] uppercase">{weeklyReview.week}</span>
              <span className="text-[9px] font-black text-cyan-400 tracking-widest uppercase">Available</span>
            </div>
            <p className="text-white font-black text-sm mb-4">Coach Review</p>
            <p className="text-sm text-slate-400 leading-relaxed border-b border-white/[0.06] pb-4 mb-4">
              {weeklyReview.summary}
            </p>

            {/* Lift status */}
            <div className="space-y-2 mb-4">
              {weeklyReview.lifts.map((l) => (
                <div key={l.name} className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-500 tracking-widest w-16">{l.name}</span>
                  <div className="flex gap-2">
                    {[
                      { label: 'STR', val: l.strength },
                      { label: 'TEC', val: l.technique },
                      { label: 'FAT', val: l.fatigue },
                    ].map(({ label, val }) => (
                      <span key={label} className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                        val === '↑' ? 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400' :
                        val === '↓' ? 'bg-red-400/10 border-red-400/20 text-red-400' :
                        'bg-white/[0.04] border-white/[0.08] text-slate-500'
                      }`}>{val} {label}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Coach notes */}
            {[
              { title: 'What went well', items: weeklyReview.notes.well, color: 'text-cyan-400' },
              { title: 'What needs attention', items: weeklyReview.notes.attention, color: 'text-amber-400' },
              { title: 'Next week', items: weeklyReview.notes.next, color: 'text-slate-400' },
            ].map(({ title, items, color }) => (
              <div key={title} className="border-t border-white/[0.06] pt-3 mt-3">
                <p className={`text-[9px] font-black tracking-[0.25em] uppercase mb-2 ${color}`}>{title}</p>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item} className="text-xs text-slate-400 flex gap-2">
                      <span className="text-slate-600">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Block Review ── */}
      {tab === 'Block Review' && (
        <div className="space-y-4">
          <div className="bg-[#0A1628] border border-white/[0.1] rounded-2xl p-5">
            <span className="text-[9px] font-black text-cyan-400/70 tracking-[0.3em] uppercase">{blockReview.block}</span>
            <p className="text-white font-black text-sm mt-1 mb-0.5">{blockReview.phase}</p>
            <p className="text-[10px] text-slate-600 font-mono mb-4">{blockReview.weeks} weeks</p>

            {/* e1RM comparison */}
            <div className="bg-white/[0.03] rounded-xl p-4 mb-4 space-y-1">
              <LiftDelta name="SQ" before={blockReview.start.sq} after={blockReview.end.sq} />
              <LiftDelta name="BP" before={blockReview.start.bp} after={blockReview.end.bp} />
              <LiftDelta name="DL" before={blockReview.start.dl} after={blockReview.end.dl} />
            </div>

            {/* Ratings */}
            <p className="text-[9px] font-black text-slate-500 tracking-[0.25em] uppercase mb-3">Coach Assessment</p>
            <div className="space-y-3 mb-4">
              {blockReview.ratings.map((r) => <BarRating key={r.label} {...r} />)}
            </div>

            {/* Conclusion */}
            <div className="border-t border-white/[0.06] pt-4">
              <p className="text-[9px] font-black text-slate-500 tracking-[0.25em] uppercase mb-2">Coach's Conclusion</p>
              <p className="text-sm text-slate-400 leading-relaxed italic">"{blockReview.conclusion}"</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      {tab === 'Messages' && (
        <div className="space-y-4">
          <div className="bg-[#0A1628] border border-white/[0.07] rounded-2xl p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.isCoach ? 'items-start' : 'items-end'}`}>
                <span className="text-[9px] text-slate-600 font-mono mb-1">{m.from} · {m.time}</span>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.isCoach
                    ? 'bg-white/[0.06] border border-white/[0.08] text-slate-300 rounded-tl-sm'
                    : 'bg-cyan-400/10 border border-cyan-400/20 text-cyan-100 rounded-tr-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0A1628] border border-white/[0.07] rounded-2xl p-4 flex items-center gap-3">
            <input
              type="text"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Message your coach..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
            />
            <button
              onClick={() => setMsg('')}
              className="w-9 h-9 bg-cyan-400 hover:bg-cyan-300 rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
              <svg className="w-4 h-4 text-[#050B14]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
