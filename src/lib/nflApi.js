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
export async function getGamePlayByPlay(gameId) {
  return await fetchFromNFL('nflplay', `id=${gameId}`);
}

// 2. Estadísticas y Líderes (Box Score)
export async function getGameBoxScore(gameId) {
  return await fetchFromNFL('nflboxscore', `id=${gameId}`);
}

// 3. Probabilidades y Apuestas (Picks/Odds)
export async function getGameOdds(gameId) {
  return await fetchFromNFL('nflpicks', `id=${gameId}`);
}

// 5. OBTENER JUGADORES (Roster) - CORREGIDO ✅
export async function getTeamPlayers() {
  // El endpoint correcto suele ser 'nfl-team-roster' y el parámetro 'teamId' (con I mayúscula)
  return await fetchFromNFL('nfl-team-roster', `teamId=${PATRIOTS_ID}`);
}