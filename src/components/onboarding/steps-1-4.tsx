'use client';

import { OptionBtn, Chip, Field, inputCls, ConfidenceSlider, StepHeader, StepNav } from './ui';

// ── Shared form state type ────────────────────────────────────────────────────

export interface OnboardingForm {
  // personal
  dob: string; gender: string; height: string; weight: string; units: 'kg' | 'lbs';
  // training
  experience: string; competitionLevel: string;
  gymType: string; gymName: string; equipmentAvailable: string[];
  daysPerWeek: number; preferredDays: string[]; sessionDuration: string; consistency: string;
  // strength
  squatRm: string; squatRmReps: string; squatRmRpe: string; squatConfidence: string;
  benchRm: string; benchRmReps: string; benchRmRpe: string; benchConfidence: string;
  deadliftRm: string; deadliftRmReps: string; deadliftRmRpe: string; deadliftConfidence: string;
  // squat
  squatStyle: string; squatStance: string; squatBarPosition: string; squatFootwear: string;
  squatIssues: string[]; squatConfidenceRating: number;
  // bench
  benchGrip: string; benchArch: string; benchTouch: string;
  benchIssues: string[]; benchConfidenceRating: number;
  // deadlift
  deadliftStyle: string; deadliftBuild: string;
  deadliftIssues: string[]; deadliftConfidenceRating: number;
  // injuries
  affectedAreas: string[]; recentInjury: string; injuryNotes: string;
  // goals
  primaryGoal: string; priorityRanking: string[]; successDefinition: string;
  targetTotal: string; nextMeetName: string; nextMeetDate: string; nextMeetImportance: number;
  // preferences
  motivations: string[]; coachExpectations: string[]; feedbackStyle: string[]; checkinTime: string;
  // plan
  selectedPlan: 'member' | 'pro' | 'elite';
}

export const defaultForm: OnboardingForm = {
  dob: '', gender: '', height: '', weight: '', units: 'kg',
  experience: '', competitionLevel: '',
  gymType: '', gymName: '', equipmentAvailable: [],
  daysPerWeek: 4, preferredDays: [], sessionDuration: '', consistency: '',
  squatRm: '', squatRmReps: '', squatRmRpe: '', squatConfidence: '',
  benchRm: '', benchRmReps: '', benchRmRpe: '', benchConfidence: '',
  deadliftRm: '', deadliftRmReps: '', deadliftRmRpe: '', deadliftConfidence: '',
  squatStyle: '', squatStance: '', squatBarPosition: '', squatFootwear: '',
  squatIssues: [], squatConfidenceRating: 0,
  benchGrip: '', benchArch: '', benchTouch: '',
  benchIssues: [], benchConfidenceRating: 0,
  deadliftStyle: '', deadliftBuild: '',
  deadliftIssues: [], deadliftConfidenceRating: 0,
  affectedAreas: [], recentInjury: '', injuryNotes: '',
  primaryGoal: '', priorityRanking: [], successDefinition: '',
  targetTotal: '', nextMeetName: '', nextMeetDate: '', nextMeetImportance: 3,
  motivations: [], coachExpectations: [], feedbackStyle: [], checkinTime: '',
  selectedPlan: 'member',
};

// ── Step 0: Welcome ───────────────────────────────────────────────────────────

export function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-cyan-400/70 tracking-[0.3em] uppercase">Welcome to SLF</p>
        <h2 className="text-2xl font-black text-white tracking-tight">Let's understand how you lift.</h2>
        <p className="text-slate-500 text-sm mt-2">This takes around 5–7 minutes.</p>
      </div>
      <div className="space-y-2.5">
        {[
          'Your lifting background',
          'Your current strength',
          'Your technique & limitations',
          'Your goals & next meet',
          'The level of coaching you need',
        ].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0" />
            <span className="text-slate-400 text-sm">{item}</span>
          </div>
        ))}
      </div>
      <p className="text-slate-600 text-xs">
        You can select <span className="text-slate-400 font-semibold">"I don't know"</span> for any question you're unsure about.
      </p>
      <button type="button" onClick={onNext}
        className="w-full h-12 bg-cyan-400 hover:bg-cyan-300 text-[#050B14] font-black text-sm tracking-widest uppercase rounded-xl transition-colors">
        Let's Begin
      </button>
    </div>
  );
}

