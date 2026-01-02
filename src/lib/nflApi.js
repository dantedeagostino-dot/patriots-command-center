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

// Función genérica para conectar con RapidAPI
export async function fetchFromNFL(endpoint, params = '') {
  try {
    const url = `${BASE_URL}/${endpoint}${params ? `?${params}` : ''}`;
    // Cache de 5 minutos (300 segundos)
    const response = await fetch(url, { ...options, next: { revalidate: 300 } });
    
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

// 1. OBTENER CALENDARIO (Schedule)
export async function getPatriotsSchedule() {
  return await fetchFromNFL('nfl-schedule-team', `teamId=${PATRIOTS_ID}&season=2025`);
}

// 2. OBTENER NOTICIAS
export async function getTeamNews() {
  return await fetchFromNFL('nfl-news');
}

// 3. OBTENER POSICIONES (Standings)
export async function getStandings() {
  return await fetchFromNFL('nflstandings', 'year=2024');
}

// 4. OBTENER LESIONES
export async function getTeamInjuries() {
  return await fetchFromNFL('team/v2/injuries', `teamId=${PATRIOTS_ID}`);
}
// --- NUEVAS FUNCIONES PARA EL MODO EN VIVO ---

// 1. Jugada a Jugada (Play-by-Play)
// Documentación: Get NFL Game Play-by-Play
export async function getGamePlayByPlay(gameId) {
  return await fetchFromNFL('nflplay', `id=${gameId}`);
}

// 2. Estadísticas y Líderes (Box Score)
// Documentación: Get NFL Game Box Score
export async function getGameBoxScore(gameId) {
  return await fetchFromNFL('nflboxscore', `id=${gameId}`);
}

// 3. Probabilidades y Apuestas (Picks/Odds)
// Documentación: Get NFL PickCenter Data
export async function getGameOdds(gameId) {
  return await fetchFromNFL('nflpicks', `id=${gameId}`);
}
// ... (mantiene todo lo anterior)

// 5. OBTENER JUGADORES (Roster)
// Documentación: Get NFL Team Players
export async function getTeamPlayers() {
  // Usamos el ID 17 de los Patriots
  return await fetchFromNFL('nflteamplayers', 'teamid=17');
}

// 6. OBTENER ESTADÍSTICAS DE JUGADORES
// Documentación: Get NFL Player Stats
export async function getPlayerStats(playerId) {
  return await fetchFromNFL('nflplayerstats', `playerid=${playerId}&season=2024`);
}

// 7. OBTENER DATOS DE PARTIDOS EN VIVO
// Documentación: Get NFL Live Scores
export async function getLiveScores() {
  return await fetchFromNFL('nfllivescores');
}