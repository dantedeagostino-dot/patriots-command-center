"use client"; 

import { useState, useEffect } from 'react';
import ScoreTrendChart from './ScoreTrendChart';

// --- CONFIGURACIÓN ---
const TEST_LIVE_MODE = false; 
const POLLING_INTERVAL = 15000; 

// --- MOCKS (Respaldo) ---
const MOCK_PLAYS = [];
const MOCK_STATS = { passing: { name: "-", stat: "-" }, rushing: { name: "-", stat: "-" }, receiving: { name: "-", stat: "-" } };
const MOCK_ODDS = { spread: "-", overUnder: "-", moneyline: "-" };
const MOCK_CHART_DATA = [];

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

// --- NUEVO: WIDGET DE POSICIONES ---
function StandingsWidget({ standings }) {
  if (!standings) return null;

  let divisionData = [];
  const findPatsDivision = (data) => {
      if (data.standings && data.standings.entries) {
          const hasPats = data.standings.entries.some(e => e.team.id === '17');
          if (hasPats) return data.standings.entries;
      }
      if (data.children) {
          for (let child of data.children) {
              const found = findPatsDivision(child);
              if (found) return found;
          }
      }
      return null;
  };

  try {
      divisionData = findPatsDivision(standings) || [];
  } catch (e) { console.error("Error parsing standings", e); }

  if (divisionData.length === 0) return null;

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-700 overflow-hidden mb-6 shadow-lg">
       <div className="bg-slate-950/50 p-3 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
             <span>🏆</span> AFC EAST STANDINGS
          </h3>
       </div>
       <table className="w-full text-xs text-left">
          <thead className="text-gray-500 bg-slate-900/50 uppercase font-mono text-[10px]">
             <tr>
                <th className="p-3 pl-4">Team</th>
                <th className="p-3 text-center">W</th>
                <th className="p-3 text-center">L</th>
                <th className="p-3 text-center">PCT</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
             {divisionData.map((entry, i) => {
                 const isPats = entry.team.id === '17';
                 const stats = entry.stats || [];
                 const wins = stats.find(s => s.type === 'wins' || s.name === 'wins')?.value || 0;
                 const losses = stats.find(s => s.type === 'losses' || s.name === 'losses')?.value || 0;
                 const pct = stats.find(s => s.type === 'winPercent' || s.name === 'winPercent')?.value || 0;
                 
                 return (
                   <tr key={i} className={`hover:bg-slate-800/50 transition ${isPats ? 'bg-blue-900/20 border-l-2 border-blue-500' : ''}`}>
                      <td className="p-3 pl-4 font-bold flex items-center gap-3">
                         <span className="text-gray-600 font-mono w-3 text-right">{i + 1}</span>
                         <img src={entry.team.logos?.[0]?.href || "https://static.www.nfl.com/image/private/f_auto,q_auto/league/nfl-placeholder"} className="w-6 h-6 object-contain" alt="" />
                         <span className={isPats ? "text-blue-400 font-black tracking-wide" : "text-gray-300"}>
                            {entry.team.abbreviation || entry.team.shortDisplayName}
                         </span>
                      </td>
                      <td className="p-3 text-center font-mono text-white font-bold">{wins}</td>
                      <td className="p-3 text-center font-mono text-gray-400">{losses}</td>
                      <td className="p-3 text-center font-mono text-gray-500">.{Math.round(pct * 1000)}</td>
                   </tr>
                 );
             })}
          </tbody>
       </table>
    </div>
  );
}