// ── Step 1: Personal ──────────────────────────────────────────────────────────

export function StepPersonal({ form, set, onBack, onNext }: {
  form: OnboardingForm;
  set: <K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) => void;
  onBack: () => void; onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <StepHeader title="About you" sub="Help your coach understand you" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date of birth">
          <input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Sex">
          <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={inputCls + ' appearance-none'}>
            <option value="">Select</option>
            <option>Male</option><option>Female</option><option>Prefer not to say</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={`Height (${form.units === 'kg' ? 'cm' : 'ft'})`}>
          <input type="number" placeholder="175" value={form.height} onChange={(e) => set('height', e.target.value)} className={inputCls} />
        </Field>
        <Field label={`Bodyweight (${form.units})`}>
          <input type="number" placeholder="82.5" value={form.weight} onChange={(e) => set('weight', e.target.value)} className={inputCls} />
        </Field>
      </div>

      <Field label="Units">
        <div className="grid grid-cols-2 gap-2">
          <OptionBtn label="kg / cm" selected={form.units === 'kg'} onClick={() => set('units', 'kg')} />
          <OptionBtn label="lbs / ft" selected={form.units === 'lbs'} onClick={() => set('units', 'lbs')} />
        </div>
      </Field>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ── Step 2: Training Background ───────────────────────────────────────────────

const EXPERIENCE = ['Beginner', '< 1 year', '1–2 years', '3–5 years', '5–10 years', '10+ years'];
const COMP_LEVELS = [
  { value: 'none', label: "I'm completely new" },
  { value: 'trained_not_competed', label: "Trained but never competed" },
  { value: 'local', label: "Competed locally" },
  { value: 'state', label: "Competed at state level" },
  { value: 'national', label: "Competed nationally" },
  { value: 'international', label: "Competed internationally" },
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DURATIONS = [
  { value: 'under_45', label: '<45 min' },
  { value: '45_60', label: '45–60 min' },
  { value: '60_90', label: '60–90 min' },
  { value: '90_120', label: '90–120 min' },
  { value: '120_plus', label: '120+ min' },
];
const GYM_TYPES = [
  { value: 'commercial', label: 'Commercial gym' },
  { value: 'powerlifting_gym', label: 'Powerlifting gym' },
  { value: 'home_gym', label: 'Home gym' },
  { value: 'sports_facility', label: 'Sports facility' },
  { value: 'other', label: 'Other' },
];
const EQUIPMENT = [
  'Power rack', 'Competition rack', 'Calibrated plates', 'Competition bench',
  'Deadlift platform', 'Safety squat bar', 'Belt squat', 'Cable machines',
  'Dumbbells', 'Machines', 'Bands', 'Specialty bars',
];

export function StepTraining({ form, set, onBack, onNext }: {
  form: OnboardingForm;
  set: <K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) => void;
  onBack: () => void; onNext: () => void;
}) {
  function toggleEquip(e: string) {
    set('equipmentAvailable', form.equipmentAvailable.includes(e)
      ? form.equipmentAvailable.filter((x) => x !== e)
      : [...form.equipmentAvailable, e]);
  }
  function toggleDay(d: string) {
    set('preferredDays', form.preferredDays.includes(d)
      ? form.preferredDays.filter((x) => x !== d)
      : [...form.preferredDays, d]);
  }

  return (
    <div className="space-y-5">
      <StepHeader title="Training background" sub="So your coach can set the right intensity" />

      <Field label="Training experience">
        <div className="grid grid-cols-2 gap-2">
          {EXPERIENCE.map((e) => <OptionBtn key={e} label={e} selected={form.experience === e} onClick={() => set('experience', e)} />)}
        </div>
      </Field>

      <Field label="Powerlifting experience">
        <div className="space-y-2">
          {COMP_LEVELS.map(({ value, label }) => (
            <OptionBtn key={value} label={label} selected={form.competitionLevel === value}
              onClick={() => set('competitionLevel', value)} className="w-full text-left px-4" />
          ))}
        </div>
      </Field>

      <Field label="Where do you train?">
        <div className="grid grid-cols-2 gap-2">
          {GYM_TYPES.map(({ value, label }) => (
            <OptionBtn key={value} label={label} selected={form.gymType === value} onClick={() => set('gymType', value)} />
          ))}
        </div>
      </Field>

      <Field label="Gym name (optional)">
        <input type="text" placeholder="e.g. Iron Temple" value={form.gymName}
          onChange={(e) => set('gymName', e.target.value)} className={inputCls} />
      </Field>

      <Field label="Equipment available">
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT.map((e) => <Chip key={e} label={e} selected={form.equipmentAvailable.includes(e)} onClick={() => toggleEquip(e)} />)}
        </div>
      </Field>

      <Field label="Days per week">
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6].map((n) => (
            <OptionBtn key={n} label={String(n)} selected={form.daysPerWeek === n}
              onClick={() => set('daysPerWeek', n)} className="flex-1" />
          ))}
        </div>
      </Field>

      <Field label="Preferred days">
        <div className="flex gap-1.5">
          {DAYS.map((d) => (
            <button key={d} type="button" onClick={() => toggleDay(d)}
              className={`flex-1 h-9 rounded-lg border text-[10px] font-black transition-all ${
                form.preferredDays.includes(d)
                  ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-500 hover:border-white/20'
              }`}>{d}</button>
          ))}
        </div>
      </Field>

      <Field label="Typical session duration">
        <div className="grid grid-cols-3 gap-2">
          {DURATIONS.map(({ value, label }) => (
            <OptionBtn key={value} label={label} selected={form.sessionDuration === value} onClick={() => set('sessionDuration', value)} />
          ))}
        </div>
      </Field>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ── Step 3: Current Strength ──────────────────────────────────────────────────

