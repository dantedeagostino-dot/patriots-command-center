// src/lib/utils.js

const NFL_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png";

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
  '24': "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png", // Chargers

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

export function processSchedule(scheduleData, cutoffDateStr = null) {
  if (!scheduleData || !scheduleData.events) {
    return { history: [], next: null, upcoming: [] };
  }

  const events = scheduleData.events;
  const now = new Date();
  const cutoffDate = cutoffDateStr ? new Date(cutoffDateStr) : null;

  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  const history = [];
  let next = null;
  const upcoming = [];

  for (const game of events) {
    const gameDate = new Date(game.date);

    // Filtro de fecha
    if (cutoffDate && gameDate > cutoffDate) {
       continue;
    }

    const statusType = game.status?.type;
    
    if (statusType?.completed) {
      history.push(game);
      continue;
    }

    const diffHours = (gameDate - now) / 1000 / 60 / 60;

    if (!next) {
        if (diffHours > -5) { 
            next = game;
            continue;
        }
    }

    if (next && gameDate > now && game.id !== next.id) {
        upcoming.push(game);
        continue;
    }

    if (game.id !== next?.id) {
        history.push(game);
    }
  }

  history.reverse();
  return { history, next, upcoming };
}

export function getGameInfo(game) {
  // Fail-Safe: Return a dummy object instead of null if game is completely missing
  if (!game) {
      return {
          id: "unknown",
          dateRaw: new Date().toISOString(),
          dateString: "Date TBD",
          timeString: "TBD",
          name: "TBD vs TBD",
          venue: "Venue TBD",
          status: "Scheduled",
          isLive: false,
          patriots: { score: "0", logo: NFL_LOGO, name: "TBD", record: "0-0", isHome: true },
          opponent: { score: "0", logo: NFL_LOGO, name: "TBD", record: "0-0" }
      };
  }
  
  // Fail-Safe: Handle missing competition array
  const competition = game.competitions?.[0] || {};

  // Fail-Safe: Handle missing competitors
  const competitors = competition.competitors || [];

  // Try to find Patriots and Opponent, or fallback to dummy objects
  let patriots = competitors.find(c => c.team?.id === '17');
  let opponent = competitors.find(c => c.team?.id !== '17');

  // If we can't identify them by ID, just take the first two available
  if (!patriots) patriots = competitors[0];
  if (!opponent) opponent = competitors[1] || competitors[0]; // If only 1 exists, duplicate it to avoid crash

  // Helpers with extreme safety
  const getScore = (competitor) => {
    if (!competitor) return "0";
    if (!competitor.score) return "0";
    if (typeof competitor.score === 'object') {
       return competitor.score.displayValue || competitor.score.value || "0";
    }
    return String(competitor.score);
  };

  const getLogo = (competitor) => {
      const teamId = competitor?.team?.id;
      if (teamId && OFFICIAL_LOGOS[teamId]) {
          return OFFICIAL_LOGOS[teamId];
      }
      if (competitor?.team?.logo) {
          return competitor.team.logo;
      }
      return NFL_LOGO;
  };

  const getName = (competitor) => {
      return competitor?.team?.shortDisplayName || competitor?.team?.name || "TBD";
  };

  const getRecord = (competitor) => {
      return competitor?.records?.[0]?.summary || "0-0";
  };

  const gameDate = new Date(game.date || new Date().toISOString());
  const now = new Date();

  // Defensive status checks
  const statusType = game.status?.type || {};
  const apiSaysLive = statusType.state === 'in';
  const isFinished = statusType.state === 'post' || statusType.completed === true;
  const isPastStartTime = now >= gameDate;

  const isLive = apiSaysLive || (isPastStartTime && !isFinished);

  return {
    id: game.id || `game-${Math.random()}`,
    dateRaw: game.date || new Date().toISOString(),
    dateString: gameDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    timeString: gameDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    name: game.name || `${getName(patriots)} vs ${getName(opponent)}`,
    venue: competition.venue?.fullName || "Stadium TBD",
    status: statusType.detail || "Scheduled",
    isLive: isLive,
    patriots: {
      score: getScore(patriots),
      logo: getLogo(patriots), 
      name: getName(patriots),
      record: getRecord(patriots),
      isHome: patriots?.homeAway === 'home'
    },
    opponent: {
      score: getScore(opponent),
      logo: getLogo(opponent), 
      name: getName(opponent),
      record: getRecord(opponent)
    }
  };
}
