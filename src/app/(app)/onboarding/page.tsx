'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveOnboardingAction } from '@/lib/auth/onboarding';
import { skipOnboardingAction } from '@/lib/auth/onboarding';
import { ProgressBar } from '@/components/onboarding/ui';
import { defaultForm, OnboardingForm, StepWelcome, StepPersonal, StepTraining, StepStrength, StepSquat } from '@/components/onboarding/steps-1-4';
import { StepBench, StepDeadlift, StepInjuries, StepGoals, StepPlan } from '@/components/onboarding/steps-5-9';

// Steps: 0=Welcome, 1=Personal, 2=Training, 3=Strength, 4=Squat, 5=Bench, 6=Deadlift, 7=Injuries, 8=Goals, 9=Plan
const TOTAL_STEPS = 9;

const isBeginnerLevel = (form: OnboardingForm) =>
  form.competitionLevel === 'none' || form.experience === 'Beginner' || form.experience === '< 1 year';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<OnboardingForm>(defaultForm);

  function set<K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function next() { setStep((s) => s + 1); }
  function back() { setStep((s) => s - 1); }

  async function handleFinish() {
    setLoading(true);
    setError(null);
    const result = await saveOnboardingAction(form);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // on success, saveOnboardingAction calls redirect('/') server-side
  }

  const beginner = isBeginnerLevel(form);

  return (
    <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 bg-cyan-400 rounded-lg flex items-center justify-center">
            <span className="text-[#050B14] font-black text-xs tracking-tighter">SLF</span>
          </div>
          <div>
            <p className="text-white font-black text-sm tracking-tight leading-none">STRENGTH LAB</p>
            <p className="text-cyan-400 text-[9px] font-bold tracking-[0.25em]">BY FLUFFY</p>
          </div>
        </div>

        {step > 0 && <ProgressBar current={step} total={TOTAL_STEPS} />}

        <div className="bg-[#0A1628] border border-white/[0.07] rounded-2xl p-6">

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              Something went wrong: {error}. Please try again.
            </div>
          )}

          {step === 0 && <StepWelcome onNext={next} />}

          {step === 1 && <StepPersonal form={form} set={set} onBack={back} onNext={next} />}

          {step === 2 && <StepTraining form={form} set={set} onBack={back} onNext={next} />}

          {step === 3 && <StepStrength form={form} set={set} onBack={back} onNext={next} />}

          {step === 4 && (
            <StepSquat form={form} set={set} onBack={back} onNext={next} isBeginnerSkip={beginner} />
          )}

          {step === 5 && <StepBench form={form} set={set} onBack={back} onNext={next} />}

          {step === 6 && <StepDeadlift form={form} set={set} onBack={back} onNext={next} />}

          {step === 7 && <StepInjuries form={form} set={set} onBack={back} onNext={next} />}

          {step === 8 && <StepGoals form={form} set={set} onBack={back} onNext={next} />}

          {step === 9 && (
            <StepPlan form={form} set={set} onBack={back} onNext={handleFinish} loading={loading} />
          )}

        </div>

        {/* Step label */}
        {step > 0 && (
          <p className="text-center text-[10px] text-slate-700 font-bold tracking-widest uppercase mt-4">
            {['', 'About You', 'Training Background', 'Current Strength', 'Squat', 'Bench', 'Deadlift', 'Injuries', 'Goals', 'Plan'][step]}
          </p>
        )}
        {/* Skip link — visible on all steps except welcome and plan */}
        {step > 0 && step < 9 && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={async () => { await skipOnboardingAction(); router.push('/'); }}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors font-semibold">
              Skip — join as Member
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
