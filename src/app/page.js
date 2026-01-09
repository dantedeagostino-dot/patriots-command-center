import { 
  getPatriotsSchedule, 
  getTeamNews, 
  getStandings, 
  getTeamPlayers, 
  getBasicRoster,
  getTeamLeaders,
  getTeamInjuries
} from '../lib/nflApi';
import { processSchedule, getGameInfo } from '../lib/utils';
import DashboardTabs from '../components/DashboardTabs';

export default async function Home() {
  // 1. OBTENCIÓN DE DATOS (PROTEGIDA)
  // Usamos .catch(err => null) en cada llamada para que si una falla, las demás sigan funcionando.
  const [schedulePastRaw, scheduleFutureRaw, newsRaw, standingsRaw, playersRaw, leadersRaw, injuriesRaw] = await Promise.all([
    getPatriotsSchedule('2024').catch(() => null), // Historial y Stats (Temporada completa)
    getPatriotsSchedule('2025').catch(() => null), // Futuro (Planificación)
    getTeamNews().catch(() => null),
    getStandings().catch(() => null),
    getTeamPlayers().catch(() => null),
    getTeamLeaders().catch(() => null),
    getTeamInjuries().catch(() => null)
  ]);

  // PLAN B: Si el roster principal falla, intentamos el básico
  let finalPlayersRaw = playersRaw;
  if (!finalPlayersRaw) {
      try {
        console.log("⚠️ Roster completo falló, usando básico...");
        finalPlayersRaw = await getBasicRoster().catch(() => null);
      } catch (e) { console.error(e); }
  }

  // 2. Procesar Calendario
  // A. Historial (Usamos 2024 - Filtramos hasta Julio 2025 para evitar fugas de 2025/26)
  const { history } = processSchedule(schedulePastRaw, '2025-07-01');
  const historyFormatted = history.map(game => getGameInfo(game)).filter(Boolean);

  // B. Next & Upcoming
  // Intentamos buscar "Next" en 2024 (Playoffs) pero con el mismo filtro
  const { next: next24 } = processSchedule(schedulePastRaw, '2025-07-01');

  // Upcoming viene puramente de 2026 (sin filtro o filtro futuro)
  const { upcoming: upcomingNextSeason } = processSchedule(scheduleFutureRaw);

  // Si hay un juego "Siguiente" real en 2024 (Playoffs/SuperBowl), úsalo. Si no, null.
  const nextGameFormatted = getGameInfo(next24);

  // Upcoming viene puramente de 2026
  const upcomingFormatted = upcomingNextSeason ? upcomingNextSeason.map(game => getGameInfo(game)).filter(Boolean) : [];

  // 3. Procesar Noticias (AQUÍ ESTABA EL ERROR "b.map is not a function")
  let cleanNews = [];
  let rawList = [];
  
  // Verificación estricta: Solo asignamos si es un Array real.
  // Antes, si 'newsRaw.data' era un objeto de error, el código explotaba. Ahora no.
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

  // 4. Récord
  let seasonRecord = "0-0";
  try {
     if (nextGameFormatted?.patriots?.record && nextGameFormatted.patriots.record !== "0-0") {
        seasonRecord = nextGameFormatted.patriots.record;
     }
  } catch (e) { console.error(e); }

  // 5. Roster
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
              history={historyFormatted} 
              nextGame={nextGameFormatted} 
              upcoming={upcomingFormatted}
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