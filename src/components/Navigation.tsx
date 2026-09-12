"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/lib/auth/actions';
import { useTransition } from 'react';

const navItems = [
  { href: '/',         label: 'Home',     icon: HomeIcon },
  { href: '/train',    label: 'Train',    icon: TrainIcon },
  { href: '/progress', label: 'Progress', icon: ProgressIcon },
  { href: '/messages', label: 'Coach',    icon: MessagesIcon },
  { href: '/profile',  label: 'Profile',  icon: ProfileIcon },
];

export function Navigation() {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => { logoutAction(); });
  }

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#050B14] border-r border-white/[0.06]">

        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-400 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[#050B14] font-black text-xs tracking-tighter">SLF</span>
          </div>
          <div>
            <p className="text-white font-black text-sm tracking-tight leading-none">STRENGTH LAB</p>
            <p className="text-cyan-400 text-[9px] font-bold tracking-[0.25em] mt-0.5">BY FLUFFY</p>
          </div>
        </div>

        {/* Blueprint grid accent */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#3aa8bf 1px, transparent 1px), linear-gradient(90deg, #3aa8bf 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-1 relative z-10 mt-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon active={isActive} />
                {label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-white/[0.06] relative z-10">
          <button
            onClick={handleLogout}
            disabled={pending}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-40 text-left"
          >
            <LogoutIcon />
            {pending ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Bar ────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050B14]/95 backdrop-blur-xl border-t border-white/[0.06] flex items-center px-2 h-[68px]">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-150 ${
                isActive ? 'text-cyan-400' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <Icon active={isActive} />
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-cyan-400' : 'text-slate-600'}`}>
                {label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          disabled={pending}
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-slate-600 hover:text-slate-400 transition-all disabled:opacity-40"
        >
          <LogoutIcon />
          <span className="text-[10px] font-bold tracking-wide text-slate-600">Out</span>
        </button>
      </nav>
    </>
  );
}

// ── SVG Icons ────────────────────────────────────────────────────────────────

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg className={`w-5 h-5 shrink-0 ${active ? 'text-cyan-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function TrainIcon({ active }: { active?: boolean }) {
  return (
    <svg className={`w-5 h-5 shrink-0 ${active ? 'text-cyan-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function ProgressIcon({ active }: { active?: boolean }) {
  return (
    <svg className={`w-5 h-5 shrink-0 ${active ? 'text-cyan-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function MessagesIcon({ active }: { active?: boolean }) {
  return (
    <svg className={`w-5 h-5 shrink-0 ${active ? 'text-cyan-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

function ProfileIcon({ active }: { active?: boolean }) {
  return (
    <svg className={`w-5 h-5 shrink-0 ${active ? 'text-cyan-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}
