"use client";

export default function GameStatsModal({ game, stats, onClose }) {
    if (!game) return null;
    let teamStats = [];
    if (stats && stats.boxScore && stats.boxScore.teams) {
        teamStats = stats.boxScore.teams.map(team => {
            const getStatVal = (name) => { const s = team.statistics?.find(st => st.name === name || st.label.toLowerCase() === name.toLowerCase()); return s ? s.displayValue : "-"; };
            return { name: team.team.shortDisplayName || team.team.name, logo: team.team.logo, yards: getStatVal("totalYards"), passing: getStatVal("netPassingYards"), rushing: getStatVal("rushingYards"), turnovers: getStatVal("turnovers"), possession: getStatVal("possessionTime"), firstDowns: getStatVal("firstDowns") };
        });
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full transition z-10">✕</button>
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 text-center border-b border-slate-700"><div className="text-gray-400 text-xs uppercase tracking-widest mb-4 font-bold">{game.dateString} • {game.venue}</div><div className="flex justify-center items-center gap-8 md:gap-12"><div className="flex flex-col items-center"><img src={game.opponent.logo} className="w-16 h-16 object-contain mb-2" alt="Opp" /><span className="text-xl font-black text-white">{game.opponent.score}</span></div><div className="text-2xl font-black text-gray-600 italic">VS</div><div className="flex flex-col items-center"><img src={game.patriots.logo} className="w-16 h-16 object-contain mb-2" alt="Pats" /><span className="text-xl font-black text-white">{game.patriots.score}</span></div></div></div>
                <div className="p-6"><h3 className="text-center text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Official Game Stats</h3>{teamStats.length === 2 ? <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700"><div className="grid grid-cols-3 bg-slate-950/50 p-3 text-[10px] uppercase font-bold text-gray-500 text-center border-b border-slate-700"><div>{teamStats[0].name}</div><div>Stat</div><div>{teamStats[1].name}</div></div>{[{ label: "Total Yards", key: "yards" }, { label: "Passing Yards", key: "passing" }, { label: "Rushing Yards", key: "rushing" }, { label: "1st Downs", key: "firstDowns" }, { label: "Turnovers", key: "turnovers" }, { label: "Possession", key: "possession" }].map((row, i) => (<div key={i} className="grid grid-cols-3 p-3 text-sm text-center border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20"><div className="font-mono font-bold text-white">{teamStats[0][row.key]}</div><div className="text-gray-400 text-xs uppercase">{row.label}</div><div className="font-mono font-bold text-white">{teamStats[1][row.key]}</div></div>))}</div> : <div className="text-center py-8 text-gray-500"><p>Detailed stats not available.</p></div>}</div>
            </div>
        </div>
    );
}
