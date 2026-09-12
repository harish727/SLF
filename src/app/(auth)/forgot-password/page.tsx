'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // TODO: Supabase resetPasswordForEmail
      await new Promise((r) => setTimeout(r, 1000));
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white">Check your email</h2>
          <p className="text-slate-400 text-sm">We&apos;ve sent a password reset link to <span className="text-white">{email}</span></p>
          <Link href="/login" className="block text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-4">
            ← Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Reset password</h2>
            <p className="text-slate-500 text-sm mt-1">Enter your email and we&apos;ll send you a reset link.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-400 tracking-widest uppercase">
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full h-12 bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 transition-colors`}
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
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
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <Link href="/login" className="block text-center text-sm text-slate-500 hover:text-cyan-400 transition-colors">
            ← Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
