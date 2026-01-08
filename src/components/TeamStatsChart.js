"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function TeamStatsChart({ data }) {
  if (!data || data.length === 0) return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-xs">
          No stats data available.
      </div>
  );

  return (
    <div className="w-full h-80 bg-slate-900/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
        Season Stats Evolution (Points)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorPats" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOpp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
             dataKey="oppCode"
             stroke="#94a3b8"
             tick={{fontSize: 10}}
             interval={0}
          />
          <YAxis stroke="#94a3b8" tick={{fontSize: 10}} />
          <Tooltip
             contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9'}}
             itemStyle={{fontSize: '12px'}}
             labelStyle={{color: '#94a3b8', fontSize: '10px', marginBottom: '5px'}}
          />
          <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
          <Area
             type="monotone"
             dataKey="patsScore"
             name="Patriots"
             stroke="#3b82f6"
             fillOpacity={1}
             fill="url(#colorPats)"
          />
          <Area
             type="monotone"
             dataKey="oppScore"
             name="Opponent"
             stroke="#ef4444"
             fillOpacity={1}
             fill="url(#colorOpp)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
