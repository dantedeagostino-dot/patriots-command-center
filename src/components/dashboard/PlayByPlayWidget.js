"use client";

export default function PlayByPlayWidget({ plays }) {
    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-72">
            <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Play-by-Play</h3>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col">
                {(!plays || plays.length === 0) && <p className="text-gray-500 text-xs text-center mt-10">Waiting for game start...</p>}
                {plays && plays.map((play, i) => (
                    <div key={i} className="flex gap-3 text-sm border-b border-slate-800 pb-2 last:border-0 last:pb-0 animate-in fade-in slide-in-from-left-2">
                        <span className="font-mono text-blue-400 text-xs whitespace-nowrap pt-0.5">{play.clock?.displayValue || play.time}</span>
                        <p className="text-gray-300 text-xs leading-relaxed">{String(play.text)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
