'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

export default function SeasonPerformanceChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-4 mb-6 h-64">
      <div className="flex justify-between items-center mb-2">
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Season Trend (Point Differential)</h3>
         <div className="flex gap-3 text-[10px] font-bold">
            <span className="text-green-400 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span> WIN</span>
            <span className="text-red-400 flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full"></span> LOSS</span>
         </div>
      </div>
      
      <div className="h-full w-full pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="uniqueId" 
              tickFormatter={(val) => val.split('_')[0]} // ⚠️ AQUÍ ESTÁ EL TRUCO: Mostramos solo el nombre
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
              axisLine={false} 
              tickLine={false}
              interval={0}
            />
            <Tooltip 
              cursor={{ fill: '#1e293b', opacity: 0.4 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl text-xs z-50">
                      <p className="font-bold text-white mb-1 uppercase tracking-wide">VS {d.opponent}</p>
                      <p className="text-gray-500 mb-2">{d.date}</p>
                      <div className="flex justify-between gap-4 border-t border-slate-800 pt-2">
                        <span className="text-gray-400">Result:</span>
                        <span className={`font-mono font-bold ${d.diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                           {d.score} ({d.diff > 0 ? '+' : ''}{d.diff})
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
            <Bar dataKey="diff" radius={[2, 2, 2, 2]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.diff > 0 ? '#4ade80' : '#f87171'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}