interface CoachNote {
  text: string;
  author: string;
  isNew: boolean;
}

export function CoachNoteCard({ note }: { note: CoachNote }) {
  return (
    <div className="relative bg-[#0A1628] border border-cyan-400/10 rounded-2xl p-5 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-cyan-400/40 to-transparent rounded-l-2xl" />

      <div className="flex items-center gap-2 mb-3">
        <p className="text-[9px] font-black text-cyan-400/70 tracking-[0.3em] uppercase">Coach Note</p>
        {note.isNew && (
          <span className="flex items-center gap-1 text-[9px] font-black text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            New
          </span>
        )}
      </div>

      <p className="text-sm text-slate-300 leading-relaxed italic">
        &quot;{note.text}&quot;
      </p>
      <p className="text-[10px] text-slate-600 mt-3 font-semibold">— {note.author}</p>
    </div>
  );
}