const CONFIDENCE_OPTS = [
  { value: 'very_confident', label: 'Very confident — this is my true 1RM' },
  { value: 'fairly_confident', label: 'Fairly confident' },
  { value: 'not_sure', label: 'Not sure' },
  { value: 'unknown', label: "I don't know my 1RM" },
];

function LiftStrengthBlock({ lift, label, rm, rmReps, rmRpe, confidence, units, onChange }: {
  lift: string; label: string;
  rm: string; rmReps: string; rmRpe: string; confidence: string;
  units: string;
  onChange: (field: string, val: string) => void;
}) {
  const unknown = confidence === 'unknown';
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3">
      <p className="text-[10px] font-black text-cyan-400/70 tracking-[0.25em] uppercase">{label}</p>

      <Field label="Confidence">
        <div className="space-y-1.5">
          {CONFIDENCE_OPTS.map(({ value, label: l }) => (
            <OptionBtn key={value} label={l} selected={confidence === value}
              onClick={() => onChange(`${lift}Confidence`, value)} className="w-full text-left px-4 h-auto py-2.5 text-xs" />
          ))}
        </div>
      </Field>

      {!unknown ? (
        <Field label={`1RM (${units})`}>
          <input type="number" placeholder="e.g. 185" value={rm}
            onChange={(e) => onChange(`${lift}Rm`, e.target.value)} className={inputCls} />
        </Field>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <Field label={`Weight (${units})`}>
            <input type="number" placeholder="150" value={rm}
              onChange={(e) => onChange(`${lift}Rm`, e.target.value)} className={inputCls} />
          </Field>
          <Field label="Reps">
            <input type="number" placeholder="5" value={rmReps}
              onChange={(e) => onChange(`${lift}RmReps`, e.target.value)} className={inputCls} />
          </Field>
          <Field label="RPE">
            <input type="number" placeholder="8" step="0.5" value={rmRpe}
              onChange={(e) => onChange(`${lift}RmRpe`, e.target.value)} className={inputCls} />
          </Field>
        </div>
      )}
    </div>
  );
}

