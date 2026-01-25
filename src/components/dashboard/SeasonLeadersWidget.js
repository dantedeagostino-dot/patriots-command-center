"use client";

export default function SeasonLeadersWidget({ leaders }) {
    let categories = [];

    if (leaders?.leaders && Array.isArray(leaders.leaders)) {
        categories = leaders.leaders;
    } else if (Array.isArray(leaders)) {
        categories = leaders;
    }

    if (categories.length === 0) return null;

    return (
        <div className="bg-slate-900/80 rounded-xl border border-blue-900/30 overflow-hidden flex flex-col h-full">
            <div className="bg-blue-950/20 p-3 border-b border-blue-900/20">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <span>👑</span> Season Leaders
                </h3>
            </div>
            <div className="p-4 grid gap-4 overflow-y-auto custom-scrollbar">
                {categories.map((cat, i) => {
                    const leader = cat.leaders?.[0];
                    if (!leader) return null;
                    return (
                        <div key={i} className="flex items-center gap-4 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                            <img
                                src={leader.athlete?.headshot?.href || "https://static.www.nfl.com/image/private/f_auto,q_auto/league/nfl-placeholder"}
                                className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-800 object-cover"
                                alt="Player"
                            />
                            <div className="flex-1">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">{cat.displayName}</p>
                                <p className="text-sm font-bold text-white">{leader.athlete?.displayName}</p>
                                <p className="text-xs text-blue-400 font-mono">
                                    {leader.displayValue} <span className="text-gray-600 text-[10px]">Total</span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
