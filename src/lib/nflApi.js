// src/lib/nflApi.js

const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host': 'nfl-api1.p.rapidapi.com'
  }
};

import { getCurrentSeason } from './utils';

const BASE_URL = 'https://nfl-api1.p.rapidapi.com';
const PATRIOTS_ID = '17'; 

export async function fetchFromNFL(endpoint, params = '') {
  try {
    const url = `${BASE_URL}/${endpoint}${params ? `?${params}` : ''}`;
    // Cache de 1 hora
    const response = await fetch(url, { ...options, next: { revalidate: 10 } });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error API ${endpoint}: ${response.status}`, errorText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("❌ Error de red:", error);
    return null;
  }
}

export async function getPatriotsSchedule(season = getCurrentSeason()) {
  return await fetchFromNFL('nfl-schedule-team', `teamId=${PATRIOTS_ID}&season=${season}`);
}

export async function getTeamNews() {
  return await fetchFromNFL('nfl-news');
}

export async function getStandings() {
  return await fetchFromNFL('nflstandings', `year=${getCurrentSeason()}`);
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
  return await fetchFromNFL('team/leaders', `teamId=${PATRIOTS_ID}&season=${getCurrentSeason()}&limit=3`);
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
