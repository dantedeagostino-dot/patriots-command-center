'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ScoreTrendChart({ data }) {
  if (!data || data.length === 0) return <div className="h-full w-full bg-slate-900/10 animate-pulse rounded" />;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="time" hide />
        <YAxis hide domain={['auto', 'auto']} />
        
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#0f172a', 
            borderColor: '#334155', 
            borderRadius: '8px', 
            fontSize: '12px',
            color: '#f8fafc',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)'
          }} 
          itemStyle={{ padding: 0 }}
        />
        
        {/* Línea Patriots (Azul Brillante) */}
        <Line 
          type="monotone" 
          dataKey="pats" 
          stroke="#3b82f6" 
          strokeWidth={3} 
          dot={false} 
          activeDot={{ r: 6, fill: '#3b82f6' }}
          isAnimationActive={true} 
        />
        
        {/* Línea Oponente (Rojo/Gris para contraste) */}
        <Line 
          type="monotone" 
          dataKey="opp" 
          stroke="#94a3b8" 
          strokeWidth={2} 
          dot={false} 
          isAnimationActive={true} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}