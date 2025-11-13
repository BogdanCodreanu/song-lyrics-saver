'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSongStore } from '@/lib/store';
import SongCard from './SongCard';

interface ISongListProps {}

export default function SongList(props: ISongListProps) {
  const router = useRouter();
  const { songs, loading, error, fetchSongs } = useSongStore();

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const handleCardClick = (id: string) => {
    router.push(`/songs/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <p className="text-red-800 dark:text-red-200">
          <strong>Error:</strong> {error}
        </p>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-8 text-center">
        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
          No songs found. Add your first capoeira song!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {songs.map((song, index) => (
        <SongCard
          key={song.id}
          song={song}
          index={index}
          onClick={handleCardClick}
        />
      ))}
    </div>
  );
}
