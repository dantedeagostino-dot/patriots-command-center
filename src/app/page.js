// src/app/page.js
import { getPatriotsSchedule, getTeamNews, getStandings } from '../lib/nflApi'; // Importamos getStandings
import { processSchedule, getGameInfo } from '../lib/utils';
import DashboardTabs from '../components/DashboardTabs';
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

  // 2. Procesar Calendario
  const { history, next, upcoming } = processSchedule(scheduleRaw);
  
  const historyFormatted = history.map(game => getGameInfo(game)).filter(Boolean);
  const nextGameFormatted = getGameInfo(next);
  const upcomingFormatted = upcoming.map(game => getGameInfo(game)).filter(Boolean);

  // 3. Procesar Noticias
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

  // 4. PROCESAR STANDINGS (POSICIONES) - Nuevo 
  let seasonRecord = "0-0";
  try {
     // La estructura usual es standings -> groups -> teams
     // Buscamos a los Patriots (ID 17) en la lista gigante
     // Esta lógica intenta encontrar el récord en la respuesta compleja de standings
     /* Nota: Como la estructura de standings varía, usaremos un fallback seguro:
        Si el endpoint de standings es complejo, intentamos sacar el record del nextGameFormatted 
        que a veces lo trae. Si no, dejamos el placeholder o lo que traiga standingsRaw.
     */
     if (nextGameFormatted?.patriots?.record && nextGameFormatted.patriots.record !== "0-0") {
        seasonRecord = nextGameFormatted.patriots.record;
     }
  } catch (e) {
     console.error("Error parsing standings", e);
  }

  rreturn (
    <main className="min-h-screen bg-[#050B14] text-white font-sans pb-10">
      {/* ... (header y título se quedan igual) ... */}

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
              players={playersRaw?.teamPlayers || []}  // <--- AGREGAR ESTA LÍNEA
           />
      </div>
    </main>
  );
}
