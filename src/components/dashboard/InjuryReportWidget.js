"use client";

export default function InjuryReportWidget({ injuries }) {
    let list = [];

    if (injuries?.injuries && Array.isArray(injuries.injuries)) {
        list = injuries.injuries;
    } else if (Array.isArray(injuries)) {
        list = injuries;
    }

    if (list.length === 0) return null;

    return (
        <div className="bg-slate-900/80 rounded-xl border border-red-900/30 overflow-hidden h-full">
            <div className="bg-red-950/20 p-3 border-b border-red-900/20 flex justify-between items-center">
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <span>🚑</span> Injury Report
                </h3>
                <span className="text-[10px] text-gray-500">{list.length} Active</span>
            </div>
            <div className="max-h-60 overflow-y-auto p-0 custom-scrollbar">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-gray-500 font-mono text-[10px] uppercase">
                        <tr>
                            <th className="p-3 font-normal">Player</th>
                            <th className="p-3 font-normal">Pos</th>
                            <th className="p-3 font-normal">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {list.map((inj, i) => (
                            <tr key={i} className="hover:bg-slate-800/50 transition">
                                <td className="p-3 font-bold text-gray-200">{inj.athlete?.displayName || "Unknown"}</td>
                                <td className="p-3 text-gray-500">{inj.athlete?.position?.abbreviation || "-"}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                            ${inj.status === 'Out' || inj.status === 'Injured Reserve' ? 'bg-red-900/50 text-red-200' : 'bg-yellow-900/50 text-yellow-200'}
                         `}>
                                        {inj.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
