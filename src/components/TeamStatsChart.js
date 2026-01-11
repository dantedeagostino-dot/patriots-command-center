"use client";

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TeamStatsChart({ data }) {
  const [selectedMetric, setSelectedMetric] = useState('score');

  if (!data || data.length === 0) return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-xs">
          No stats data available.
      </div>
  );

  const metrics = [
    { key: 'score', label: 'Score', colorPats: '#3b82f6', colorOpp: '#94a3b8' },
    { key: 'totalYards', label: 'Total Yards', colorPats: '#3b82f6', colorOpp: '#94a3b8' }, // Blue vs Slate
    { key: 'turnovers', label: 'Turnovers', colorPats: '#3b82f6', colorOpp: '#94a3b8' },
  ];

  // Explicit mapping of keys to avoid string manipulation errors
  const METRIC_KEYS = {
      score: { pats: 'patsScore', opp: 'oppScore' },
      totalYards: { pats: 'patsTotalYards', opp: 'oppTotalYards' },
      turnovers: { pats: 'patsTurnovers', opp: 'oppTurnovers' }
  };

  const activeMetric = metrics.find(m => m.key === selectedMetric) || metrics[0];
  const keys = METRIC_KEYS[selectedMetric] || METRIC_KEYS.score;

  return (
    <div className="w-full h-96 bg-slate-900/50 rounded-xl border border-slate-700 p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Season Evolution: <span className="text-white ml-1">{activeMetric.label}</span>
          </h3>

          <div className="flex flex-wrap justify-end gap-2">
             {metrics.map(m => (
                 <button
                    key={m.key}
                    onClick={() => setSelectedMetric(m.key)}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition border ${selectedMetric === m.key ? 'bg-slate-800 text-blue-400 border-blue-500' : 'bg-slate-900 text-gray-500 border-slate-800 hover:border-slate-600'}`}
                 >
                    {m.label}
                 </button>
             ))}
          </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
             dataKey="oppCode"
             stroke="#64748b"
             tick={{fontSize: 10, fill: '#64748b'}}
             axisLine={false}
             tickLine={false}
             interval={0}
             dy={10}
          />
          <YAxis
             stroke="#64748b"
             tick={{fontSize: 10, fill: '#64748b'}}
             axisLine={false}
             tickLine={false}
          />
          <Tooltip
             contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
             itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
             labelStyle={{color: '#94a3b8', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px'}}
             formatter={(value, name) => [value, name === 'Patriots' ? 'Patriots' : 'Opponent']}
          />
          <Legend
             wrapperStyle={{fontSize: '11px', paddingTop: '15px'}}
             iconType="plainline"
          />

          {/* PATRIOTS LINE: Solid, Thick, Blue */}
          <Line
             type="monotone"
             dataKey={keys.pats}
             name="Patriots"
             stroke="#3b82f6"
             strokeWidth={4}
             dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#1e293b" }}
             activeDot={{ r: 6, strokeWidth: 0 }}
             animationDuration={1500}
          />

          {/* OPPONENT LINE: Dotted, Slate/Red */}
          <Line
             type="monotone"
             dataKey={keys.opp}
             name="Opponent"
             stroke="#94a3b8"
             strokeWidth={2}
             strokeDasharray="5 5"
             dot={{ r: 3, fill: "#94a3b8", strokeWidth: 0 }}
             activeDot={{ r: 5, strokeWidth: 0 }}
             animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
