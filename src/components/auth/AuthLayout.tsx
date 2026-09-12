import { BrandPanel } from './BrandPanel';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#050B14]">
      <BrandPanel />
      <div className="flex flex-1 items-center justify-center p-5 lg:p-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-cyan-400 rounded flex items-center justify-center">
              <span className="text-[#050B14] font-black text-xs">SLF</span>
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-tight leading-none">STRENGTH LAB</p>
              <p className="text-cyan-400 text-[10px] font-semibold tracking-widest">BY FLUFFY</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
