'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useUser } from '@clerk/nextjs';
import { Icon } from '@iconify/react';
import SongList from '@/components/SongList';
import AddSongModal from '@/components/AddSongModal';

interface IHomeProps {}

export default function Home(props: IHomeProps) {
  const { user } = useUser();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user?.publicMetadata?.isAdmin === true) {
      setIsAdmin(true);
    }
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-linear-to-br from-orange-50 via-yellow-50 to-green-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900"
    >
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                🥁 Capoeira Songs
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Collection of traditional capoeira music and lyrics
              </p>
            </div>
            
            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center gap-2 shadow-lg"
              >
                <Icon icon="mdi:plus" className="w-5 h-5" />
                Add Song
              </button>
            )}
          </div>
        </header>

        <SongList />
      </div>

      <AddSongModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </motion.div>
  );
}
