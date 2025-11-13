'use client';

import { useEffect, useState } from 'react';
import { CapoeiraSong } from '@/lib/types';

export default function Home() {
  const [songs, setSongs] = useState<CapoeiraSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/songs');
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      const data = await response.json();
      setSongs(data.songs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            🥁 Capoeira Songs
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Collection of traditional capoeira music and lyrics
          </p>
        </header>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {!loading && !error && songs.length === 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              No songs found. Add your first capoeira song!
            </p>
          </div>
        )}

        {!loading && !error && songs.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => (
              <div
                key={song.id}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2"></div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                    {song.title}
                  </h2>
                  
                  <div className="mb-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                      <strong>Created:</strong> {formatDate(song.createdAt)}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      <strong>Updated:</strong> {formatDate(song.updatedAt)}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Lyrics:
                    </h3>
                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded p-3 max-h-40 overflow-y-auto">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {song.lyrics}
                      </p>
                    </div>
                  </div>

                  {song.mp3Key && (
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                      <span className="truncate">{song.mp3Key}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
