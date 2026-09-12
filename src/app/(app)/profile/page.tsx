import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getDashboardByUserId } from '@/lib/db';
import { redirect } from 'next/navigation';

// ── Small presentational helpers ─────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase px-1">{title}</p>
      {children}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0A1628] border border-white/[0.07] rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[11px] font-bold text-slate-500 tracking-wide">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

function ActionRow({ label, href, danger = false }: { label: string; href?: string; danger?: boolean }) {
  const cls = `flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 group cursor-pointer`;
  const text = danger ? 'text-red-400' : 'text-slate-300 group-hover:text-white';
  const inner = (
    <>
      <span className={`text-sm font-semibold transition-colors ${text}`}>{label}</span>
      {!danger && (
        <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </>
  );
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <div className={cls}>{inner}</div>;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const data = getDashboardByUserId(session.userId);
  if (!data) redirect('/');

  const { athlete } = data;
  const initials = athlete.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-7 pt-6 pb-28 md:pb-10">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center pt-2 pb-4">
        <div className="w-20 h-20 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center font-black text-cyan-400 text-2xl mb-4">
          {initials}
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">{athlete.name}</h1>
        <p className="text-slate-500 text-[11px] font-bold tracking-[0.25em] uppercase mt-1.5">
          Member since Jan 2026
        </p>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
          <span className="text-[10px] font-black text-cyan-400 tracking-[0.2em] uppercase">Active Member</span>
        </div>
      </div>

      {/* ── Membership ───────────────────────────────────────────── */}
      <Section title="Membership">
        <Card className="border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.04)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white font-black text-sm tracking-wide">SLF ELITE COACHING</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">1:1 Coaching</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[9px] font-black text-cyan-400 tracking-widest uppercase">Active</span>
            </div>
          </div>

          <div className="text-2xl font-black text-white mb-1">₹4,999<span className="text-sm text-slate-500 font-semibold"> / month</span></div>
          <div className="space-y-0 mb-4">
            <Row label="Started"      value="12 Jan 2026" />
            <Row label="Next billing" value="12 Oct 2026" />
            <Row label="Renewal"      value="Automatic" />
          </div>

          <div className="border-t border-white/[0.06] pt-4 mb-4 space-y-2">
            {['Individual programming', 'Video analysis', 'Weekly reviews', 'Coach messaging', 'Progress tracking', 'Exercise library'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <span className="text-cyan-400 text-xs">✓</span>
                <span className="text-xs text-slate-400">{f}</span>
              </div>
            ))}
          </div>

          <button className="w-full h-10 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-white font-black text-xs tracking-widest uppercase rounded-xl transition-colors">
            Manage Membership
          </button>
        </Card>

        {/* History */}
        <Card>
          <p className="text-[9px] font-black text-slate-600 tracking-[0.25em] uppercase mb-3">Membership History</p>
          <div className="space-y-3">
            {[
              { plan: 'Elite Coaching',       period: 'Jan 2026 — Present', status: 'ACTIVE',    active: true },
              { plan: 'Performance Program',  period: 'Aug 2025 — Dec 2025', status: 'COMPLETED', active: false },
            ].map((h) => (
              <div key={h.plan} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm font-black text-white">{h.plan}</p>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">{h.period}</p>
                </div>
                <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-lg border ${
                  h.active ? 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400' : 'bg-white/[0.04] border-white/[0.06] text-slate-500'
                }`}>{h.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* ── Athlete Details ───────────────────────────────────────── */}
      <Section title="Athlete">
        <Card>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Weight Class', value: '83 kg' },
              { label: 'Experience',   value: '5+ Yrs' },
              { label: 'Level',        value: 'National' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-white font-black text-base">{value}</p>
                <p className="text-[9px] text-slate-600 tracking-wide uppercase mt-1">{label}</p>
              </div>
            ))}
          </div>
          <Row label="Primary Sport"       value="Powerlifting" />
          <Row label="Training Location"   value="Commercial Gym" />
          <Row label="Training Frequency"  value="4 days / week" />
          <Row label="Federation"          value="IPF" />
          <div className="pt-3">
            <button className="w-full h-9 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 font-black text-xs tracking-widest uppercase rounded-xl transition-colors">
              Edit Details
            </button>
          </div>
        </Card>
      </Section>

      {/* ── Coach ────────────────────────────────────────────────── */}
      <Section title="Coach">
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center font-black text-white text-sm shrink-0">
              FL
            </div>
            <div>
              <p className="text-white font-black text-sm">Fluffy</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Strength Lab Coach</p>
            </div>
          </div>
          <Row label="Coaching since"  value="Jan 2026" />
          <Row label="Current block"   value="Strength Development" />
          <Row label="Current week"    value="Week 06" />
          <Row label="Next review"     value="Sunday" />
          <div className="pt-3">
            <Link href="/messages" className="flex items-center justify-center w-full h-9 bg-cyan-400/10 border border-cyan-400/20 hover:bg-cyan-400/20 text-cyan-400 font-black text-xs tracking-widest uppercase rounded-xl transition-colors">
              Message Coach
            </Link>
          </div>
        </Card>
      </Section>

      {/* ── Competition ───────────────────────────────────────────── */}
      <Section title="Competition">
        <Card>
          <Row label="Federation"            value="IPF" />
          <Row label="Weight Class"          value="83 kg" />
          <Row label="Next Meet"             value="18 Nov 2026" />
          <Row label="Competition Experience" value="12 meets" />
          <Row label="Best Total"            value="550 kg" />
          <div className="pt-3">
            <Link href="/progress" className="flex items-center justify-center w-full h-9 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 font-black text-xs tracking-widest uppercase rounded-xl transition-colors">
              View Full Progress
            </Link>
          </div>
        </Card>
      </Section>

      {/* ── Member Offers ─────────────────────────────────────────── */}
      <Section title="Member Offers">
        <Card className="border-amber-400/10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-[9px] font-black text-amber-400 tracking-[0.25em] uppercase">Exclusive</span>
              <p className="text-2xl font-black text-white mt-1">20% OFF</p>
              <p className="text-sm text-slate-400 mt-0.5">SLF Competition Singlet</p>
            </div>
            <span className="text-2xl">🏋️</span>
          </div>
          <div className="bg-white/[0.04] rounded-xl px-4 py-2.5 flex items-center justify-between mb-3">
            <span className="text-[10px] text-slate-500 tracking-widest uppercase">Member code</span>
            <span className="text-sm font-black text-white font-mono tracking-widest">SLF20</span>
          </div>
          <button className="w-full h-9 bg-amber-400/10 border border-amber-400/20 hover:bg-amber-400/20 text-amber-400 font-black text-xs tracking-widest uppercase rounded-xl transition-colors">
            View Offer
          </button>
        </Card>

        <Card>
          <p className="text-[9px] font-black text-slate-600 tracking-[0.25em] uppercase mb-3">Recommended for You</p>
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">⚡</span>
            <div className="flex-1">
              <p className="text-sm font-black text-white">Competition Week Support</p>
              <p className="text-xs text-slate-500 mt-0.5">Available for your upcoming meet — 18 Nov 2026</p>
            </div>
          </div>
          <button className="w-full h-9 mt-4 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 font-black text-xs tracking-widest uppercase rounded-xl transition-colors">
            Learn More
          </button>
        </Card>
      </Section>

      {/* ── Account ───────────────────────────────────────────────── */}
      <Section title="Account">
        <Card>
          <ActionRow label="Email & Password" />
          <ActionRow label="Notifications" />
          <ActionRow label="Privacy" />
          <ActionRow label="Units & Language" />
          <ActionRow label="Connected Devices" />
        </Card>
        <Card>
          <ActionRow label="Help Center" />
          <ActionRow label="Contact SLF" />
        </Card>
        <Card>
          <ActionRow label="Log Out" danger />
        </Card>
      </Section>

    </div>
  );
}
