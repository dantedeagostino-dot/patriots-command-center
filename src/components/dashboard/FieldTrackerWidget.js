"use client";

export default function FieldTrackerWidget({ game }) {
    const yardLine = game.yardLine || 50;
    const possessionTeam = game.possessionTeam || 'home';
    const down = game.down || 1;
    const distance = game.distance || 10;

    const positionPct = yardLine;

    return (
        <div className="bg-slate-900/80 rounded-xl border border-slate-700 p-4 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span> Field Radar
                </h3>
                <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600">
                    <span className="text-xs font-mono text-blue-400 font-black">
                        {down}{['st', 'nd', 'rd', 'th'][down - 1] || 'th'} & {distance}
                    </span>
                </div>
            </div>

            <div className="relative h-14 bg-gradient-to-r from-slate-800 via-slate-800/80 to-slate-800 border-x-4 border-slate-600 rounded flex items-center overflow-hidden shadow-inner">
                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(line => (
                    <div key={line} className={`absolute h-full w-[1px] ${line === 50 ? 'bg-yellow-500/30 w-[2px]' : 'bg-slate-600/30'}`} style={{ left: `${line}%` }}></div>
                ))}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500/20 -rotate-90">OPP</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500/20 rotate-90">NE</div>

                <div
                    className="absolute h-5 w-5 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full border-2 border-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.6)] z-10 transition-all duration-1000 ease-in-out flex items-center justify-center"
                    style={{ left: `${positionPct}%`, transform: 'translateX(-50%)' }}
                >
                    <span className={`text-[8px] text-black font-bold ${possessionTeam === 'home' ? 'rotate-0' : 'rotate-180'}`}>➤</span>
                </div>
                <div className="absolute h-full w-[2px] bg-yellow-400/50 z-0 transition-all duration-1000" style={{ left: `${Math.min(positionPct + (possessionTeam === 'home' ? 10 : -10), 98)}%` }}></div>
            </div>

            <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1 px-1 uppercase tracking-wider">
                <span>Own Endzone</span>
                <span>50 Yard Line</span>
                <span>Opp Endzone</span>
            </div>
        </div>
    );
}
