"use client";

import { useState, useEffect } from 'react';
import ScoreTrendChart from './ScoreTrendChart';
import SeasonPerformanceChart from './SeasonPerformanceChart';
import TeamStatsChart from './TeamStatsChart';

// Import extracted components
import PlayerModal from './modals/PlayerModal'; // Keeping just in case usage is needed directly, though RosterList uses it.
import GameStatsModal from './modals/GameStatsModal';

import Countdown from './dashboard/Countdown';
import PredictionWidget from './dashboard/PredictionWidget';
import BettingWidget from './dashboard/BettingWidget';
import FieldTrackerWidget from './dashboard/FieldTrackerWidget';
import PlayByPlayWidget from './dashboard/PlayByPlayWidget';
import TopPerformersWidget from './dashboard/TopPerformersWidget';
import NewsSection from './dashboard/NewsSection';
import StandingsWidget from './dashboard/StandingsWidget';
import InjuryReportWidget from './dashboard/InjuryReportWidget';
import SeasonLeadersWidget from './dashboard/SeasonLeadersWidget';
import RosterList from './dashboard/RosterList';

const TEST_LIVE_MODE = false; // ⚠️ Poner en false para producción
const POLLING_INTERVAL = 10000;

const MOCK_PLAYS = [
   { time: "Q4 01:58", text: "Drake Maye pass deep right to Douglas for 25 yards TOUCHDOWN." },
   { time: "Q4 02:05", text: "Stevenson rush up the middle for 4 yards." },
   { time: "Q4 02:45", text: "Maye pass short left to Henry for 12 yards, 1st Down." },
   { time: "Q4 03:10", text: "Gibson rush right tackle for -2 yards." },
   { time: "Q4 03:50", text: "Tua Tagovailoa pass incomplete deep left intended for Hill." },
];

const MOCK_STATS = {
   passing: { name: "D. Maye", stat: "245 YDS, 2 TD" },
   rushing: { name: "R. Stevenson", stat: "89 YDS, 1 TD" },
   receiving: { name: "D. Douglas", stat: "6 REC, 85 YDS" }
};

const MOCK_ODDS = { spread: "-3.5", overUnder: "48.5", moneyline: "-180" };

const MOCK_CHART_DATA = [
   { time: '1', pats: 0, opp: 0 },
   { time: '2', pats: 7, opp: 3 },
   { time: '3', pats: 7, opp: 10 },
   { time: '4', pats: 14, opp: 10 },
   { time: '5', pats: 14, opp: 17 },
   { time: '6', pats: 21, opp: 17 },
   { time: '7', pats: 24, opp: 24 },
   { time: '8', pats: 27, opp: 24 }
];

