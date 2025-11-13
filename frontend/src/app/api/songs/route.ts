import { NextRequest, NextResponse } from 'next/server';
import { getAllSongs, createSong } from '@/lib/dynamodb';
import { requireAdmin } from '@/lib/clerk-helpers';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const songs = await getAllSongs();
    songs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return NextResponse.json({ songs });
  } catch (error) {
    console.error('Error in GET /api/songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is admin
    await requireAdmin();

    const body = await request.json();
    const { title, lyrics, audioKey, videoKey, imageKey } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newSong = {
      id: uuidv4(),
      title,
      lyrics: lyrics || '',
      audioKey: audioKey || '',
      videoKey: videoKey || '',
      imageKey: imageKey || '',
      createdAt: now,
      updatedAt: now,
    };

    const createdSong = await createSong(newSong);

    return NextResponse.json({ song: createdSong }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/songs:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create song' },
      { status: 500 }
    );
  }
}
