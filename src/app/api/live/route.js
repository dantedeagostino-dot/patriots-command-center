import { NextResponse } from 'next/server';
import { getGamePlayByPlay, getGameBoxScore, getGameOdds } from '@/lib/nflApi';

export async function GET(request) {
  // Obtenemos el ID del partido de la URL
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('id');

  if (!gameId) {
    return NextResponse.json({ error: 'Missing game ID' }, { status: 400 });
  }

  try {
    // Pedimos todos los datos en paralelo para ser rápidos
    const [playsRaw, boxScoreRaw, oddsRaw] = await Promise.all([
      getGamePlayByPlay(gameId),
      getGameBoxScore(gameId),
      getGameOdds(gameId)
    ]);

    return NextResponse.json({
      plays: playsRaw,
      boxScore: boxScoreRaw,
      odds: oddsRaw
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch live data' }, { status: 500 });
  }
}