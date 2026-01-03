import { getPatriotsSchedule, getTeamNews, getStandings, getTeamPlayers } from '../lib/nflApi';
import { processSchedule, getGameInfo } from '../lib/utils';
import DashboardTabs from '../components/DashboardTabs';

export default async function Home() {
  const [scheduleRaw, newsRaw, standingsRaw, playersRaw] = await Promise.all([
    getPatriotsSchedule(),
    getTeamNews(),
    getStandings(),
    getTeamPlayers()
  ]);

  // Procesar Calendario
  const { history, next, upcoming } = processSchedule(scheduleRaw);
  const historyFormatted = history.map(game => getGameInfo(game)).filter(Boolean);
  const nextGameFormatted = getGameInfo(next);
  const upcomingFormatted = upcoming.map(game => getGameInfo(game)).filter(Boolean);

  // Procesar Noticias
  let cleanNews = [];
  let rawList = [];
  if (Array.isArray(newsRaw)) rawList = newsRaw;
  else if (newsRaw?.data) rawList = newsRaw.data;
  else if (newsRaw?.articles) rawList = newsRaw.articles;

  cleanNews = rawList.map(item => ({
     title: item.headline || item.title || "Patriots News",
     link: item.links?.web?.href || item.link || "https://www.patriots.com/news/",
     pubDate: item.published || item.date || new Date().toISOString(),
     source: item.source || "NFL News"
  }));

  if (cleanNews.length === 0) {
     cleanNews = [{ title: "Check official site for latest updates", link: "https://www.patriots.com/news/", source: "System", pubDate: new Date().toISOString() }];
  }

  // Procesar Récord
  let seasonRecord = "0-0";
  try {
     if (nextGameFormatted?.patriots?.record && nextGameFormatted.patriots.record !== "0-0") {
        seasonRecord = nextGameFormatted.patriots.record;
     }
  } catch (e) { console.error(e); }

  // 5. PROCESAR ROSTER (Actualizado según Doc)
  let finalRoster = [];
  if (playersRaw) {
      // La documentación dice que viene en la propiedad "data"
      if (playersRaw.data && Array.isArray(playersRaw.data)) {
          finalRoster = playersRaw.data; 
      } else if (Array.isArray(playersRaw)) {
          finalRoster = playersRaw;
      } else if (playersRaw.teamPlayers) {
          finalRoster = playersRaw.teamPlayers;
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
              history={historyFormatted} 
              nextGame={nextGameFormatted} 
              upcoming={upcomingFormatted}
              news={cleanNews}
              players={finalRoster}
              debugData={playersRaw}
           />
      </div>
    </main>
  );
}