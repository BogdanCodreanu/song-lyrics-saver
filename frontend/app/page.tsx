'use client';

import { motion } from 'motion/react';
import SongList from '@/components/SongList';

interface IHomeProps {}

export default function Home(props: IHomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-linear-to-br from-orange-50 via-yellow-50 to-green-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900"
    >
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            🥁 Capoeira Songs
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Collection of traditional capoeira music and lyrics
          </p>
        </header>

        <SongList />
      </div>
    </motion.div>
  );
}
