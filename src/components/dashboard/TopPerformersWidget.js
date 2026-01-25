"use client";

export default function TopPerformersWidget({ stats }) {
    if (!stats) return <div className="h-72 bg-slate-900/50 rounded-xl border border-slate-700 flex items-center justify-center text-gray-500 text-xs">Loading Stats...</div>;
    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-4 h-72 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Top Performers</h3>
            {['Passing', 'Rushing', 'Receiving'].map(type => {
                const key = type.toLowerCase();
                const data = stats[key] || { name: '-', stat: '-' };
                const icon = type === 'Passing' ? '🏈' : type === 'Rushing' ? '🏃' : '👐';
                const color = type === 'Passing' ? 'text-blue-400' : type === 'Rushing' ? 'text-green-400' : 'text-purple-400';
                return (
                    <div key={key} className="flex items-center gap-4 bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-sm shadow-sm border border-slate-700">{icon}</div>
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">{type}</p>
                            <p className="font-bold text-sm text-white leading-tight">{String(data.name)}</p>
                            <p className={`text-xs ${color} font-mono`}>{String(data.stat)}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
