"use client";

import { useState, useEffect } from 'react';

export default function PlayerModal({ player, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const validId = player.playerId || player.id;

  useEffect(() => {
    if (validId) {
      setLoading(true);
      fetch(`/api/player?id=${validId}`)
        .then(res => {
            if(!res.ok) throw new Error("Error fetching data");
            return res.json();
        })
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }
  }, [validId]);

  if (!player) return null;

  let displayStats = [];
  let seasonTitle = "Current Season Stats";

  if (stats && stats.player_overview && stats.player_overview.statistics) {
      const apiStats = stats.player_overview.statistics;
      if(apiStats.displayName) seasonTitle = apiStats.displayName;
      
      const labels = apiStats.labels || [];
      const values = apiStats.splits?.[0]?.stats || [];

      if (labels.length > 0 && values.length > 0) {
          displayStats = labels.map((label, index) => ({
              name: label,
              value: values[index] || "-"
          }));
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full transition z-10"
        >
          ✕
        </button>

        <div className="relative h-32 bg-gradient-to-r from-blue-900 to-slate-900 flex items-end p-6">
           <img 
              src={player.headshot?.href || player.href || "https://static.www.nfl.com/image/private/f_auto,q_auto/league/nfl-placeholder"} 
              className="absolute top-4 left-6 w-24 h-24 rounded-full border-4 border-slate-900 object-cover bg-slate-800 shadow-xl"
              alt={player.displayName}
           />
           <div className="ml-28 mb-1">
              <h2 className="text-2xl font-black text-white leading-none">{player.displayName}</h2>
              <p className="text-blue-400 font-bold text-sm mt-1">
                 #{player.jersey || "--"} • {player.position?.name || "Player"}</p>
           </div>
        </div>

        <div className="p-6 pt-8 min-h-[200px]">
           {loading ? (
             <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono">Fetching data...</p>
             </div>
           ) : displayStats.length > 0 ? (
             <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-slate-800 pb-2">{seasonTitle}</h3>
                <div className="grid grid-cols-3 gap-3">
                   {displayStats.map((stat, i) => (
                      <div key={i} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
                         <span className="text-[10px] text-blue-400 font-bold uppercase">{stat.name}</span>
                         <span className="text-xl font-black text-white mt-1">{stat.value}</span>
                      </div>
                   ))}
                </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-40 text-center space-y-3 bg-slate-800/20 rounded-xl p-6 border border-slate-700/30">
                <div className="text-4xl">🛡️</div>
                <div>
                    <p className="text-white font-bold text-lg">No Stats Recorded</p>
                    <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto">
                        This player (typically Offensive Line or Special Teams) does not have standard statistical data for this season.
                    </p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
