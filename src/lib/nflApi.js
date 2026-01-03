// src/lib/nflApi.js

const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host': process.env.RAPIDAPI_HOST
  }
};

const BASE_URL = 'https://nfl-api1.p.rapidapi.com';
const PATRIOTS_ID = '17'; 

export async function fetchFromNFL(endpoint, params = '') {
  try {
    const url = `${BASE_URL}/${endpoint}${params ? `?${params}` : ''}`;
    // Cache de 1 hora para datos estáticos
    const response = await fetch(url, { ...options, next: { revalidate: 3600 } });
    
    if (!response.ok) {
      console.error(`Error API ${endpoint}: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("❌ Error de red:", error);
    return null;
  }
}

// 1. CALENDARIO
export async function getPatriotsSchedule() {
  return await fetchFromNFL('nfl-schedule-team', `teamId=${PATRIOTS_ID}&season=2025`);
}

// 2. NOTICIAS
export async function getTeamNews() {
  return await fetchFromNFL('nfl-news');
}

// 3. POSICIONES
export async function getStandings() {
  return await fetchFromNFL('nflstandings', 'year=2024');
}

// 4. JUGADORES (ROSTER)
export async function getTeamPlayers() {
  return await fetchFromNFL('nflteamplayers', `teamid=${PATRIOTS_ID}`);
}

export async function getBasicRoster() {
  return await fetchFromNFL('players/id', `teamId=${PATRIOTS_ID}`);
}

// 5. ESTADÍSTICAS DE JUGADOR (NUEVO)
export async function getPlayerStats(playerId) {
  return await fetchFromNFL('nfl-player-statistic', `playerId=${playerId}`);
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