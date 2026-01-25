"use client";

export default function StandingsWidget({ standings }) {
    if (!standings) return null;

    let divisionData = [];
    const findPatsDivision = (data) => {
        if (data.standings && data.standings.entries) {
            const hasPats = data.standings.entries.some(e => e.team.id === '17');
            if (hasPats) return data.standings.entries;
        }
        if (data.children) {
            for (let child of data.children) {
                const found = findPatsDivision(child);
                if (found) return found;
            }
        }
        return null;
    };

    try {
        divisionData = findPatsDivision(standings) || [];
    } catch (e) { console.error("Error parsing standings", e); }

    if (divisionData.length === 0) return null;

    return (
        <div className="bg-slate-900/80 rounded-xl border border-slate-700 overflow-hidden mb-6 shadow-lg mt-6">
            <div className="bg-slate-950/50 p-3 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span>🏆</span> AFC EAST STANDINGS
                </h3>
            </div>
            <table className="w-full text-xs text-left">
                <thead className="text-gray-500 bg-slate-900/50 uppercase font-mono text-[10px]">
                    <tr>
                        <th className="p-3 pl-4">Team</th>
                        <th className="p-3 text-center">W</th>
                        <th className="p-3 text-center">L</th>
                        <th className="p-3 text-center">PCT</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {divisionData.map((entry, i) => {
                        const isPats = entry.team.id === '17';
                        const stats = entry.stats || [];
                        const wins = stats.find(s => s.type === 'wins' || s.name === 'wins')?.value || 0;
                        const losses = stats.find(s => s.type === 'losses' || s.name === 'losses')?.value || 0;
                        const pct = stats.find(s => s.type === 'winPercent' || s.name === 'winPercent')?.value || 0;

                        return (
                            <tr key={i} className={`hover:bg-slate-800/50 transition ${isPats ? 'bg-blue-900/20 border-l-2 border-blue-500' : ''}`}>
                                <td className="p-3 pl-4 font-bold flex items-center gap-3">
                                    <span className="text-gray-600 font-mono w-3 text-right">{i + 1}</span>
                                    <img src={entry.team.logos?.[0]?.href || "https://static.www.nfl.com/image/private/f_auto,q_auto/league/nfl-placeholder"} className="w-6 h-6 object-contain" alt="" />
                                    <span className={isPats ? "text-blue-400 font-black tracking-wide" : "text-gray-300"}>
                                        {entry.team.abbreviation || entry.team.shortDisplayName}
                                    </span>
                                </td>
                                <td className="p-3 text-center font-mono text-white font-bold">{wins}</td>
                                <td className="p-3 text-center font-mono text-gray-400">{losses}</td>
                                <td className="p-3 text-center font-mono text-gray-500">.{Math.round(pct * 1000)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
