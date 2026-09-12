interface PasswordStrengthProps {
  password: string;
}

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: '', color: '' };
  if (pw.length < 6) return { score: 1, label: 'Too short', color: 'bg-red-500' };
  let score = 1;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score: 2, label: 'Weak', color: 'bg-orange-500' };
  if (score === 3) return { score: 3, label: 'Fair', color: 'bg-yellow-400' };
  return { score: 4, label: 'Strong', color: 'bg-cyan-400' };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : 'bg-white/10'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score >= 4 ? 'text-cyan-400' : score === 3 ? 'text-yellow-400' : score === 2 ? 'text-orange-500' : 'text-red-500'}`}>
        {label}
      </p>
    </div>
  );
}