function InjuryReportWidget({ injuries }) {
  const rawList = injuries?.data?.injuries || injuries?.injuries || injuries || [];
  const list = Array.isArray(rawList) ? rawList : [];
  if (list.length === 0) return null;

  return (
    <div className="bg-slate-900/80 rounded-xl border border-red-900/30 overflow-hidden h-full">
       <div className="bg-red-950/20 p-3 border-b border-red-900/20 flex justify-between items-center">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
             <span>🚑</span> Injury Report
          </h3>
          <span className="text-[10px] text-gray-500">{list.length} Active</span>
       </div>
       <div className="max-h-60 overflow-y-auto p-0 custom-scrollbar">
          <table className="w-full text-left text-xs">
             <thead className="bg-slate-950 text-gray-500 font-mono text-[10px] uppercase">
                <tr>
                   <th className="p-3 font-normal">Player</th>
                   <th className="p-3 font-normal">Pos</th>
                   <th className="p-3 font-normal">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-800">
                {list.map((inj, i) => (
                   <tr key={i} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 font-bold text-gray-200">{inj.athlete?.displayName || "Unknown"}</td>
                      <td className="p-3 text-gray-500">{inj.athlete?.position?.abbreviation || "-"}</td>
                      <td className="p-3">
                         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                            ${inj.status === 'Out' || inj.status === 'Injured Reserve' ? 'bg-red-900/50 text-red-200' : 'bg-yellow-900/50 text-yellow-200'}
                         `}>
                            {inj.status}
                         </span>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}

function SeasonLeadersWidget({ leaders }) {
  const rawList = leaders?.data || leaders?.leaders || leaders || [];
  const categories = Array.isArray(rawList) ? rawList : [];
  if (categories.length === 0) return null;

  return (
    <div className="bg-slate-900/80 rounded-xl border border-blue-900/30 overflow-hidden flex flex-col h-full">
       <div className="bg-blue-950/20 p-3 border-b border-blue-900/20">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
             <span>👑</span> Season Leaders
          </h3>
       </div>
       <div className="p-4 grid gap-4 overflow-y-auto custom-scrollbar">
          {categories.map((cat, i) => {
             const leader = cat.leaders?.[0]; 
             if(!leader) return null;
             return (
                <div key={i} className="flex items-center gap-4 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                   <img 
                      src={leader.athlete?.headshot?.href || "https://static.www.nfl.com/image/private/f_auto,q_auto/league/nfl-placeholder"} 
                      className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-800 object-cover"
                      alt="Player"
                   />
                   <div className="flex-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{cat.displayName}</p>
                      <p className="text-sm font-bold text-white">{leader.athlete?.displayName}</p>
                      <p className="text-xs text-blue-400 font-mono">
                         {leader.displayValue} <span className="text-gray-600 text-[10px]">Total</span>
                      </p>
                   </div>
                </div>
             );
          })}
       </div>
    </div>
  );
}

// --- MODAL DE JUGADOR ---
function PlayerModal({ player, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const validId = player.playerId || player.id;

  useEffect(() => {
    if (validId) {
      setLoading(true);
      setErrorMsg("");
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
            setErrorMsg("Connection failed");
            setLoading(false);
        });
    } else {
        setErrorMsg("Invalid Player ID");
        setLoading(false);
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
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full transition z-10">✕</button>
        <div className="relative h-32 bg-gradient-to-r from-blue-900 to-slate-900 flex items-end p-6">
           <img src={player.headshot?.href || player.href || "https://static.www.nfl.com/image/private/f_auto,q_auto/league/nfl-placeholder"} className="absolute top-4 left-6 w-24 h-24 rounded-full border-4 border-slate-900 object-cover bg-slate-800 shadow-xl" alt={player.displayName}/>
           <div className="ml-28 mb-1">
              <h2 className="text-2xl font-black text-white leading-none">{player.displayName}</h2>
              <p className="text-blue-400 font-bold text-sm mt-1">#{player.jersey || "--"} • {player.position?.name || "Player"}</p>
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
                <div><p className="text-white font-bold text-lg">No Stats Recorded</p><p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto">This player (typically Offensive Line or Special Teams) does not have standard statistical data for this season.</p></div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

// --- NUEVO: MODAL DE ESTADÍSTICAS DE JUEGO (GAME STATS) ---
function GameStatsModal({ game, stats, onClose }) {
  if (!game) return null;

  // Intentar parsear el Box Score para obtener estadísticas de equipo
  let teamStats = [];
  if (stats && stats.boxScore && stats.boxScore.teams) {
      teamStats = stats.boxScore.teams.map(team => {
          const getStatVal = (name) => {
              const s = team.statistics?.find(st => st.name === name || st.label.toLowerCase() === name.toLowerCase());
              return s ? s.displayValue : "-";
          };
          return {
              name: team.team.shortDisplayName || team.team.name,
              logo: team.team.logo,
              yards: getStatVal("totalYards"),
              passing: getStatVal("netPassingYards"),
              rushing: getStatVal("rushingYards"),
              turnovers: getStatVal("turnovers"),
              possession: getStatVal("possessionTime"),
              firstDowns: getStatVal("firstDowns")
          };
      });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full transition z-10">✕</button>
        
        {/* Cabecera del Partido */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 text-center border-b border-slate-700">
            <div className="text-gray-400 text-xs uppercase tracking-widest mb-4 font-bold">{game.dateString} • {game.venue}</div>
            <div className="flex justify-center items-center gap-8 md:gap-12">
                <div className="flex flex-col items-center">
                    <img src={game.opponent.logo} className="w-16 h-16 object-contain mb-2" alt="Opp"/>
                    <span className="text-xl font-black text-white">{game.opponent.score}</span>
                </div>
                <div className="text-2xl font-black text-gray-600 italic">VS</div>
                <div className="flex flex-col items-center">
                    <img src={game.patriots.logo} className="w-16 h-16 object-contain mb-2" alt="Pats"/>
                    <span className="text-xl font-black text-white">{game.patriots.score}</span>
                </div>
            </div>
        </div>

        {/* Tabla Comparativa */}
        <div className="p-6">
            <h3 className="text-center text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Official Game Stats</h3>
            
            {teamStats.length === 2 ? (
                <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700">
                    <div className="grid grid-cols-3 bg-slate-950/50 p-3 text-[10px] uppercase font-bold text-gray-500 text-center border-b border-slate-700">
                        <div>{teamStats[0].name}</div>
                        <div>Stat</div>
                        <div>{teamStats[1].name}</div>
                    </div>
                    {[
                        { label: "Total Yards", key: "yards" },
                        { label: "Passing Yards", key: "passing" },
                        { label: "Rushing Yards", key: "rushing" },
                        { label: "1st Downs", key: "firstDowns" },
                        { label: "Turnovers", key: "turnovers" },
                        { label: "Possession", key: "possession" }
                    ].map((row, i) => (
                        <div key={i} className="grid grid-cols-3 p-3 text-sm text-center border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20">
                            <div className="font-mono font-bold text-white">{teamStats[0][row.key]}</div>
                            <div className="text-gray-400 text-xs uppercase">{row.label}</div>
                            <div className="font-mono font-bold text-white">{teamStats[1][row.key]}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>Detailed stats not available for this game.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

// --- LISTA DE JUGADORES ---
function RosterList({ players }) {
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null); 
  
  if (!players || players.length === 0) return null; 

  const filteredPlayers = players.filter(p => 
     (p.displayName && p.displayName.toLowerCase().includes(search.toLowerCase())) || 
     (p.position && p.position.name && p.position.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
       {selectedPlayer && <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
       <div className="mb-6 sticky top-0 bg-[#050B14] z-10 py-2">
          <input type="text" placeholder="Search player by name or position..." className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition" value={search} onChange={(e) => setSearch(e.target.value)} />
       </div>
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPlayers.map((player, i) => (
             <button key={player.id || player.playerId || i} onClick={() => setSelectedPlayer(player)} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 hover:scale-[1.02] transition group relative text-left w-full focus:outline-none">
                <div className="h-2 bg-gradient-to-r from-blue-900 to-red-900"></div>
                <div className="p-4 flex flex-col items-center">
                   <div className="w-16 h-16 rounded-full bg-slate-700 mb-3 overflow-hidden border-2 border-slate-600 group-hover:border-blue-400 transition">
                      <img src={player.headshot?.href || player.href || "https://static.www.nfl.com/image/private/f_auto,q_auto/league/nfl-placeholder"} alt={player.displayName} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://static.www.nfl.com/image/private/f_auto,q_auto/league/nfl-placeholder"; }}/>
                   </div>
                   <h4 className="font-bold text-sm text-center text-white">{player.displayName || "Unknown Player"}</h4>
                   <p className="text-xs text-blue-400 font-bold mt-1">{player.position?.abbreviation || player.position?.name || "N/A"}</p>
                   <div className="flex gap-2 mt-3 text-[10px] text-gray-500 uppercase font-bold"><span className="bg-slate-900 px-2 py-1 rounded">#{player.jersey || "--"}</span></div>
                </div>
             </button>
          ))}
       </div>
       {filteredPlayers.length === 0 && <p className="text-center text-gray-500 mt-10">No players found matching "{search}"</p>}
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---

export default function DashboardTabs({ history, nextGame, upcoming, news, players, debugData, leaders, injuries, standings }) {
  const [activeTab, setActiveTab] = useState('next');
  
  // Live Game State
  const [livePlays, setLivePlays] = useState([]);
  const [liveStats, setLiveStats] = useState(null);
  const [liveOdds, setLiveOdds] = useState(null);
  const [chartData, setChartData] = useState([]);

  // History Game State
  const [selectedHistoryGame, setSelectedHistoryGame] = useState(null);
  const [historyGameStats, setHistoryGameStats] = useState(null);

  // Simulador
  const displayGame = TEST_LIVE_MODE && nextGame ? {
      ...nextGame, isLive: true, status: "Q4 - 01:58",
      patriots: { ...nextGame.patriots, score: "27", name: String(nextGame.patriots.name || "Patriots") },
      opponent: { ...nextGame.opponent, score: "24", name: String(nextGame.opponent.name || "Opponent") }
  } : nextGame;

  // Cargar datos en vivo
  useEffect(() => {
    if (TEST_LIVE_MODE) {
        setLivePlays(MOCK_PLAYS); setLiveStats(MOCK_STATS); setLiveOdds(MOCK_ODDS); setChartData(MOCK_CHART_DATA); return;
    }
    if (!nextGame || !nextGame.isLive) return;

    const fetchLiveData = async () => {
      try {
        const res = await fetch(`/api/live?id=${nextGame.id}`);
        const data = await res.json();
        if (data.plays) setLivePlays(data.plays.drives?.current?.plays || data.plays.plays || []);
        if (data.odds) {
           const provider = data.odds.pickcenter?.[0] || {};
           setLiveOdds({ spread: provider.spread || "-", overUnder: provider.overUnder || "-", moneyline: provider.moneyline || "-" });
        }
        setLiveStats({ passing: {name:"-", stat:"-"}, rushing: {name:"-", stat:"-"}, receiving: {name:"-", stat:"-"} }); 
      } catch (e) { console.error(e); }
    };
    fetchLiveData();
    const interval = setInterval(fetchLiveData, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [nextGame]);

  // Manejar click en historial
  const handleHistoryClick = async (game) => {
      setSelectedHistoryGame(game);
      setHistoryGameStats(null); // Resetear stats anteriores
      try {
          // Reutilizamos la API de Live porque también trae boxscores de juegos pasados
          const res = await fetch(`/api/live?id=${game.id}`);
          if (res.ok) {
              const data = await res.json();
              setHistoryGameStats(data);
          }
      } catch (error) {
          console.error("Error fetching history stats:", error);
      }
  };

  return (
    <div className="w-full">
      {selectedHistoryGame && (
          <GameStatsModal 
            game={selectedHistoryGame} 
            stats={historyGameStats} 
            onClose={() => setSelectedHistoryGame(null)} 
          />
      )}

      <div className="flex border-b border-slate-700 mb-6 bg-slate-900/50 rounded-t-xl overflow-hidden overflow-x-auto">
        {['history', 'next', 'upcoming', 'roster'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-[100px] py-4 text-xs md:text-sm font-bold tracking-wider uppercase transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-white hover:bg-slate-800'}`}>
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
                 <button 
                    key={game.id} 
                    onClick={() => handleHistoryClick(game)}
                    className="w-full flex items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-700 hover:bg-slate-700 hover:border-blue-500 transition group text-left"
                 >
                    <span className="text-gray-400 text-xs w-20 group-hover:text-white transition">{game.dateString}</span>
                    <div className="flex items-center gap-4 font-bold">
                      <img src={game.opponent.logo} className="w-6 h-6 object-contain" alt="Opp" />
                      <span>{game.patriots.score} - {game.opponent.score}</span>
                      <img src={game.patriots.logo} className="w-6 h-6 object-contain" alt="Pats" />
                    </div>
                    <span className={`text-[10px] uppercase font-bold w-20 text-right ${parseInt(game.patriots.score) > parseInt(game.opponent.score) ? 'text-green-400' : 'text-red-400'}`}>
                      {game.status}
                    </span>
                 </button>
              )) : <div className="text-center p-10 text-gray-500">No games completed yet.</div>}
            </div>
            <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-widest">Click on any game to view detailed stats</p>
          </div>
        )}

        {activeTab === 'next' && (
          <div className="animate-in fade-in zoom-in duration-500">
             {displayGame ? (
               <div className="space-y-6">
                  <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 border border-blue-900/50 text-center relative shadow-2xl">
                      {displayGame.isLive && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full animate-pulse shadow-lg shadow-red-900/50">
                          <span className="w-2 h-2 bg-white rounded-full"></span><span className="text-[10px] font-bold text-white tracking-widest">LIVE</span>
                        </div>
                      )}
                      <h2 className="text-blue-500 tracking-[0.3em] text-xs font-bold mb-6 uppercase">{displayGame.isLive ? "Live Action" : "Next Battle"}</h2>
                      <div className="flex justify-center items-center gap-4 md:gap-12 mb-6">
                          <div className="flex flex-col items-center w-1/3">
                              <img src={displayGame.patriots.logo} className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-lg" alt="Pats" />
                              <h3 className="text-xl md:text-2xl font-black mt-4">{String(displayGame.patriots.name)}</h3>
                          </div>
                          {displayGame.isLive ? (
                            <div className="flex flex-col items-center">
                                <div className="text-5xl md:text-7xl font-mono font-black text-white tracking-tighter">{displayGame.patriots.score}<span className="text-gray-600 mx-2">-</span>{displayGame.opponent.score}</div>
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
                      <div className="max-w-md mx-auto"><BettingWidget odds={liveOdds} /><PredictionWidget odds={liveOdds} /></div>
                  </div>

                  {displayGame.isLive ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700 h-64"><p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Score Trend</p><ScoreTrendChart data={chartData} /></div>
                        <PlayByPlayWidget plays={livePlays} />
                        <TopPerformersWidget stats={liveStats} />
                    </div>
                  ) : (
                    <div className="space-y-6">
                       <div className="bg-black/40 rounded-xl p-6 backdrop-blur-sm border border-white/5 mx-auto max-w-2xl text-center"><p className="text-blue-400 text-xs font-bold uppercase mb-2 tracking-widest">Kickoff Countdown</p><Countdown targetDate={displayGame.dateRaw} /></div>
                       <StandingsWidget standings={standings} />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700"><SeasonLeadersWidget leaders={leaders} /><InjuryReportWidget injuries={injuries} /></div>
                    </div>
                  )}
               </div>
             ) : <div className="text-center p-10 text-gray-500">No scheduled game found.</div>}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
             <div className="text-center mb-8 relative p-6 bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden group">
                <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent skew-x-12 animate-[shimmer_3s_infinite]"></div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-lg"><span className="text-blue-500">2026</span> SEASON</h3>
                <p className="text-gray-400 text-[10px] font-bold tracking-[0.3em] uppercase mt-2">CLASSIFIED: UPCOMING SCHEDULE</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {upcoming && upcoming.length > 0 ? upcoming.map(game => (
                 <div key={game.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center gap-4 hover:bg-slate-750 transition hover:border-blue-500/50">
                    <div className="text-center w-14 bg-slate-900 rounded p-2 border border-slate-800"><span className="block text-sm font-bold text-blue-400">{game.dateString.split(' ')[0]}</span><span className="block text-[10px] text-gray-400 uppercase">{game.dateString.split(' ')[1]}</span></div>
                    <div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-gray-500 text-[10px] font-bold">VS</span><span className="font-bold text-white">{String(game.opponent.name)}</span></div><p className="text-[10px] text-gray-500 uppercase tracking-wider">{game.venue}</p></div>
                    <img src={game.opponent.logo} className="w-10 h-10 object-contain opacity-80" alt="Logo" />
                 </div>
               )) : <div className="col-span-2 text-center py-12 bg-slate-900/50 rounded-xl border border-dashed border-slate-700"><div className="inline-block p-3 rounded-full bg-slate-800 mb-3"><span className="text-2xl">📡</span></div><p className="text-gray-300 font-bold text-sm">No upcoming games detected.</p><p className="text-gray-500 text-xs mt-1">System is scanning for 2026 schedule updates...</p></div>}
             </div>
          </div>
        )}

        {activeTab === 'roster' && (
           <div className="min-h-[200px]">
             {players && players.length > 0 ? <RosterList players={players} /> : <div className="text-center p-10 bg-slate-900/50 rounded-xl border border-slate-800"><p className="text-red-400 font-bold mb-2">No data found</p><pre className="mt-4 text-[10px] text-left bg-black p-4 rounded overflow-auto max-h-60 text-green-400 font-mono">{debugData ? JSON.stringify(debugData, null, 2) : "No data available"}</pre></div>}
           </div>
        )}
      </div>
    </div>
  );
}