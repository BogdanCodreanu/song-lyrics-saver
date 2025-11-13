'use client';

import { motion, AnimatePresence } from 'motion/react';
import SongForm, { SongFormData } from './SongForm';
import { CapoeiraSong } from '@/lib/types';
import { useSongStore } from '@/lib/store';

interface IEditSongModalProps {
  isOpen: boolean;
  song: CapoeiraSong | null;
  onClose: () => void;
}

export default function EditSongModal(props: IEditSongModalProps) {
  const { isOpen, song, onClose } = props;
  const { fetchSongs } = useSongStore();

  const handleSubmit = async (data: SongFormData) => {
    if (!song) return;

    const response = await fetch(`/api/songs/${song.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update song');
    }

    // Refresh songs list
    await fetchSongs();
    onClose();
  };

  if (!isOpen || !song) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-800 rounded-lg shadow-xl"
          >
            <div className="sticky top-0 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Edit Song
              </h2>
            </div>

            <div className="p-6">
              <SongForm song={song} onSubmit={handleSubmit} onCancel={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

