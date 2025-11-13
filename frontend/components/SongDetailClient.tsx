'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import moment from 'moment';
import { CapoeiraSong } from '@/lib/types';

interface ISongDetailClientProps {
  song: CapoeiraSong;
}

export default function SongDetailClient(props: ISongDetailClientProps) {
  const { song } = props;
  const router = useRouter();
  
  // Determine initial tab - default to video if song unavailable but video is
  const getInitialTab = () => {
    if (!song.mp3Key && song.mp4Key) {
      return 'video';
    }
    return 'song';
  };
  
  const [activeTab, setActiveTab] = useState<'song' | 'video'>(getInitialTab());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-linear-to-br from-orange-50 via-yellow-50 to-green-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900"
    >
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Songs
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="bg-linear-to-r from-orange-500 to-yellow-500 h-3"></div>
          
          <div className="p-8">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
              {song.title}
            </h1>

            <div className="flex gap-6 mb-8 text-sm text-zinc-600 dark:text-zinc-400">
              <div>
                <strong>Created:</strong> {moment(song.createdAt).format('DD MMM YYYY')}
              </div>
              <div>
                <strong>Updated:</strong> {moment(song.updatedAt).format('DD MMM YYYY')}
              </div>
            </div>

            {/* Song/Video Toggle - only show if at least one is available */}
            {(song.mp3Key || song.mp4Key) && (
              <div className="mb-8">
                <div className="inline-flex rounded-lg bg-zinc-200 dark:bg-zinc-700 p-1">
                  <button
                    onClick={() => setActiveTab('song')}
                    disabled={!song.mp3Key}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'song'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow'
                        : song.mp3Key
                        ? 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        : 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    Song
                  </button>
                  <button
                    onClick={() => setActiveTab('video')}
                    disabled={!song.mp4Key}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'video'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow'
                        : song.mp4Key
                        ? 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        : 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    Video
                  </button>
                </div>
              </div>
            )}

            {/* Media Player */}
            {activeTab === 'song' && song.mp3Key && (
              <div className="mb-8 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                  Audio Player
                </h2>
                <div className="bg-zinc-200 dark:bg-zinc-700 rounded-lg p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <svg
                      className="w-12 h-12 text-zinc-500 dark:text-zinc-400"
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
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                    MP3 Player Placeholder
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    S3 Key: {song.mp3Key}
                  </p>
                  <div className="mt-4 bg-zinc-300 dark:bg-zinc-600 rounded-full h-2 w-full max-w-md mx-auto"></div>
                </div>
              </div>
            )}

            {activeTab === 'video' && song.mp4Key && (
              <div className="mb-8 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                  Video Player
                </h2>
                <div className="bg-zinc-200 dark:bg-zinc-700 rounded-lg p-8 text-center aspect-video flex items-center justify-center">
                  <div>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <svg
                        className="w-12 h-12 text-zinc-500 dark:text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                      Video Player Placeholder
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                      S3 Key: {song.mp4Key}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Lyrics */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Lyrics
              </h2>
              {song.lyrics ? (
                <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {song.lyrics}
                </div>
              ) : (
                <div className="text-zinc-500 dark:text-zinc-500 italic text-center py-8">
                  Lyrics unknown
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