export function StepStrength({ form, set, onBack, onNext }: {
  form: OnboardingForm;
  set: <K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) => void;
  onBack: () => void; onNext: () => void;
}) {
  function onChange(field: string, val: string) {
    set(field as keyof OnboardingForm, val as never);
  }
  return (
    <div className="space-y-5">
      <StepHeader title="Current strength" sub="Enter your best or estimated numbers" />
      <LiftStrengthBlock lift="squat" label="Squat" rm={form.squatRm} rmReps={form.squatRmReps}
        rmRpe={form.squatRmRpe} confidence={form.squatConfidence} units={form.units} onChange={onChange} />
      <LiftStrengthBlock lift="bench" label="Bench" rm={form.benchRm} rmReps={form.benchRmReps}
        rmRpe={form.benchRmRpe} confidence={form.benchConfidence} units={form.units} onChange={onChange} />
      <LiftStrengthBlock lift="deadlift" label="Deadlift" rm={form.deadliftRm} rmReps={form.deadliftRmReps}
        rmRpe={form.deadliftRmRpe} confidence={form.deadliftConfidence} units={form.units} onChange={onChange} />
      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ── Step 4: Squat Assessment ──────────────────────────────────────────────────

const SQUAT_ISSUES = [
  'Depth', 'Losing balance', 'Bracing', 'Heavy on shoulders / upper back',
  "Can't grind through sticking point", 'Knees / hips uncomfortable',
  "Can't maintain position", 'Slow out of the hole', 'Lockout / standing strength',
  'Frequent injuries', 'Frequent soreness', 'Plateau', 'Form inconsistency',
  'Confidence under heavy load', 'None', "Not sure / N/A",
];

export function StepSquat({ form, set, onBack, onNext, isBeginnerSkip }: {
  form: OnboardingForm;
  set: <K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) => void;
  onBack: () => void; onNext: () => void; isBeginnerSkip: boolean;
}) {
  function toggleIssue(i: string) {
    set('squatIssues', form.squatIssues.includes(i)
      ? form.squatIssues.filter((x) => x !== i)
      : [...form.squatIssues, i]);
  }

  if (isBeginnerSkip) {
    return (
      <div className="space-y-5">
        <StepHeader title="Squat" sub="No problem — we'll keep this simple" />
        <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-xl p-4 text-sm text-slate-400">
          Since you're new to powerlifting, you can select <span className="text-cyan-400 font-semibold">"Not sure / N/A"</span> for technical questions. Your coach will assess your technique directly.
        </div>
        <Field label="Any squat struggles? (optional)">
          <div className="flex flex-wrap gap-2">
            {SQUAT_ISSUES.map((i) => <Chip key={i} label={i} selected={form.squatIssues.includes(i)} onClick={() => toggleIssue(i)} />)}
          </div>
        </Field>
        <StepNav onBack={onBack} onNext={onNext} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <StepHeader title="Squat assessment" sub="Tell your coach how you squat" />

      <Field label="Squat style">
        <div className="grid grid-cols-2 gap-2">
          {['Low bar', 'High bar', 'I use both', 'Not sure', 'N/A'].map((s) => (
            <OptionBtn key={s} label={s} selected={form.squatStyle === s} onClick={() => set('squatStyle', s)} />
          ))}
        </div>
      </Field>

      <Field label="Stance">
        <div className="grid grid-cols-2 gap-2">
          {['Close', 'Shoulder width', 'Wide', 'Very wide', 'Not sure', 'N/A'].map((s) => (
            <OptionBtn key={s} label={s} selected={form.squatStance === s} onClick={() => set('squatStance', s)} />
          ))}
        </div>
      </Field>

      <Field label="Footwear">
        <div className="grid grid-cols-2 gap-2">
          {['Flat shoes', 'Weightlifting shoes', 'Raised heel', 'Barefoot / socks', 'Not sure', 'N/A'].map((s) => (
            <OptionBtn key={s} label={s} selected={form.squatFootwear === s} onClick={() => set('squatFootwear', s)} />
          ))}
        </div>
      </Field>

      <Field label="Where do you struggle?">
        <div className="flex flex-wrap gap-2">
          {SQUAT_ISSUES.map((i) => <Chip key={i} label={i} selected={form.squatIssues.includes(i)} onClick={() => toggleIssue(i)} />)}
        </div>
      </Field>

      <Field label="Squat confidence">
        <ConfidenceSlider value={form.squatConfidenceRating} onChange={(v) => set('squatConfidenceRating', v)} />
      </Field>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
