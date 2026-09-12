'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  // TODO: get email from auth session/query param
  const email = 'your@email.com';

  async function handleResend() {
    setLoading(true);
    try {
      // TODO: Supabase resend verification
      await new Promise((r) => setTimeout(r, 1000));
      setResent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6 text-center">
        <div className="w-14 h-14 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Verify your email</h2>
          <p className="text-slate-400 text-sm mt-3">
            We sent a verification link to:
          </p>
          <p className="text-white font-semibold text-sm mt-1">{email}</p>
          <p className="text-slate-500 text-sm mt-3">Check your inbox to continue.</p>
        </div>

        {resent ? (
          <p className="text-cyan-400 text-sm font-semibold">Email sent!</p>
        ) : (
          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full h-12 border border-white/10 hover:border-cyan-400/50 disabled:opacity-50 text-white font-bold text-sm tracking-widest uppercase rounded-lg transition-colors flex items-center justify-center gap-2"
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
              'Resend Email'
            )}
          </button>
        )}

        <Link href="/login" className="block text-sm text-slate-500 hover:text-cyan-400 transition-colors">
          Change email
        </Link>
      </div>
    </AuthLayout>
  );
}
