// src/lib/nflApi.js

const BASE_URL = 'https://nfl-api1.p.rapidapi.com';
const PATRIOTS_ID = '17';

export async function fetchFromNFL(endpoint, params = '') {
  try {
    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST || 'nfl-api1.p.rapidapi.com';

    if (!apiKey) {
      console.error('⚠️ RAPIDAPI_KEY no está definida. Define la variable de entorno RAPIDAPI_KEY.');
      return null;
    }

    const url = `${BASE_URL}/${endpoint}${params ? `?${params}` : ''}`;
    console.log(`[nflApi] Fetching: ${url} (host: ${apiHost})`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost
      },
      // Keep ISR hint if used by Next.js; adjust revalidate as needed
      next: { revalidate: 10 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error API ${endpoint}: status=${response.status} body=${errorText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error de red en fetchFromNFL:", error);
    return null;
  }
}

export async function getPatriotsSchedule(season = '2025') {
  return await fetchFromNFL('nfl-schedule-team', `teamId=${PATRIOTS_ID}&season=${season}`);
}

export async function getTeamNews() {
  return await fetchFromNFL('nfl-news');
}

export async function getStandings() {
  return await fetchFromNFL('nflstandings', 'year=2025');
}

export async function getTeamPlayers() {
  return await fetchFromNFL('nflteamplayers', `teamid=${PATRIOTS_ID}`);
}

export async function getBasicRoster() {
  return await fetchFromNFL('players/id', `teamId=${PATRIOTS_ID}`);
}

// Usamos player-overview para el modal (más robusto)
export async function getPlayerStats(playerId) {
  return await fetchFromNFL('player-overview', `playerId=${playerId}`);
}

export async function getTeamLeaders() {
  return await fetchFromNFL('team/leaders', `teamId=${PATRIOTS_ID}&season=2025&limit=3`);
}

export async function getTeamInjuries() {
  return await fetchFromNFL('team/v2/injuries', `teamId=${PATRIOTS_ID}`);
}

// --- MODO EN VIVO ---
export async function getGamePlayByPlay(gameId) {
  return await fetchFromNFL('nflplay', `id=${gameId}`);
}
export async function getGameBoxScore(gameId) {
  return await fetchFromNFL('nflboxscore', `id=${gameId}`);
}
export async function getGameOdds(gameId) {
  return await fetchFromNFL('nflpicks', `id=${gameId}`);
}
