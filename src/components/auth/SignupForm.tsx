'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PasswordInput } from './PasswordInput';
import { PasswordStrength } from './PasswordStrength';
import { AuthError } from './AuthError';
import { validateSignup } from '@/lib/auth/validation';
import { signupAction } from '@/lib/auth/actions';

export function SignupForm() {
  const router = useRouter();
  const [fields, setFields] = useState({
    firstName: '', lastName: '', email: '', password: '', confirm: '', terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string | boolean) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateSignup(fields);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setAuthError(null);
    try {
      const result = await signupAction(fields.firstName, fields.lastName, fields.email, fields.password);
      if ('error' in result) {
        setAuthError(result.error === 'email_taken' ? 'An account with this email already exists.' : result.error);
        setLoading(false);
      } else {
        router.push(result.redirect);
      }
    } catch {
      setAuthError('network');
      setLoading(false);
    }
  }

  const inputClass = (key: string) =>
    `w-full h-12 bg-white/5 border ${errors[key] ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 transition-colors`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Create account</h2>
        <p className="text-slate-500 text-sm mt-1">Start your journey with SLF</p>
      </div>

      {authError && <AuthError type={authError} />}

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        {(['firstName', 'lastName'] as const).map((key) => (
          <div key={key} className="space-y-1.5">
            <label htmlFor={key} className="block text-xs font-semibold text-slate-400 tracking-widest uppercase">
              {key === 'firstName' ? 'First name' : 'Last name'}
            </label>
            <input
              id={key}
              type="text"
              value={fields[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={key === 'firstName' ? 'John' : 'Doe'}
              className={inputClass(key)}
            />
            {errors[key] && <p className="text-red-400 text-xs">{errors[key]}</p>}
          </div>
        ))}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-400 tracking-widest uppercase">
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          value={fields.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="you@example.com"
          className={inputClass('email')}
        />
        {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <PasswordInput
          id="signup-password"
          label="Password"
          value={fields.password}
          onChange={(v) => set('password', v)}
          error={errors.password}
        />
        <PasswordStrength password={fields.password} />
      </div>

      {/* Confirm password */}
      <PasswordInput
        id="confirm-password"
        label="Confirm password"
        value={fields.confirm}
        onChange={(v) => set('confirm', v)}
        error={errors.confirm}
      />

      {/* Terms */}
      <div className="space-y-1">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.terms}
            onChange={(e) => set('terms', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 accent-cyan-400 cursor-pointer"
          />
          <span className="text-sm text-slate-400">
            I agree to the{' '}
            <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.terms && <p className="text-red-400 text-xs pl-7">{errors.terms}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#050B14] font-black text-sm tracking-widest uppercase rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}
