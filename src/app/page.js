import { 
  getPatriotsSchedule, 
  getTeamNews, 
  getStandings, 
  getTeamPlayers, 
  getBasicRoster,
  getTeamLeaders,  // <--- Importante para los nuevos widgets
  getTeamInjuries  // <--- Importante para los nuevos widgets
} from '../lib/nflApi';
import { processSchedule, getGameInfo } from '../lib/utils';
import DashboardTabs from '../components/DashboardTabs';

export default async function Home() {
  // 1. OBTENCIÓN DE DATOS SEGURA
  // Usamos un try/catch global y valores por defecto null para evitar roturas
  let scheduleRaw, newsRaw, standingsRaw, playersRaw, leadersRaw, injuriesRaw;

  try {
    [scheduleRaw, newsRaw, standingsRaw, playersRaw, leadersRaw, injuriesRaw] = await Promise.all([
      getPatriotsSchedule().catch(e => null),
      getTeamNews().catch(e => null),
      getStandings().catch(e => null),
      getTeamPlayers().catch(e => null),
      getTeamLeaders().catch(e => null),
      getTeamInjuries().catch(e => null)
    ]);
  } catch (error) {
    console.error("Critical API Error:", error);
  }

  // PLAN B: Si el roster falla, intentamos el básico
  if (!playersRaw) {
      try {
        console.log("⚠️ Roster completo falló, usando básico...");
        playersRaw = await getBasicRoster();
      } catch (e) { console.error("Roster fallback failed", e); }
  }

  // 2. Procesar Calendario
  const { history, next, upcoming } = processSchedule(scheduleRaw);
  const historyFormatted = history.map(game => getGameInfo(game)).filter(Boolean);
  const nextGameFormatted = getGameInfo(next);
  const upcomingFormatted = upcoming.map(game => getGameInfo(game)).filter(Boolean);

  // 3. Procesar Noticias (CORRECCIÓN CRÍTICA: Validar Array)
  let cleanNews = [];
  let rawList = [];
  
  // Validamos estrictamente que sea un array antes de asignarlo
  // Esto arregla el error "b.map is not a function"
  if (Array.isArray(newsRaw)) {
      rawList = newsRaw;
  } else if (newsRaw?.data && Array.isArray(newsRaw.data)) {
      rawList = newsRaw.data;
  } else if (newsRaw?.articles && Array.isArray(newsRaw.articles)) {
      rawList = newsRaw.articles;
  }

  // Solo ejecutamos .map si rawList es un array válido y tiene elementos
  if (Array.isArray(rawList) && rawList.length > 0) {
      cleanNews = rawList.map(item => ({
         title: item.headline || item.title || "Patriots News",
         link: item.links?.web?.href || item.link || "https://www.patriots.com/news/",
         pubDate: item.published || item.date || new Date().toISOString(),
         source: item.source || "NFL News"
      }));
  }

  if (cleanNews.length === 0) {
     cleanNews = [{ title: "Check official site for latest updates", link: "https://www.patriots.com/news/", source: "System", pubDate: new Date().toISOString() }];
  }

  // 4. Récord
  let seasonRecord = "0-0";
  try {
     if (nextGameFormatted?.patriots?.record && nextGameFormatted.patriots.record !== "0-0") {
        seasonRecord = nextGameFormatted.patriots.record;
     }
  } catch (e) { console.error(e); }

  // 5. Roster
  let finalRoster = [];
  if (playersRaw) {
      if (playersRaw.team && playersRaw.team.athletes) {
          finalRoster = playersRaw.team.athletes;
      } else if (Array.isArray(playersRaw)) {
          finalRoster = playersRaw;
      } else if (playersRaw.teamPlayers) {
          finalRoster = playersRaw.teamPlayers;
      } else if (playersRaw.data) {
          finalRoster = playersRaw.data;
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
              leaders={leadersRaw}   // <--- Se pasan los datos
              injuries={injuriesRaw} // <--- Se pasan los datos
           />
      </div>
    </main>
  );
}