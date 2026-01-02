"use client"; 

import { useState, useEffect } from 'react';
import ScoreTrendChart from './ScoreTrendChart';

// --- CONFIGURACIÓN ---
const TEST_LIVE_MODE = true; // ✅ MODO SIMULACIÓN ACTIVADO
const POLLING_INTERVAL = 30000; 

// --- MOCKS (Para simulación) ---
const MOCK_PLAYS = [
  { id: 1, time: "Q4 01:58", text: "Two-Minute Warning.", type: "system" },
  { id: 2, time: "Q4 02:05", text: "D.Maye pass short right to D.Douglas to NE 45 for 8 yards.", type: "play" },
  { id: 3, time: "Q4 02:45", text: "R.Stevenson right tackle to NE 37 for 4 yards.", type: "play" },
  { id: 4, time: "Q4 03:10", text: "SCORING DRIVE: 8 plays, 75 yards, 04:20.", type: "score" }
];
const MOCK_STATS = { passing: { name: "D. Maye", stat: "245 Yds", sub: "2 TD" }, rushing: { name: "R. Stevenson", stat: "89 Yds", sub: "18 Car" }, receiving: { name: "D. Douglas", stat: "76 Yds", sub: "6 Rec" } };
const MOCK_ODDS = { spread: "-3.5 Pats", overUnder: "44.5", moneyline: "-180", prediction: { pats: 65, opp: 35 } };
const MOCK_CHART_DATA = [{ time: 'Q1', pats: 0, opp: 0 }, { time: 'Q2', pats: 10, opp: 7 }, { time: 'Q3', pats: 17, opp: 17 }, { time: 'Q4', pats: 27, opp: 24 }];

// --- COMPONENTES AUXILIARES ---

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      if (distance < 0) { setTimeLeft("GAME TIME!"); clearInterval(timer); return; }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return <div className="text-4xl font-mono text-yellow-400 font-bold my-4">{timeLeft}</div>;
}

function PredictionWidget({ odds }) {
  if (!odds) return null;
  // Aseguramos que sea un número
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
             <div style={{ width: `${100-winPct}%` }} className="h-full bg-gray-500"></div>
          </div>
          <span className="text-sm font-bold text-gray-400">{100-winPct}%</span>
       </div>
    </div>
  );
}

function BettingWidget({ odds }) {
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

function PlayByPlayWidget({ plays }) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-64">
      <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Play-by-Play</h3>
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      </div>
      <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col-reverse">
         {(!plays || plays.length === 0) && <p className="text-gray-500 text-xs text-center">Waiting for game start...</p>}
         {plays && plays.map((play, i) => (
           <div key={i} className="flex gap-3 text-sm border-b border-slate-800 pb-2 last:border-0">
              <span className="font-mono text-blue-400 text-xs whitespace-nowrap">{play.clock?.displayValue || play.time}</span>
              <p className="text-gray-300 text-xs">{String(play.text)}</p>
           </div>
         ))}
      </div>
    </div>
  );
}

function TopPerformersWidget({ stats }) {
  if (!stats) return <div className="h-64 flex items-center justify-center text-gray-500 text-xs">Loading Stats...</div>;
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-4 h-64 flex flex-col justify-between">
       <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Top Performers</h3>
       {['Passing', 'Rushing', 'Receiving'].map(type => {
          const key = type.toLowerCase();
          const data = stats[key] || { name: '-', stat: '-' };
          const icon = type === 'Passing' ? '🏈' : type === 'Rushing' ? '🏃' : '👐';
          const color = type === 'Passing' ? 'text-blue-400' : type === 'Rushing' ? 'text-green-400' : 'text-purple-400';
          return (
             <div key={key} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm">{icon}</div>
                <div>
                   <p className="text-[10px] text-gray-500 uppercase">{type}</p>
                   <p className="font-bold text-sm text-white">{String(data.name)}</p>
                   <p className={`text-xs ${color}`}>{String(data.stat)}</p>
                </div>
             </div>
          );
       })}
    </div>
  );
}

function NewsSection({ news }) {
  if (!news || news.length === 0) return null;
  return (
    <div className="mb-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border-l-4 border-blue-500 pl-3">Latest Team News</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.slice(0, 4).map((item, i) => (
           <a key={i} href={item.link} target="_blank" className="bg-slate-800 p-4 rounded hover:bg-slate-700 transition border border-slate-700 group">
              <h4 className="font-bold text-sm text-gray-200 group-hover:text-blue-300 line-clamp-2">{String(item.title)}</h4>
              <p className="text-xs text-gray-500 mt-2">{String(item.source || "NFL News")}</p>
           </a>
        ))}
      </div>
    </div>
  );
}

