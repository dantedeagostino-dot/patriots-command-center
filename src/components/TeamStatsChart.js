"use client";

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TeamStatsChart({ data }) {
  const [selectedMetric, setSelectedMetric] = useState('score');

  if (!data || data.length === 0) return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-xs">
          No stats data available.
      </div>
  );

  const metrics = [
    { key: 'score', label: 'Points', colorPats: '#3b82f6', colorOpp: '#ef4444' },
    { key: 'totalYards', label: 'Total Yards', colorPats: '#10b981', colorOpp: '#f59e0b' },
    { key: 'passingYards', label: 'Passing Yards', colorPats: '#8b5cf6', colorOpp: '#f43f5e' },
    { key: 'rushingYards', label: 'Rushing Yards', colorPats: '#ec4899', colorOpp: '#6366f1' },
    { key: 'firstDowns', label: '1st Downs', colorPats: '#06b6d4', colorOpp: '#f97316' },
    { key: 'turnovers', label: 'Turnovers', colorPats: '#ef4444', colorOpp: '#22c55e' }, // Invert logic for turnovers? Usually lower is better, but chart just shows counts.
    { key: 'possession', label: 'Possession', colorPats: '#eab308', colorOpp: '#a855f7' },
  ];

  const activeMetric = metrics.find(m => m.key === selectedMetric) || metrics[0];

  // Map data to expected keys for the generic chart if needed, or just use dynamic keys
  // We need distinct keys for pats vs opp.
  // The data structure in seasonChartData currently has 'score' as "24-10" string?
  // Wait, I need to check seasonChartData again.
  // Previous code: patsScore = parseInt...
  // In DashboardTabs:
  // return { ... score: `${patsScore}-${oppScore}`, totalYards: ... }
  // Wait, I added totalYards, etc. but only single values?
  // "Debes incluir... los campos: totalYards...".
  // If I only include one value for 'totalYards', is it for Patriots? Or do I need 'patsTotalYards' and 'oppTotalYards'?
  // The user said: "Usa colores distintos para los Patriots y el Oponente."
  // This implies I need comparative data.
  // My mock in DashboardTabs was: totalYards: random(). This is just ONE number.
  // I should probably generate two numbers per metric if I want to compare.
  // "totalYards" in singular implies maybe just the team?
  // But standard "TeamStatsChart" usually compares.
  // Let's re-read: "Añade botones... ver la evolución de "Yards" o "Turnovers"... Usa colores distintos para los Patriots y el Oponente."
  // Yes, I need comparative data.
  // I need to update DashboardTabs AGAIN to provide patsTotalYards and oppTotalYards.

  // Let's assume for now I can only update TeamStatsChart.
  // If data only has `totalYards`, I can only show that.
  // But `seasonChartData` previous logic for Score had `patsScore` and `oppScore` implicitly available?
  // No, checking `seasonChartData` in `DashboardTabs.js`:
  /*
    const patsScore = parseInt(game.patriots.score) || 0;
    const oppScore = parseInt(game.opponent.score) || 0;
    return {
        ...
        diff: diff,
        score: `${patsScore}-${oppScore}`
        // Mocks added:
        totalYards: ...
    }
  */
  // I missed adding `patsScore` and `oppScore` explicitly to the returned object!
  // The original component used `dataKey="patsScore"` and `dataKey="oppScore"`.
  // Wait, looking at `TeamStatsChart.js` original code:
  // <Area type="monotone" dataKey="patsScore" ... />
  // <Area type="monotone" dataKey="oppScore" ... />
  // But `DashboardTabs.js` DOES NOT return `patsScore` and `oppScore` in the object!
  // It returns `diff`, `score` (string).
  // This means the ORIGINAL CHART WAS BROKEN or I misread `DashboardTabs.js`.

  // Let's look at `DashboardTabs.js` BEFORE my edit.
  // It had:
  /*
  const seasonChartData = history ? [...history] ... .map(...) -> {
      date, opponent, oppCode, uniqueId, diff, score
  }
  */
  // And `TeamStatsChart.js` uses `patsScore` and `oppScore`.
  // So the chart was likely empty or not working as intended, or the `history` object being mapped has those fields?
  // No, the map returns a NEW object.
  // So `patsScore` and `oppScore` were missing from the mapped object.
  // I need to add them.

  // Also for the new mocks, I should generate pairs: `patsTotalYards`, `oppTotalYards`.

  return (
    <div className="w-full h-96 bg-slate-900/50 rounded-xl border border-slate-700 p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{backgroundColor: activeMetric.colorPats}}></span>
            Season Stats: <span className="text-white ml-1">{activeMetric.label}</span>
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
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        >
          <defs>
            <linearGradient id={`gradPats-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={activeMetric.colorPats} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={activeMetric.colorPats} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id={`gradOpp-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={activeMetric.colorOpp} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={activeMetric.colorOpp} stopOpacity={0}/>
            </linearGradient>
          </defs>
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
             formatter={(value, name) => [value, name === 'patsVal' ? 'Patriots' : 'Opponent']}
          />
          <Legend
             wrapperStyle={{fontSize: '11px', paddingTop: '15px'}}
             iconType="circle"
          />
          <Area
             type="monotone"
             dataKey={selectedMetric === 'score' ? 'patsScore' : `pats${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`}
             name="Patriots"
             stroke={activeMetric.colorPats}
             strokeWidth={2}
             fillOpacity={1}
             fill={`url(#gradPats-${selectedMetric})`}
             activeDot={{r: 4, strokeWidth: 0}}
          />
          <Area
             type="monotone"
             dataKey={selectedMetric === 'score' ? 'oppScore' : `opp${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`}
             name="Opponent"
             stroke={activeMetric.colorOpp}
             strokeWidth={2}
             fillOpacity={1}
             fill={`url(#gradOpp-${selectedMetric})`}
             activeDot={{r: 4, strokeWidth: 0}}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
