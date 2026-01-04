// src/lib/utils.js

// URL de respaldo general
const NFL_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png";

// ✅ DICCIONARIO DE LOGOS OFICIALES HD
const OFFICIAL_LOGOS = {
  // AFC East
  '17': "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/New_England_Patriots_logo.svg/1200px-New_England_Patriots_logo.svg.png", // Patriots
  '15': "https://upload.wikimedia.org/wikipedia/en/thumb/3/37/Miami_Dolphins_logo.svg/1200px-Miami_Dolphins_logo.svg.png",       // Dolphins
  '2':  "https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Buffalo_Bills_logo.svg/1200px-Buffalo_Bills_logo.svg.png",         // Bills
  '20': "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/New_York_Jets_logo.svg/1200px-New_York_Jets_logo.svg.png",         // Jets

  // AFC North
  '33': "https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Baltimore_Ravens_logo.svg/1200px-Baltimore_Ravens_logo.svg.png",   // Ravens
  '4':  "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png", // Bengals
  '5':  "https://upload.wikimedia.org/wikipedia/en/thumb/d/d9/Cleveland_Browns_logo.svg/1200px-Cleveland_Browns_logo.svg.png",     // Browns
  '23': "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png", // Steelers

  // AFC South
  '34': "https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Houston_Texans_logo.svg/1200px-Houston_Texans_logo.svg.png",       // Texans
  '11': "https://upload.wikimedia.org/wikipedia/en/thumb/0/00/Indianapolis_Colts_logo.svg/1200px-Indianapolis_Colts_logo.svg.png", // Colts
  '30': "https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Jacksonville_Jaguars_logo.svg/1200px-Jacksonville_Jaguars_logo.svg.png", // Jaguars
  '10': "https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/Tennessee_Titans_logo.svg/1200px-Tennessee_Titans_logo.svg.png",     // Titans

  // AFC West
  '7':  "https://upload.wikimedia.org/wikipedia/en/thumb/4/44/Denver_Broncos_logo.svg/1200px-Denver_Broncos_logo.svg.png",       // Broncos
  '12': "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Kansas_City_Chiefs_logo.svg/1200px-Kansas_City_Chiefs_logo.svg.png", // Chiefs
  '13': "https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Las_Vegas_Raiders_logo.svg/1200px-Las_Vegas_Raiders_logo.svg.png",   // Raiders
  '24': "https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/Los_Angeles_Chargers_logo.svg/1200px-Los_Angeles_Chargers_logo.svg.png", // Chargers

  // NFC East
  '6':  "https://upload.wikimedia.org/wikipedia/en/thumb/1/15/Dallas_Cowboys_logo.svg/1200px-Dallas_Cowboys_logo.svg.png",       // Cowboys
  '19': "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png", // Giants
  '21': "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Philadelphia_Eagles_logo.svg/1200px-Philadelphia_Eagles_logo.svg.png", // Eagles
  '28': "https://upload.wikimedia.org/wikipedia/en/thumb/6/63/Washington_Commanders_logo.svg/1200px-Washington_Commanders_logo.svg.png", // Commanders

  // NFC North
  '3':  "https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Chicago_Bears_logo.svg/1200px-Chicago_Bears_logo.svg.png",         // Bears
  '8':  "https://upload.wikimedia.org/wikipedia/en/thumb/7/71/Detroit_Lions_logo.svg/1200px-Detroit_Lions_logo.svg.png",         // Lions
  '9':  "https://upload.wikimedia.org/wikipedia/en/thumb/5/50/Green_Bay_Packers_logo.svg/1200px-Green_Bay_Packers_logo.svg.png",   // Packers
  '16': "https://upload.wikimedia.org/wikipedia/en/thumb/9/96/Minnesota_Vikings_logo.svg/1200px-Minnesota_Vikings_logo.svg.png",   // Vikings

  // NFC South
  '1':  "https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Atlanta_Falcons_logo.svg/1200px-Atlanta_Falcons_logo.svg.png",       // Falcons
  '29': "https://a.espncdn.com/i/teamlogos/nfl/500/car.png", // Panthers
  '18': "https://a.espncdn.com/i/teamlogos/nfl/500/no.png", // Saints
  '27': "https://upload.wikimedia.org/wikipedia/en/thumb/d/db/Tampa_Bay_Buccaneers_logo.svg/1200px-Tampa_Bay_Buccaneers_logo.svg.png", // Buccaneers

  // NFC West
  '22': "https://upload.wikimedia.org/wikipedia/en/thumb/7/72/Arizona_Cardinals_logo.svg/1200px-Arizona_Cardinals_logo.svg.png",   // Cardinals
  '14': "https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Los_Angeles_Rams_logo.svg/1200px-Los_Angeles_Rams_logo.svg.png",     // Rams
  '25': "https://upload.wikimedia.org/wikipedia/en/thumb/a/aa/San_Francisco_49ers_logo.svg/1200px-San_Francisco_49ers_logo.svg.png", // 49ers
  '26': "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Seattle_Seahawks_logo.svg/1200px-Seattle_Seahawks_logo.svg.png"      // Seahawks
};

export function processSchedule(scheduleData) {
  if (!scheduleData || !scheduleData.events) {
    return { history: [], next: null, upcoming: [] };
  }

  const events = scheduleData.events;
  const now = new Date(); // Hora actual exacta

  // 1. Asegurar que las fechas sean objetos Date válidos y ordenar
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  const history = [];
  let next = null;
  const upcoming = [];

  for (const game of events) {
    const gameDate = new Date(game.date);
    const statusType = game.status?.type;
    
    // 1. Si ya está marcado como completado, es historia sin dudas.
    if (statusType?.completed) {
      history.push(game);
      continue;
    }

    // LÓGICA MEJORADA: Definir el "Juego Actual/Siguiente"
    
    // Calculamos la diferencia en horas entre AHORA y el partido
    // Negativo = el partido ya empezó hace X horas
    // Positivo = faltan X horas para el partido
    const diffHours = (gameDate - now) / 1000 / 60 / 60;

    // Es el juego "Next" si:
    // A. Aún no tenemos un "next" asignado.
    // B. Y ADEMÁS: Es en el futuro (diffHours > 0)
    // C. O empezó hace menos de 5 horas (diffHours > -5)
    //    (Esto atrapa el partido aunque la API tarde en ponerlo 'in-progress')
    
    if (!next) {
        // Si el juego es futuro O es muy reciente (ventana de 5 horas desde el inicio)
        if (diffHours > -5) { 
            next = game; // ¡Lo encontramos! Este es el que mostraremos en la pantalla principal
            continue;    // Pasamos al siguiente ciclo
        }
    }

    // Si ya encontramos el "Next", y este juego es futuro, va a "Upcoming"
    if (next && gameDate > now && game.id !== next.id) {
        upcoming.push(game);
        continue;
    }

    // Si no cayó en ninguno de los anteriores (es viejo y no está completed, o es un error), lo mandamos a history
    if (game.id !== next?.id) {
        history.push(game);
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

  // Función mejorada para obtener logo
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