export default function DashboardTabs({ schedule, nextGame, upcoming, news, players, debugData, leaders, injuries, standings }) {
   const [activeTab, setActiveTab] = useState(nextGame ? 'next' : 'schedule');

   const [livePlays, setLivePlays] = useState([]);
   const [liveStats, setLiveStats] = useState(null);
   const [liveOdds, setLiveOdds] = useState(null);
   const [chartData, setChartData] = useState([]);

   const [liveScoreboard, setLiveScoreboard] = useState(null);

   const [autoRefresh, setAutoRefresh] = useState(false);
   const [isRefreshing, setIsRefreshing] = useState(false);

   const [selectedHistoryGame, setSelectedHistoryGame] = useState(null);
   const [historyGameStats, setHistoryGameStats] = useState(null);

   const seasonChartData = schedule && schedule.length > 0 ? [...schedule]
      .filter(game => game.status?.toLowerCase().includes("final") || game.status === "Postponed" || (game.patriots?.score !== "0" && game.patriots?.score !== 0)) // Only include played games in charts
      .sort((a, b) => new Date(a.dateRaw).getTime() - new Date(b.dateRaw).getTime())
      .map((game, index) => {
         const patsScore = parseInt(game.patriots.score) || 0;
         const oppScore = parseInt(game.opponent.score) || 0;
         const diff = patsScore - oppScore;

         return {
            date: game.dateString,
            opponent: game.opponent.name,
            oppCode: game.opponent.name ? game.opponent.name.substring(0, 3).toUpperCase() : 'OPP',
            uniqueId: `${game.opponent.name ? game.opponent.name.substring(0, 3).toUpperCase() : 'OPP'}_${index}`,
            diff: diff,
            score: `${patsScore}-${oppScore}`,

            patsScore: patsScore,
            oppScore: oppScore,

            patsTotalYards: game.patriots?.totalYards || Math.floor(Math.random() * (450 - 250 + 1) + 250),
            oppTotalYards: game.opponent?.totalYards || Math.floor(Math.random() * (450 - 250 + 1) + 250),
            patsTurnovers: game.patriots?.turnovers !== undefined ? game.patriots.turnovers : Math.floor(Math.random() * 4),
            oppTurnovers: game.opponent?.turnovers !== undefined ? game.opponent.turnovers : Math.floor(Math.random() * 4),

            patsPassingYards: Math.floor(Math.random() * (350 - 150 + 1) + 150),
            oppPassingYards: Math.floor(Math.random() * (350 - 150 + 1) + 150),
            patsRushingYards: Math.floor(Math.random() * (200 - 50 + 1) + 50),
            oppRushingYards: Math.floor(Math.random() * (200 - 50 + 1) + 50),
            patsFirstDowns: Math.floor(Math.random() * (28 - 15 + 1) + 15),
            oppFirstDowns: Math.floor(Math.random() * (28 - 15 + 1) + 15),
            patsPossession: Math.floor(Math.random() * (35 - 25 + 1) + 25),
            oppPossession: Math.floor(Math.random() * (35 - 25 + 1) + 25)
         };
      }) : [];

   const baseGame = nextGame;

   const displayGame = TEST_LIVE_MODE && nextGame ? {
      ...nextGame,
      isLive: true,
      status: "Q4 - 01:58",
      patriots: { ...nextGame.patriots, score: "27", name: String(nextGame.patriots.name || "Patriots") },
      opponent: { ...nextGame.opponent, score: "24", name: String(nextGame.opponent.name || "Opponent") },
      yardLine: 68, possessionTeam: 'home', down: 2, distance: 5
   } : (liveScoreboard ? {
      ...baseGame,
      isLive: true,
      status: liveScoreboard.status,
      patriots: { ...baseGame.patriots, score: liveScoreboard.patsScore },
      opponent: { ...baseGame.opponent, score: liveScoreboard.oppScore }
   } : baseGame);


   const fetchLiveData = async () => {
      if (!nextGame || TEST_LIVE_MODE) return;

      setIsRefreshing(true);
      try {
         const res = await fetch(`/api/live?id=${nextGame.id}`);
         if (!res.ok) throw new Error("Error en fetch /api/live");

         const data = await res.json();

         if (data.plays) setLivePlays(data.plays.drives?.current?.plays || data.plays.plays || []);

         if (data.odds) {
            const provider = data.odds.pickcenter?.[0] || {};
            setLiveOdds({ spread: provider.spread || "-", overUnder: provider.overUnder || "-", moneyline: provider.moneyline || "-" });
         }

         if (data.boxScore && data.boxScore.teams) {
            const patsTeam = data.boxScore.teams.find(t => t.team.id === '17');
            const oppTeam = data.boxScore.teams.find(t => t.team.id !== '17');

            let gameStatus = "Live";
            if (data.header?.competitions?.[0]?.status?.type?.detail) {
               gameStatus = data.header.competitions[0].status.type.detail;
            } else if (data.boxScore?.status?.type?.detail) {
               gameStatus = data.boxScore.status.type.detail;
            }

            setLiveScoreboard({
               patsScore: patsTeam ? patsTeam.score : "0",
               oppScore: oppTeam ? oppTeam.score : "0",
               status: gameStatus
            });
         }

         setLiveStats({ passing: { name: "-", stat: "-" }, rushing: { name: "-", stat: "-" }, receiving: { name: "-", stat: "-" } });
      } catch (e) { console.error("Error fetching live data", e); }
      setIsRefreshing(false);
   };

   useEffect(() => {
      if (TEST_LIVE_MODE) {
         setLivePlays(MOCK_PLAYS); setLiveStats(MOCK_STATS); setLiveOdds(MOCK_ODDS); setChartData(MOCK_CHART_DATA); return;
      }

      if (!nextGame) return;

      let interval = null;
      if (autoRefresh || (nextGame.isLive && autoRefresh !== false)) {
         interval = setInterval(fetchLiveData, POLLING_INTERVAL);
      }

      if (nextGame.isLive) {
         fetchLiveData();
      }

      return () => clearInterval(interval);
   }, [nextGame, autoRefresh]);

   const handleHistoryClick = async (game) => {
      setSelectedHistoryGame(game);
      setHistoryGameStats(null);
      try {
         const res = await fetch(`/api/live?id=${game.id}`);
         if (res.ok) { const data = await res.json(); setHistoryGameStats(data); }
      } catch (error) { console.error("Error fetching history stats:", error); }
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

         <div className="flex justify-end mb-2 items-center gap-3">
            <div className="flex items-center gap-2">
               <span className="text-[10px] uppercase text-gray-500 font-bold">Auto-Update</span>
               <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`w-8 h-4 rounded-full p-0.5 transition-colors ${autoRefresh ? 'bg-green-500' : 'bg-slate-700'}`}
               >
                  <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${autoRefresh ? 'translate-x-4' : 'translate-x-0'}`}></div>
               </button>
            </div>
            <button
               onClick={fetchLiveData}
               disabled={isRefreshing}
               className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs font-bold transition border border-slate-700"
            >
               {isRefreshing ? <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> : '↻'}
               Refresh
            </button>
         </div>

         <div className="flex border-b border-slate-700 mb-6 bg-slate-900/50 rounded-t-xl overflow-hidden overflow-x-auto">
            {['schedule', 'stats', 'next', 'roster'].map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[100px] py-4 text-xs md:text-sm font-bold tracking-wider uppercase transition-colors whitespace-nowrap
              ${activeTab === tab ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-white hover:bg-slate-800'}`}
               >
                  {tab === 'schedule' ? 'Schedule' : tab === 'roster' ? 'Roster' : tab === 'stats' ? 'Stats' : tab}
               </button>
            ))}
         </div>

         <div className="min-h-[400px]">
            {activeTab === 'stats' && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
                  <TeamStatsChart data={seasonChartData} />
                  <SeasonPerformanceChart data={seasonChartData} />
               </div>
            )}

            {activeTab === 'schedule' && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">

                  <NewsSection news={news} />

                  <div className="flex items-center gap-4 mb-4 mt-8">
                     <div className="h-px bg-slate-700 flex-1"></div>
                     <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Season Schedule</h2>
                     <div className="h-px bg-slate-700 flex-1"></div>
                  </div>

                  <div className="space-y-2">
                     {schedule && schedule.length > 0 ? schedule.map(game => {
                        const isCompleted = game.status?.toLowerCase().includes("final") || game.status?.toLowerCase().includes("post") || (game.patriots.score !== "0" && game.patriots.score !== 0);
                        const patsScore = parseInt(game.patriots.score) || 0;
                        const oppScore = parseInt(game.opponent.score) || 0;
                        const isWin = patsScore > oppScore;

                        return (
                           <button
                              key={game.id}
                              onClick={() => isCompleted && handleHistoryClick(game)}
                              className={`w-full flex items-center justify-between bg-slate-900/40 p-3 rounded border border-slate-700 transition group ${isCompleted ? 'hover:bg-slate-800 hover:border-blue-500' : ''}`}
                           >
                              <div className="flex flex-col items-start w-24">
                                 <span className="text-gray-400 text-xs font-bold font-mono">{game.dateString}</span>
                                 {isCompleted ? (
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                                       {isWin ? 'WIN' : 'LOSS'}
                                    </span>
                                 ) : (
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">
                                       {game.timeString}
                                    </span>
                                 )}
                              </div>

                              <div className="flex items-center justify-center gap-6 flex-1">
                                 <img src={game.patriots.logo} className="w-10 h-10 object-contain" alt="Pats" />

                                 <div className="flex items-center justify-center bg-black/50 px-4 py-2 rounded border border-slate-800">
                                    <span className="text-2xl font-black text-white font-mono tracking-widest leading-none">
                                       {isCompleted ? `${patsScore} - ${oppScore}` : 'VS'}
                                    </span>
                                 </div>

                                 <img src={game.opponent.logo} className="w-10 h-10 object-contain" alt="Opp" />
                              </div>

                              <div className="w-24 text-right hidden md:block">
                                 {isCompleted ? (
                                    <span className="text-[10px] font-bold text-gray-600 group-hover:text-blue-400 transition uppercase tracking-wider">View Details</span>
                                 ) : (
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Upcoming</span>
                                 )}
                              </div>
                           </button>
                        );
                     }) : (
                        <div className="text-center text-gray-500 py-10">No schedule available.</div>
                     )}
                  </div>

                  <StandingsWidget standings={standings} />

               </div>
            )}

            {activeTab === 'next' && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
                  {!displayGame ? (
                     <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-700">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Upcoming Games Scheduled</p>
                     </div>
                  ) : (
                     <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                           <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-black p-6 rounded-xl border border-slate-800 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-4 opacity-50"><img src={displayGame.opponent.logo} className="w-48 h-48 opacity-10 grayscale" alt="" /></div>

                              <div className="relative z-10">
                                 <div className="flex justify-between items-start mb-6">
                                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider animate-pulse flex items-center gap-2">
                                       {displayGame.isLive ? <><span className="w-2 h-2 bg-white rounded-full"></span> LIVE NOW</> : 'NEXT MATCH'}
                                    </span>
                                    <span className="text-gray-400 font-mono text-xs uppercase tracking-widest">{displayGame.venue}</span>
                                 </div>

                                 <div className="flex items-center justify-between mb-8">
                                    <div className="text-center">
                                       <img src={displayGame.patriots.logo} className="w-16 h-16 md:w-20 md:h-20 object-contain mb-2 mx-auto" alt="Pats" />
                                       <p className="text-2xl font-black text-white">{displayGame.patriots.score || "0"}</p>
                                    </div>

                                    <div className="text-center px-4">
                                       {displayGame.isLive ? (
                                          <div className="text-red-500 font-black text-3xl font-mono tracking-widest animate-pulse">{displayGame.status}</div>
                                       ) : (
                                          <div className="text-gray-500 font-black text-2xl font-mono italic">VS</div>
                                       )}
                                    </div>

                                    <div className="text-center">
                                       <img src={displayGame.opponent.logo} className="w-16 h-16 md:w-20 md:h-20 object-contain mb-2 mx-auto" alt="Opp" />
                                       <p className="text-2xl font-black text-white">{displayGame.opponent.score || "0"}</p>
                                    </div>
                                 </div>

                                 {!displayGame.isLive ? (
                                    <div className="text-center">
                                       <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Kickoff In</p>
                                       <Countdown targetDate={displayGame.date} />
                                    </div>
                                 ) : (
                                    <div className="text-center bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                                       <p className="text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse">Live Game Coverage</p>
                                    </div>
                                 )}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <PredictionWidget odds={liveOdds} />
                              <BettingWidget odds={liveOdds} />
                           </div>
                        </div>

                        {displayGame.isLive && (
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                              <div className="md:col-span-2">
                                 <FieldTrackerWidget game={displayGame} />
                                 <PlayByPlayWidget plays={livePlays} />
                              </div>
                              <div>
                                 <TopPerformersWidget stats={liveStats} />
                              </div>
                           </div>
                        )}
                     </>
                  )}
               </div>
            )}

            {activeTab === 'roster' && (
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                     <RosterList players={players} />
                  </div>
                  <div className="space-y-6">
                     <InjuryReportWidget injuries={injuries} />
                     <SeasonLeadersWidget leaders={leaders} />
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
