import { 
  getPatriotsSchedule, 
  getTeamNews, 
  getStandings, 
  getTeamPlayers, 
  getBasicRoster,
  getTeamLeaders,
  getTeamInjuries
} from '../lib/nflApi';
import { getGameInfo } from '../lib/utils';
import DashboardTabs from '../components/DashboardTabs';

export default async function Home() {
  const [schedule2025Raw, schedule2026Raw, newsRaw, standingsRaw, playersRaw, leadersRaw, injuriesRaw] = await Promise.all([
    getPatriotsSchedule('2025').catch(() => null),
    getPatriotsSchedule('2026').catch(() => null),
    getTeamNews().catch(() => null),
    getStandings().catch(() => null),
    getTeamPlayers().catch(() => null),
    getTeamLeaders().catch(() => null),
    getTeamInjuries().catch(() => null)
  ]);

  // Combine events from 2025 and 2026 (Jan 2026 is part of 2025 season mostly, but might be in 2026 fetch depending on API)
  let allEvents = [];
  // Helper to extract events safely
  const extractEvents = (data) => Array.isArray(data?.events) ? data.events : [];

  allEvents = [...extractEvents(schedule2025Raw), ...extractEvents(schedule2026Raw)];

  // Filter games between Sep 4, 2025 and Jan 4, 2026
  const startDate = new Date('2025-09-04T00:00:00Z');
  const endDate = new Date('2026-01-04T23:59:59Z');

  const filteredGames = allEvents.filter(game => {
    if (!game.date) return false;
    const gameDate = new Date(game.date);
    if (isNaN(gameDate.getTime())) return false; // Filter out invalid dates
    return gameDate >= startDate && gameDate <= endDate;
  });

  // Sort by date
  filteredGames.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Remove duplicates based on ID
  const uniqueGames = [];
  const seenIds = new Set();
  for (const game of filteredGames) {
      if (!seenIds.has(game.id)) {
          uniqueGames.push(game);
          seenIds.add(game.id);
      }
  }

  const scheduleFormatted = uniqueGames.map(game => getGameInfo(game)).filter(Boolean);

  // Determine next game (first game in the list that hasn't happened yet or is live)
  const now = new Date();
  const nextGameRaw = uniqueGames.find(game => {
      const gDate = new Date(game.date);
      const isFinished = game.status?.type?.completed;
      return !isFinished && (gDate > now || game.status?.type?.state === 'in');
  });

  const nextGameFormatted = nextGameRaw ? getGameInfo(nextGameRaw) : null;


  let finalPlayersRaw = playersRaw;
  if (!finalPlayersRaw) {
      try {
        finalPlayersRaw = await getBasicRoster().catch(() => null);
      } catch (e) { console.error(e); }
  }

  let cleanNews = [];
  let rawList = [];
  
  if (Array.isArray(newsRaw)) {
      rawList = newsRaw;
  } else if (newsRaw?.data && Array.isArray(newsRaw.data)) {
      rawList = newsRaw.data;
  } else if (newsRaw?.articles && Array.isArray(newsRaw.articles)) {
      rawList = newsRaw.articles;
  }

  if (rawList.length > 0) {
      cleanNews = rawList.map(item => ({
         title: item.headline || item.title || "Patriots News",
         link: item.links?.web?.href || item.link || "https://www.patriots.com/news/",
         pubDate: item.published || item.date || new Date().toISOString(),
         source: item.source || "NFL News",
         image: item.images?.[0]?.url || item.image || null
      }));
  }

  if (cleanNews.length === 0) {
     cleanNews = [{ title: "Check official site for latest updates", link: "https://www.patriots.com/news/", source: "System", pubDate: new Date().toISOString() }];
  }

  let seasonRecord = "0-0";
  try {
     if (nextGameFormatted?.patriots?.record && nextGameFormatted.patriots.record !== "0-0") {
        seasonRecord = nextGameFormatted.patriots.record;
     }
  } catch (e) { console.error(e); }

  let finalRoster = [];
  if (finalPlayersRaw) {
      if (finalPlayersRaw.team && finalPlayersRaw.team.athletes) {
          finalRoster = finalPlayersRaw.team.athletes;
      } else if (Array.isArray(finalPlayersRaw)) {
          finalRoster = finalPlayersRaw;
      } else if (finalPlayersRaw.teamPlayers) {
          finalRoster = finalPlayersRaw.teamPlayers;
      } else if (finalPlayersRaw.data) {
          finalRoster = finalPlayersRaw.data;
      }
  }

  return (
    <main className="min-h-screen bg-[#050B14] text-white font-sans pb-10">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img src="https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/New_England_Patriots_logo.svg/1200px-New_England_Patriots_logo.svg.png" className="w-10 h-10 object-contain" alt="Logo" />
             <div>
               <h1 className="text-xl font-black tracking-tighter text-white leading-none">COMMAND CENTER</h1>
               <p className="text-blue-500 text-[10px] font-bold tracking-[0.2em] uppercase">New England Patriots</p>
             </div>
          </div>
          <div className="hidden md:block text-right">
             <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-xs font-mono font-bold text-gray-400">SYSTEM ONLINE</p>
             </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 md:p-6 mt-4">
           <div className="flex justify-between items-end mb-4 px-2">
              <span className="text-xs text-gray-500 font-bold uppercase">Current Season</span>
              <span className="text-xl font-black text-white">{seasonRecord} <span className="text-blue-500 text-xs">AFC EAST</span></span>
           </div>

           <DashboardTabs 
              schedule={scheduleFormatted}
              nextGame={nextGameFormatted} 
              news={cleanNews}
              players={finalRoster}
              leaders={leadersRaw}   
              injuries={injuriesRaw}
              standings={standingsRaw} 
           />
      </div>
    </main>
  );
}
