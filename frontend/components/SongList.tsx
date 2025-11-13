'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import moment from 'moment';
import { useSongStore } from '@/lib/store';
import AvailabilityBadge from './AvailabilityBadge';

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
        <motion.div
          key={song.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          onClick={() => handleCardClick(song.id)}
          className="bg-white dark:bg-zinc-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden cursor-pointer"
        >
          <div className="bg-linear-to-r from-orange-500 to-yellow-500 h-2"></div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
              {song.title}
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                <strong>Created:</strong> {moment(song.createdAt).format('DD MMM YYYY')}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                <strong>Updated:</strong> {moment(song.updatedAt).format('DD MMM YYYY')}
              </p>
            </div>

            {/* Availability Badges */}
            <div className="flex gap-2 mb-4">
              <AvailabilityBadge type="lyrics" available={!!song.lyrics} />
              <AvailabilityBadge type="song" available={!!song.mp3Key} />
              <AvailabilityBadge type="video" available={!!song.mp4Key} />
            </div>

            {/* Lyrics Preview with Fade */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Lyrics:
              </h3>
              {song.lyrics ? (
                <div className="relative bg-zinc-50 dark:bg-zinc-900 rounded p-3 h-24 overflow-hidden">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {song.lyrics}
                  </p>
                  {/* Vertical fade to black */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-zinc-50 dark:from-zinc-900 to-transparent pointer-events-none"></div>
                </div>
              ) : (
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded p-3 h-24 flex items-center justify-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 italic">
                    No lyrics available
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