// --- NUEVO COMPONENTE: LISTA DE JUGADORES ---
function RosterList({ players }) {
  const [search, setSearch] = useState("");
  
  if (!players || players.length === 0) return <div className="text-center p-10 text-gray-500">Loading roster...</div>;

  const filteredPlayers = players.filter(p => 
     p.displayName?.toLowerCase().includes(search.toLowerCase()) || 
     p.position?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
       {/* Barra de Búsqueda */}
       <div className="mb-6 sticky top-0 bg-[#050B14] z-10 py-2">
          <input 
            type="text" 
            placeholder="Search player by name or position..." 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
       </div>

       {/* Grid de Jugadores */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPlayers.map((player, i) => (
             <div key={player.id || i} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition group relative">
                <div className="h-2 bg-gradient-to-r from-blue-900 to-red-900"></div>
                <div className="p-4 flex flex-col items-center">
                   <div className="w-16 h-16 rounded-full bg-slate-700 mb-3 overflow-hidden border-2 border-slate-600 group-hover:border-blue-400 transition">
                      <img 
                        src={player.headshot?.href || player.href || "https://static.www.nfl.com/image/private/f_auto,q_auto/league/nfl-placeholder"} 
                        alt={player.displayName} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://static.www.nfl.com/image/private/f_auto,q_auto/league/nfl-placeholder"; }}
                      />
                   </div>
                   <h4 className="font-bold text-sm text-center text-white">{player.displayName}</h4>
                   <p className="text-xs text-blue-400 font-bold mt-1">{player.position?.abbreviation || player.position?.name || "N/A"}</p>
                   
                   <div className="flex gap-2 mt-3 text-[10px] text-gray-500 uppercase font-bold">
                      <span className="bg-slate-900 px-2 py-1 rounded">#{player.jersey || "--"}</span>
                   </div>
                </div>
             </div>
          ))}
       </div>
       {filteredPlayers.length === 0 && <p className="text-center text-gray-500 mt-10">No players found matching "{search}"</p>}
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---

export default function DashboardTabs({ history, nextGame, upcoming, news, players }) {
  const [activeTab, setActiveTab] = useState('next');
  
  // ESTADOS
  const [livePlays, setLivePlays] = useState([]);
  const [liveStats, setLiveStats] = useState(null);
  const [liveOdds, setLiveOdds] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Simulador
  const displayGame = TEST_LIVE_MODE && nextGame ? {
      ...nextGame, 
      isLive: true, 
      status: "Q4 - 01:58",
      patriots: { 
          ...nextGame.patriots, 
          score: "27",
          // Seguridad extra: Aseguramos que name sea string
          name: String(nextGame.patriots.name || "Patriots")
      },
      opponent: { 
          ...nextGame.opponent, 
          score: "24",
          // Seguridad extra: Aseguramos que name sea string
          name: String(nextGame.opponent.name || "Opponent")
      }
  } : nextGame;

  useEffect(() => {
    // 1. MODO SIMULACIÓN
    if (TEST_LIVE_MODE) {
        setLivePlays(MOCK_PLAYS);
        setLiveStats(MOCK_STATS);
        setLiveOdds(MOCK_ODDS);
        setChartData(MOCK_CHART_DATA);
        return;
    }

    // 2. MODO REAL
    if (!nextGame || !nextGame.isLive) return;

    const fetchLiveData = async () => {
      try {
        const res = await fetch(`/api/live?id=${nextGame.id}`);
        const data = await res.json();
        
        if (data.plays) {
           const plays = data.plays.drives?.current?.plays || data.plays.plays || []; 
           setLivePlays(plays);
        }
        
        if (data.odds) {
           const provider = data.odds.pickcenter?.[0] || {};
           setLiveOdds({
              spread: provider.spread || "-",
              overUnder: provider.overUnder || "-",
              moneyline: provider.moneyline || "-"
           });
        }
        
        setLiveStats({ passing: {name:"-", stat:"-"}, rushing: {name:"-", stat:"-"}, receiving: {name:"-", stat:"-"} }); 

      } catch (e) { console.error(e); }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, POLLING_INTERVAL);
    return () => clearInterval(interval);

  }, [nextGame]);

  return (
    <div className="w-full">
      <div className="flex border-b border-slate-700 mb-6 bg-slate-900/50 rounded-t-xl overflow-hidden overflow-x-auto">
        {['history', 'next', 'upcoming', 'roster'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[100px] py-4 text-xs md:text-sm font-bold tracking-wider uppercase transition-colors whitespace-nowrap
              ${activeTab === tab ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-white hover:bg-slate-800'}`}
          >
            {tab === 'history' ? 'History' : tab === 'roster' ? 'Team Roster' : tab === 'upcoming' ? 'Upcoming' : tab}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <NewsSection news={news} />
            <div className="space-y-3">
              {history.length > 0 ? history.map(game => (
                 <div key={game.id} className="flex items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <span className="text-gray-400 text-xs w-20">{game.dateString}</span>
                    <div className="flex items-center gap-4 font-bold">
                      <img src={game.opponent.logo} className="w-6 h-6 object-contain" alt="Opp" />
                      <span>{game.patriots.score} - {game.opponent.score}</span>
                      <img src={game.patriots.logo} className="w-6 h-6 object-contain" alt="Pats" />
                    </div>
                    <span className={`text-[10px] uppercase font-bold w-20 text-right ${parseInt(game.patriots.score) > parseInt(game.opponent.score) ? 'text-green-400' : 'text-red-400'}`}>
                      {game.status}
                    </span>
                 </div>
              )) : <div className="text-center p-10 text-gray-500">No games completed yet.</div>}
            </div>
          </div>
        )}

        {activeTab === 'next' && (
          <div className="animate-in fade-in zoom-in duration-500">
             {displayGame ? (
               <div className="space-y-6">
                  <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 border border-blue-900/50 text-center relative shadow-2xl">
                      {displayGame.isLive && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full animate-pulse shadow-lg shadow-red-900/50">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          <span className="text-[10px] font-bold text-white tracking-widest">LIVE</span>
                        </div>
                      )}

                      <h2 className="text-blue-500 tracking-[0.3em] text-xs font-bold mb-6 uppercase">
                        {displayGame.isLive ? "Live Action" : "Next Battle"}
                      </h2>
                      
                      <div className="flex justify-center items-center gap-4 md:gap-12 mb-6">
                          <div className="flex flex-col items-center w-1/3">
                              <img src={displayGame.patriots.logo} className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-lg" alt="Pats" />
                              <h3 className="text-xl md:text-2xl font-black mt-4">{String(displayGame.patriots.name)}</h3>
                          </div>
                          
                          {displayGame.isLive ? (
                            <div className="flex flex-col items-center">
                               <div className="text-5xl md:text-7xl font-mono font-black text-white tracking-tighter">
                                  {displayGame.patriots.score}<span className="text-gray-600 mx-2">-</span>{displayGame.opponent.score}
                               </div>
                               <span className="text-red-400 font-bold mt-2 animate-pulse font-mono text-lg">{displayGame.status}</span>
                            </div>
                          ) : (
                            <div className="text-3xl font-black text-slate-700 italic">VS</div>
                          )}

                          <div className="flex flex-col items-center w-1/3">
                              <img src={displayGame.opponent.logo} className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-lg" alt="Opp" />
                              <h3 className="text-xl md:text-2xl font-black mt-4">{String(displayGame.opponent.name)}</h3>
                          </div>
                      </div>

                      <div className="max-w-md mx-auto">
                          <BettingWidget odds={liveOdds} />
                          <PredictionWidget odds={liveOdds} />
                      </div>
                  </div>

                  {displayGame.isLive ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700 h-64">
                           <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Score Trend</p>
                           <ScoreTrendChart data={chartData} />
                        </div>
                        <PlayByPlayWidget plays={livePlays} />
                        <TopPerformersWidget stats={liveStats} />
                    </div>
                  ) : (
                    <div className="bg-black/40 rounded-xl p-6 backdrop-blur-sm border border-white/5 mx-auto max-w-2xl text-center">
                       <p className="text-blue-400 text-xs font-bold uppercase mb-2 tracking-widest">Kickoff Countdown</p>
                       <Countdown targetDate={displayGame.dateRaw} />
                    </div>
                  )}

               </div>
             ) : <div className="text-center p-10 text-gray-500">No scheduled game found.</div>}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             {upcoming.length > 0 ? upcoming.map(game => (
               <div key={game.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center gap-4 hover:bg-slate-750 transition">
                  <div className="text-center w-14 bg-slate-900 rounded p-2 border border-slate-800">
                     <span className="block text-sm font-bold text-blue-400">{game.dateString.split(' ')[0]}</span>
                     <span className="block text-[10px] text-gray-400 uppercase">{game.dateString.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-500 text-[10px] font-bold">VS</span>
                        <span className="font-bold text-white">{String(game.opponent.name)}</span>
                     </div>
                     <p className="text-[10px] text-gray-500 uppercase tracking-wider">{game.venue}</p>
                  </div>
                  <img src={game.opponent.logo} className="w-10 h-10 object-contain opacity-80" alt="Logo" />
               </div>
             )) : <div className="text-center p-10 text-gray-500 col-span-2">No more games scheduled.</div>}
          </div>
        )}

        {/* --- NUEVA PESTAÑA: ROSTER --- */}
        {activeTab === 'roster' && (
           <RosterList players={players} />
        )}
      </div>
    </div>
  );
}