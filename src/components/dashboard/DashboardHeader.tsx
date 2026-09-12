import Link from 'next/link';
import type { AthleteProfile } from '@/lib/db';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardHeader({ athlete }: { athlete: AthleteProfile }) {
  const initials = athlete.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-xs font-bold tracking-[0.25em] uppercase mb-1">
          {getGreeting()}
        </p>
        <h1 className="text-2xl font-black text-white tracking-tight">
          {athlete.firstName}
        </h1>
        <p className="text-slate-500 text-[11px] font-bold tracking-[0.2em] uppercase mt-1.5">
          {athlete.program} · Week {athlete.week} · Day {athlete.day}
        </p>
      </div>

      {/* Profile avatar — links to /profile */}
      <Link href="/profile" className="group flex flex-col items-center gap-1.5">
        <div className="w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center font-black text-cyan-400 text-sm group-hover:bg-cyan-400/20 transition-colors">
          {initials}
        </div>
        <span className="text-[9px] font-bold text-slate-600 tracking-[0.2em] uppercase group-hover:text-slate-400 transition-colors">Profile</span>
      </Link>
    </div>
  );
}
