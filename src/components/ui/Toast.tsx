'use client';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType; }
interface ToastCtx { toast: (message: string, type?: ToastType) => void; }

const Ctx = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            t.type === 'success' ? 'bg-[#0A1628] border-cyan-400/30 text-white' :
            t.type === 'error'   ? 'bg-[#0A1628] border-red-400/30 text-white' :
                                   'bg-[#0A1628] border-white/10 text-white'
          }`}>
            {t.type === 'success' && <span className="text-cyan-400 text-base">✓</span>}
            {t.type === 'error'   && <span className="text-red-400 text-base">✕</span>}
            {t.type === 'info'    && <span className="text-slate-400 text-base">·</span>}
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
