'use client';

import Link from 'next/link';
import { skipOnboardingAction } from '@/lib/auth/onboarding';
import { useState } from 'react';

const STEPS = [
  'About you',
  'Training background',
  'Current strength',
  'Squat',
  'Bench',
  'Deadlift',
  'Injuries',
  'Goals',
  'Plan',
];

interface Props {
  currentStep: number;
}

export function OnboardingBanner({ currentStep }: Props) {
  const [skipping, setSkipping] = useState(false);
  const pct = Math.round((currentStep / STEPS.length) * 100);
  const nextStepLabel = STEPS[currentStep] ?? 'Plan';

  async function handleSkip() {
    setSkipping(true);
    await skipOnboardingAction();
  }

  return (
    <div className="relative bg-[#0A1628] border border-cyan-400/20 rounded-2xl p-5 overflow-hidden">
      {/* top accent */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/70 via-cyan-400/20 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[9px] font-black text-cyan-400/70 tracking-[0.3em] uppercase">
            Profile incomplete
          </p>
          <h3 className="text-base font-black text-white tracking-tight">
            Complete your athlete profile
          </h3>
          <p className="text-slate-500 text-xs">
            {currentStep === 0
              ? 'Help your coach understand how you lift.'
              : `Next up: ${nextStepLabel}`}
          </p>
        </div>

        {/* circular progress */}
        <div className="shrink-0 relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgb(34,211,238)" strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
              strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-cyan-400">
            {pct}%
          </span>
        </div>
      </div>

      {/* step dots */}
      <div className="flex gap-1 mt-4">
        {STEPS.map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
            i < currentStep ? 'bg-cyan-400' : 'bg-white/[0.08]'
          }`} />
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <Link href="/onboarding"
          className="flex-1 h-10 bg-cyan-400 hover:bg-cyan-300 text-[#050B14] font-black text-xs tracking-widest uppercase rounded-xl transition-colors flex items-center justify-center">
          {currentStep === 0 ? 'Start Profile' : 'Continue Profile'}
        </Link>
        <button onClick={handleSkip} disabled={skipping}
          className="px-4 h-10 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-500 hover:text-slate-300 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50">
          {skipping ? '...' : 'Skip'}
        </button>
      </div>

      <p className="text-[10px] text-slate-700 mt-2 text-center">
        Skipping joins you as a <span className="text-slate-500 font-semibold">Member</span> — you can complete your profile anytime
      </p>
    </div>
  );
}
