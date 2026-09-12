'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PasswordInput } from './PasswordInput';
import { AuthError } from './AuthError';
import { validate } from '@/lib/auth/validation';
import { loginAction } from '@/lib/auth/actions';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setAuthError(null);

    try {
      const result = await loginAction(email, password);
      console.log('Login result:', result);
      if ('error' in result) {
        setAuthError(result.error);
        setLoading(false);
      } else {
        console.log('Redirecting to:', result.redirect);
        await router.push(result.redirect);
      }
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('network');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Welcome back</h2>
        <p className="text-slate-500 text-sm mt-1">Sign in to your SLF account</p>
      </div>

      {authError && <AuthError type={authError} />}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold text-slate-400 tracking-widest uppercase">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`w-full h-12 bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 transition-colors`}
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <PasswordInput
            id="login-password"
            label="Password"
            value={password}
            onChange={setPassword}
            error={errors.password}
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>
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
            Signing in...
          </>
        ) : 'Sign In'}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-slate-600 text-xs">OR</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <p className="text-center text-sm text-slate-500">
        New to SLF?{' '}
        <Link href="/signup" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
          Create account
        </Link>
      </p>
    </form>
  );
}
