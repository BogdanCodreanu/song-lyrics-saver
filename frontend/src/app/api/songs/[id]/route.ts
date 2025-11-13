import { NextRequest, NextResponse } from 'next/server';
import { getSongById, updateSong, deleteSong } from '@/lib/dynamodb';
import { requireAdmin } from '@/lib/clerk-helpers';
import { deleteS3Object } from '@/lib/s3';

interface IRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: IRouteContext
) {
  try {
    const { id } = await context.params;
    const song = await getSongById(id);

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ song });
  } catch (error) {
    console.error('Error in GET /api/songs/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch song' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: IRouteContext
) {
  try {
    // Verify user is admin
    await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();
    const { title, lyrics, audioKey, videoKey, imageKey, filesToDelete } = body;

    // Get existing song to handle file deletions
    const existingSong = await getSongById(id);
    if (!existingSong) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Delete files that are explicitly marked for deletion or being replaced
    if (filesToDelete && Array.isArray(filesToDelete)) {
      for (const fileKey of filesToDelete) {
        if (fileKey && fileKey !== '') {
          try {
            await deleteS3Object(fileKey);
          } catch (err) {
            console.error(`Failed to delete S3 object: ${fileKey}`, err);
          }
        }
      }
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (lyrics !== undefined) updates.lyrics = lyrics;
    if (audioKey !== undefined) updates.audioKey = audioKey;
    if (videoKey !== undefined) updates.videoKey = videoKey;
    if (imageKey !== undefined) updates.imageKey = imageKey;

    const updatedSong = await updateSong(id, updates);

    return NextResponse.json({ song: updatedSong });
  } catch (error) {
    console.error('Error in PUT /api/songs/[id]:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update song' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: IRouteContext
) {
  try {
    // Verify user is admin
    await requireAdmin();

    const { id } = await context.params;

    // Get song to delete associated files
    const song = await getSongById(id);
    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Delete associated S3 files
    if (song.audioKey) await deleteS3Object(song.audioKey);
    if (song.videoKey) await deleteS3Object(song.videoKey);
    if (song.imageKey) await deleteS3Object(song.imageKey);

    // Delete song from database
    await deleteSong(id);

    return NextResponse.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/songs/[id]:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete song' },
      { status: 500 }
    );
  }
}

