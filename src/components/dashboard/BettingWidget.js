"use client";

export default function BettingWidget({ odds }) {
    if (!odds) return null;
    return (
        <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-slate-800 p-2 rounded border border-slate-700 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Spread</p>
                <p className="text-white font-mono font-bold text-xs">{String(odds.spread || "-")}</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                <p className="text-white font-mono font-bold text-xs">{String(odds.overUnder || "-")}</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Moneyline</p>
                <p className="text-white font-mono font-bold text-xs">{String(odds.moneyline || "-")}</p>
            </div>
        </div>
    );
}
