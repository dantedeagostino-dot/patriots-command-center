// src/app/api/player/route.js
import { NextResponse } from 'next/server';
import { getPlayerStats } from '@/lib/nflApi';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing player ID' }, { status: 400 });
  }

  try {
    const stats = await getPlayerStats(id);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}