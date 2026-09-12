interface AuthErrorProps {
  type: 'credentials' | 'network' | 'unverified' | string;
  onResend?: () => void;
}

const messages: Record<string, { title: string; body: string }> = {
  credentials: {
    title: 'Unable to sign in.',
    body: 'Check your email and password and try again.',
  },
  network: {
    title: "We couldn't connect to SLF.",
    body: 'Please check your connection and try again.',
  },
  unverified: {
    title: 'Email not verified.',
    body: 'Please verify your email before signing in.',
  },
};

export function AuthError({ type, onResend }: AuthErrorProps) {
  const msg = messages[type] ?? { title: 'Something went wrong.', body: type };

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-1">
      <p className="text-red-400 text-sm font-semibold">{msg.title}</p>
      <p className="text-red-400/80 text-sm">{msg.body}</p>
      {type === 'unverified' && onResend && (
        <button
          onClick={onResend}
          className="mt-2 text-cyan-400 text-xs font-bold tracking-widest uppercase hover:text-cyan-300 transition-colors"
        >
          Resend Verification
        </button>
      )}
    </div>
  );
}
