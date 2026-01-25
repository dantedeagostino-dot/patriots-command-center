"use client";

export default function PredictionWidget({ odds }) {
    if (!odds) return null;
    const winPct = typeof odds.prediction?.pats === 'number' ? odds.prediction.pats : 50;
    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-4 mb-4">
            <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Match Predictor</span>
                <span className="text-xs text-gray-400">Analytics</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-blue-500">{winPct}%</span>
                <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden flex">
                    <div style={{ width: `${winPct}%` }} className="h-full bg-blue-600"></div>
                    <div style={{ width: `${100 - winPct}%` }} className="h-full bg-gray-500"></div>
                </div>
                <span className="text-sm font-bold text-gray-400">{100 - winPct}%</span>
            </div>
        </div>
    );
}
