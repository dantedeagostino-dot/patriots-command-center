// src/lib/utils.js

// URL de respaldo general
const NFL_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png";

// ✅ DICCIONARIO DE LOGOS OFICIALES HD
const OFFICIAL_LOGOS = {
  '17': "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/New_England_Patriots_logo.svg/1200px-New_England_Patriots_logo.svg.png", // New England Patriots
  '15': "https://upload.wikimedia.org/wikipedia/en/thumb/3/37/Miami_Dolphins_logo.svg/1200px-Miami_Dolphins_logo.svg.png",       // Miami Dolphins
  // Puedes añadir más equipos aquí si quieres:
  // '2': "URL_BUFFALO_BILLS", 
  // '20': "URL_NY_JETS",
};

export function processSchedule(scheduleData) {
  if (!scheduleData || !scheduleData.events) {
    return { history: [], next: null, upcoming: [] };
  }

  const events = scheduleData.events;
  const now = new Date();

  // 1. Asegurar que las fechas sean objetos Date válidos y ordenar
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  const history = [];
  let next = null;
  const upcoming = [];

  for (const game of events) {
    const gameDate = new Date(game.date);
    const statusType = game.status?.type;
    
    // Un juego es "History" SOLO si ya terminó
    if (statusType?.completed) {
      history.push(game);
      continue;
    }

    if (gameDate > now) {
      if (!next) {
        next = game; // El primer juego futuro es el "Next"
      } else {
        upcoming.push(game); // El resto son "Upcoming"
      }
    } else {
      // Si la fecha ya pasó pero no está completed, puede estar en juego
      const state = statusType?.state;
      if (state === 'in' || state === 'in-progress') {
         next = game;
      } else {
         history.push(game);
      }
    }
  }

  history.reverse(); // El más reciente primero
  return { history, next, upcoming };
}

export function getGameInfo(game) {
  if (!game) return null;
  
  const competition = game.competitions?.[0];
  if (!competition) return null;

  const competitors = competition.competitors || [];
  // Identificamos a los Patriots por su ID '17'
  const patriots = competitors.find(c => c.team.id === '17') || competitors[0];
  const opponent = competitors.find(c => c.team.id !== '17') || competitors[1];

  if (!patriots || !opponent) return null;

  const gameDate = new Date(game.date);

  // Función segura para obtener score
  const getScore = (competitor) => {
    if (!competitor) return "0";
    if (!competitor.score) return "0";
    if (typeof competitor.score === 'object') {
       return competitor.score.displayValue || competitor.score.value || "0";
    }
    return competitor.score.toString();
  };

  // ✅ FUNCIÓN MEJORADA PARA OBTENER LOGO
  const getLogo = (competitor) => {
      const teamId = competitor?.team?.id;
      // 1. Si tenemos un logo oficial en nuestra lista, úsalo
      if (teamId && OFFICIAL_LOGOS[teamId]) {
          return OFFICIAL_LOGOS[teamId];
      }
      // 2. Si no, usa el que viene de la API
      if (competitor?.team?.logo) {
          return competitor.team.logo;
      }
      // 3. Si todo falla, usa el logo de la NFL
      return NFL_LOGO;
  };

  return {
    id: game.id,
    dateRaw: game.date,
    dateString: gameDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    timeString: gameDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    name: game.name || "TBD",
    venue: competition.venue?.fullName || "Stadium TBD",
    status: game.status?.type?.detail || "Scheduled", 
    isLive: game.status?.type?.state === 'in', 
    patriots: {
      score: getScore(patriots),
      logo: getLogo(patriots), // <--- Aquí usará el logo oficial
      name: patriots.team?.shortDisplayName || "Pats",
      record: patriots.records?.[0]?.summary || "0-0",
      isHome: patriots.homeAway === 'home'
    },
    opponent: {
      score: getScore(opponent),
      logo: getLogo(opponent), // <--- Aquí también
      name: opponent.team?.shortDisplayName || "Opponent",
      record: opponent.records?.[0]?.summary || "0-0"
    }
  };
}