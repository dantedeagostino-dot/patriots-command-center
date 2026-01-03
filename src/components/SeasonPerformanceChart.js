'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

export default function SeasonPerformanceChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-64 w-full bg-slate-900/50 rounded-xl border border-slate-700 p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Season Performance (Point Differential)</h3>
         <div className="flex gap-2 text-[10px] font-bold">
            <span className="text-green-400 flex items-center">● WIN</span>
            <span className="text-red-400 flex items-center">● LOSS</span>
         </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="oppCode" 
            tick={{ fill: '#94a3b8', fontSize: 10 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            hide 
            domain={['dataMin - 5', 'dataMax + 5']} // Margen automático
          />
          <Tooltip 
            cursor={{ fill: '#1e293b', opacity: 0.4 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-xs">
                    <p className="font-bold text-white mb-1">VS {d.opponent}</p>
                    <p className="text-gray-400">{d.date}</p>
                    <p className={`font-mono font-bold text-lg mt-1 ${d.diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                       {d.diff > 0 ? '+' : ''}{d.diff} 
                       <span className="text-gray-500 text-[10px] ml-1">({d.score})</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={0} stroke="#475569" />
          <Bar dataKey="diff" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.diff > 0 ? '#4ade80' : '#f87171'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}