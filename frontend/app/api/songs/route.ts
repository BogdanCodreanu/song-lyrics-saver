import { NextResponse } from 'next/server';
import { getAllSongs } from '@/lib/dynamodb';

export async function GET() {
  try {
    const songs = await getAllSongs();
    return NextResponse.json({ songs });
  } catch (error) {
    console.error('Error in GET /api/songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}
