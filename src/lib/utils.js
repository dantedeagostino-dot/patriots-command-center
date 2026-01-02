// src/lib/utils.js

// URL de respaldo segura (Wikimedia Commons)
const NFL_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png";

export function processSchedule(scheduleData) {
  if (!scheduleData || !scheduleData.events) {
    return { history: [], next: null, upcoming: [] };
  }

  const events = scheduleData.events;
  const now = new Date(); // Fecha actual real

  // 1. Asegurar que las fechas sean objetos Date válidos y ordenar
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  const history = [];
  let next = null;
  const upcoming = [];

  for (const game of events) {
    const gameDate = new Date(game.date);
    const statusType = game.status?.type;
    
    // Un juego es "History" SOLO si ya terminó (status completed)
    if (statusType?.completed) {
      history.push(game);
      continue;
    }

    // Si no ha terminado, miramos la fecha.
    // Si la fecha del juego es MENOR a hoy (y no está completed), es un error de la API o un juego cancelado, lo ignoramos o lo mandamos a history.
    // Pero para estar seguros, el "Next" debe ser > Ahora.
    
    if (gameDate > now) {
      if (!next) {
        next = game; // El primer juego que encontramos en el futuro
      } else {
        upcoming.push(game); // Los siguientes son upcoming
      }
    } else {
      // Si la fecha ya pasó pero no está "completed", podría ser el que se está jugando AHORA MISMO
      const state = statusType?.state;
      if (state === 'in' || state === 'in-progress') {
         next = game; // Es el juego en vivo
      } else {
         history.push(game); // Asumimos que ya pasó
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
  const patriots = competitors.find(c => c.team.id === '17') || competitors[0];
  const opponent = competitors.find(c => c.team.id !== '17') || competitors[1];

  if (!patriots || !opponent) return null;

  const gameDate = new Date(game.date);

  // Función segura para obtener score
  const getScore = (competitor) => {
    if (!competitor) return "0";
    // Si viene null o undefined
    if (!competitor.score) return "0";
    // Si es objeto
    if (typeof competitor.score === 'object') {
       return competitor.score.displayValue || competitor.score.value || "0";
    }
    return competitor.score.toString();
  };

  // Función segura para obtener Logo
  const getLogo = (competitor) => {
      return competitor?.team?.logo || NFL_LOGO;
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
      logo: getLogo(patriots),
      name: patriots.team?.shortDisplayName || "Pats",
      record: patriots.records?.[0]?.summary || "0-0",
      isHome: patriots.homeAway === 'home'
    },
    opponent: {
      score: getScore(opponent),
      logo: getLogo(opponent),
      name: opponent.team?.shortDisplayName || "Opponent",
      record: opponent.records?.[0]?.summary || "0-0"
    }
  };
}