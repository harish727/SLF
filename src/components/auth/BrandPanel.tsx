export function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between w-1/2 min-h-screen bg-[#050B14] p-12 relative overflow-hidden">
      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(#3aa8bf 1px, transparent 1px),
            linear-gradient(90deg, #3aa8bf 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Barbell SVG watermark */}
      <svg
        className="absolute bottom-24 right-0 opacity-[0.06] w-[480px]"
        viewBox="0 0 480 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0" y="50" width="480" height="20" rx="10" fill="#3aa8bf" />
        <rect x="20" y="20" width="30" height="80" rx="6" fill="#3aa8bf" />
        <rect x="55" y="30" width="20" height="60" rx="4" fill="#3aa8bf" />
        <rect x="405" y="20" width="30" height="80" rx="6" fill="#3aa8bf" />
        <rect x="430" y="30" width="20" height="60" rx="4" fill="#3aa8bf" />
      </svg>

      {/* Logo */}
      <div>
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-cyan-400 rounded flex items-center justify-center">
            <span className="text-[#050B14] font-black text-sm tracking-tighter">SLF</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tight leading-none">
            STRENGTH LAB
          </h1>
          <p className="text-cyan-400 text-lg font-semibold tracking-widest uppercase">
            by Fluffy
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {['TRAIN', 'LEARN', 'APPLY', 'GET STRONGER'].map((word) => (
            <p key={word} className="text-slate-500 text-sm font-bold tracking-[0.3em]">
              {word}
            </p>
          ))}
        </div>
      </div>

      <p className="text-slate-600 text-xs tracking-widest uppercase">
        Performance Coaching Platform
      </p>
    </div>
  );
}
