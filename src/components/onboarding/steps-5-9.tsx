'use client';

import { OptionBtn, Chip, Field, inputCls, ConfidenceSlider, StepHeader, StepNav } from './ui';
import type { OnboardingForm } from './steps-1-4';

// ── Step 5: Bench Assessment ──────────────────────────────────────────────────

const BENCH_ISSUES = [
  'Off the chest', 'Losing position on chest', 'Bar path', 'Mid-range', 'Lockout',
  'Triceps fatigue', 'Shoulder discomfort', 'Elbow discomfort', 'Grip inconsistency',
  'Frequent soreness', 'Frequent injuries', 'Plateau', 'Form inconsistency',
  'Confidence under heavy load', 'None', 'Not sure / N/A',
];

export function StepBench({ form, set, onBack, onNext }: {
  form: OnboardingForm;
  set: <K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) => void;
  onBack: () => void; onNext: () => void;
}) {
  function toggleIssue(i: string) {
    set('benchIssues', form.benchIssues.includes(i)
      ? form.benchIssues.filter((x) => x !== i)
      : [...form.benchIssues, i]);
  }
  return (
    <div className="space-y-5">
      <StepHeader title="Bench assessment" sub="Tell your coach how you bench" />

      <Field label="Grip width">
        <div className="grid grid-cols-2 gap-2">
          {['Close', 'Medium', 'Wide', 'Not sure', 'N/A'].map((s) => (
            <OptionBtn key={s} label={s} selected={form.benchGrip === s} onClick={() => set('benchGrip', s)} />
          ))}
        </div>
      </Field>

      <Field label="Arch">
        <div className="grid grid-cols-2 gap-2">
          {['Flat', 'Small', 'Medium', 'Large', 'Not sure', 'N/A'].map((s) => (
            <OptionBtn key={s} label={s} selected={form.benchArch === s} onClick={() => set('benchArch', s)} />
          ))}
        </div>
      </Field>

      <Field label="Touch style">
        <div className="grid grid-cols-2 gap-2">
          {['Soft touch', 'Controlled touch', 'Aggressive sink', 'Not sure', 'N/A'].map((s) => (
            <OptionBtn key={s} label={s} selected={form.benchTouch === s} onClick={() => set('benchTouch', s)} />
          ))}
        </div>
      </Field>

      <Field label="Where do you struggle?">
        <div className="flex flex-wrap gap-2">
          {BENCH_ISSUES.map((i) => (
            <Chip key={i} label={i} selected={form.benchIssues.includes(i)} onClick={() => toggleIssue(i)} />
          ))}
        </div>
      </Field>

      <Field label="Bench confidence">
        <ConfidenceSlider value={form.benchConfidenceRating} onChange={(v) => set('benchConfidenceRating', v)} />
      </Field>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ── Step 6: Deadlift Assessment ───────────────────────────────────────────────

const DEADLIFT_ISSUES = [
  'Off the floor', 'Just below knee', 'Above knee', 'Lockout', 'Grip',
  'Position off floor', 'Bar drifting away', 'Hitching', 'Form inconsistency',
  'Frequent soreness', 'Frequent injuries', 'Plateau', "Can't grind heavy attempts",
  'Confidence under heavy load', 'None', 'Not sure / N/A',
];

export function StepDeadlift({ form, set, onBack, onNext }: {
  form: OnboardingForm;
  set: <K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) => void;
  onBack: () => void; onNext: () => void;
}) {
  function toggleIssue(i: string) {
    set('deadliftIssues', form.deadliftIssues.includes(i)
      ? form.deadliftIssues.filter((x) => x !== i)
      : [...form.deadliftIssues, i]);
  }
  return (
    <div className="space-y-5">
      <StepHeader title="Deadlift assessment" sub="Tell your coach how you pull" />

      <Field label="Deadlift style">
        <div className="grid grid-cols-2 gap-2">
          {['Conventional', 'Sumo', 'Sumo / frog style', 'Not sure', 'N/A'].map((s) => (
            <OptionBtn key={s} label={s} selected={form.deadliftStyle === s} onClick={() => set('deadliftStyle', s)} />
          ))}
        </div>
      </Field>

      <Field label="How would you describe your build for deadlifting?">
        <div className="space-y-2">
          {[
            'Short torso / long arms',
            'Balanced',
            'Long torso / shorter arms',
            'Not sure',
          ].map((s) => (
            <OptionBtn key={s} label={s} selected={form.deadliftBuild === s}
              onClick={() => set('deadliftBuild', s)} className="w-full text-left px-4" />
          ))}
        </div>
      </Field>

      <Field label="Where does your deadlift break down?">
        <div className="flex flex-wrap gap-2">
          {DEADLIFT_ISSUES.map((i) => (
            <Chip key={i} label={i} selected={form.deadliftIssues.includes(i)} onClick={() => toggleIssue(i)} />
          ))}
        </div>
      </Field>

      <Field label="Deadlift confidence">
        <ConfidenceSlider value={form.deadliftConfidenceRating} onChange={(v) => set('deadliftConfidenceRating', v)} />
      </Field>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ── Step 7: Injuries ──────────────────────────────────────────────────────────

const BODY_AREAS = ['Shoulder', 'Elbow', 'Wrist', 'Back', 'Hip', 'Knee', 'Ankle', 'Other'];

export function StepInjuries({ form, set, onBack, onNext }: {
  form: OnboardingForm;
  set: <K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) => void;
  onBack: () => void; onNext: () => void;
}) {
  function toggleArea(a: string) {
    set('affectedAreas', form.affectedAreas.includes(a)
      ? form.affectedAreas.filter((x) => x !== a)
      : [...form.affectedAreas, a]);
  }
  return (
    <div className="space-y-5">
      <StepHeader title="Training history" sub="What should your coach know before programming?" />

      <Field label="Current physical limitations">
        <div className="grid grid-cols-2 gap-2">
          <OptionBtn label="None" selected={form.affectedAreas.length === 0}
            onClick={() => set('affectedAreas', [])} />
          {BODY_AREAS.map((a) => (
            <OptionBtn key={a} label={a} selected={form.affectedAreas.includes(a)} onClick={() => toggleArea(a)} />
          ))}
        </div>
      </Field>

      <Field label="Significant injury in the past 12 months?">
        <div className="grid grid-cols-3 gap-2">
          {['Yes', 'No', 'Prefer not to say'].map((v) => (
            <OptionBtn key={v} label={v} selected={form.recentInjury === v} onClick={() => set('recentInjury', v)} />
          ))}
        </div>
      </Field>

      <Field label="Notes for your coach (optional)">
        <textarea value={form.injuryNotes} onChange={(e) => set('injuryNotes', e.target.value)}
          placeholder="Anything your coach should know..."
          rows={3}
          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none" />
      </Field>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ── Step 8: Goals + Next Meet ─────────────────────────────────────────────────

const PRIMARY_GOALS = [
  'First competition', 'Improve total', 'Qualify for a competition',
  'National competition', 'International competition', 'Strength development',
  'Weight-class change', 'General performance',
];

const PRIORITIES = ['Strength', 'Technique', 'Competition performance', 'Body composition', 'Weight-class management', 'Consistency', 'Confidence', 'Recovery'];

export function StepGoals({ form, set, onBack, onNext }: {
  form: OnboardingForm;
  set: <K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) => void;
  onBack: () => void; onNext: () => void;
}) {
  function togglePriority(p: string) {
    const list = form.priorityRanking;
    set('priorityRanking', list.includes(p) ? list.filter((x) => x !== p) : [...list, p]);
  }

  return (
    <div className="space-y-5">
      <StepHeader title="Goals & next meet" sub="Where are you going?" />

      <Field label="Primary goal">
        <div className="grid grid-cols-2 gap-2">
          {PRIMARY_GOALS.map((g) => (
            <OptionBtn key={g} label={g} selected={form.primaryGoal === g} onClick={() => set('primaryGoal', g)} />
          ))}
        </div>
      </Field>

      <Field label="What do you want to improve? (select all that apply)">
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map((p) => (
            <Chip key={p} label={p} selected={form.priorityRanking.includes(p)} onClick={() => togglePriority(p)} />
          ))}
        </div>
      </Field>

      <Field label="What would make the next 12 weeks a success?">
        <textarea value={form.successDefinition} onChange={(e) => set('successDefinition', e.target.value)}
          placeholder="e.g. Hit a 550 total at state championships..."
          rows={3}
          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none" />
      </Field>

      <Field label="Target total (kg, optional)">
        <input type="number" placeholder="e.g. 550" value={form.targetTotal}
          onChange={(e) => set('targetTotal', e.target.value)} className={inputCls} />
      </Field>

      <div className="border-t border-white/[0.06] pt-4 space-y-4">
        <p className="text-[10px] font-black text-slate-500 tracking-[0.25em] uppercase">Next competition</p>

        <Field label="Competition name">
          <input type="text" placeholder="e.g. AP State Championships" value={form.nextMeetName}
            onChange={(e) => set('nextMeetName', e.target.value)} className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input type="date" value={form.nextMeetDate}
              onChange={(e) => set('nextMeetDate', e.target.value)} className={inputCls} />
          </Field>
          <Field label="How important?">
            <div className="flex gap-1.5 h-12 items-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => set('nextMeetImportance', n)}
                  className={`flex-1 h-10 rounded-xl border text-sm font-black transition-all ${
                    form.nextMeetImportance === n
                      ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-500 hover:border-white/20'
                  }`}>{n}</button>
              ))}
            </div>
          </Field>
        </div>
        <div className="flex justify-between text-[10px] text-slate-600 font-semibold px-1">
          <span>Just another meet</span><span>Peak priority</span>
        </div>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ── Step 9: Plan Selection ────────────────────────────────────────────────────

const PLANS = [
  {
    key: 'elite' as const,
    name: 'ELITE',
    sub: '1:1 Coaching',
    price: '₹18,000',
    period: '/ 12 weeks',
    features: [
      'Individual programming',
      'Video analysis & form checks',
      'Weekly check-ins',
      'Block-to-block feedback',
      'Meet-day guidance',
      'Coach communication',
      'Performance monitoring',
    ],
    accent: true,
  },
  {
    key: 'pro' as const,
    name: 'PRO',
    sub: 'Programming Support',
    price: '₹9,000',
    period: '/ 12 weeks',
    features: [
      'Individual programming',
      'One-time SBD form review',
      'Block adjustments from feedback',
      'Coach communication',
    ],
    accent: false,
  },
  {
    key: 'member' as const,
    name: 'MEMBER',
    sub: 'Self-Guided Training',
    price: 'FREE',
    period: '— 4 weeks',
    features: [
      'Workout logging',
      'Track training',
      'Basic progress',
      'Exercise library',
    ],
    accent: false,
  },
];

export function StepPlan({ form, set, onBack, onNext, loading }: {
  form: OnboardingForm;
  set: <K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) => void;
  onBack: () => void; onNext: () => void; loading: boolean;
}) {
  return (
    <div className="space-y-5">
      <StepHeader title="Choose your plan" sub="Select the level of support that fits you" />

      <div className="space-y-3">
        {PLANS.map((plan) => {
          const selected = form.selectedPlan === plan.key;
          return (
            <button key={plan.key} type="button" onClick={() => set('selectedPlan', plan.key)}
              className={`w-full rounded-2xl border p-4 text-left transition-all space-y-3 ${
                selected
                  ? 'bg-cyan-400/10 border-cyan-400/40'
                  : 'bg-white/[0.02] border-white/[0.07] hover:border-white/20'
              }`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black tracking-widest ${selected ? 'text-cyan-400' : 'text-white'}`}>
                      {plan.name}
                    </span>
                    {plan.accent && (
                      <span className="text-[9px] font-black bg-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded-full tracking-widest">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{plan.sub}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black ${selected ? 'text-cyan-400' : 'text-white'}`}>{plan.price}</p>
                  <p className="text-slate-600 text-[10px]">{plan.period}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <svg className={`w-3.5 h-3.5 shrink-0 ${selected ? 'text-cyan-400' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-slate-400">{f}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-2">
        <p className="text-[10px] font-black text-slate-500 tracking-[0.25em] uppercase">Need help choosing?</p>
        <p className="text-slate-400 text-xs">Not sure which plan is right for you?</p>
        <a href="mailto:harishtheroyal@gmail.com"
          className="inline-block text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
          Email SLF →
        </a>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="Complete Profile" loading={loading} />
    </div>
  );
}
