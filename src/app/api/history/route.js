import { NextResponse } from 'next/server';
import { getGameBoxScore } from '@/lib/nflApi';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('id');

  if (!gameId) {
    return NextResponse.json({ error: 'Missing game ID' }, { status: 400 });
  }

  try {
    const boxScoreRaw = await getGameBoxScore(gameId);
    return NextResponse.json({
      boxScore: boxScoreRaw
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history data' }, { status: 500 });
  }
}
