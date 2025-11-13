'use client';

import { motion, AnimatePresence } from 'motion/react';
import SongForm, { SongFormData } from './SongForm';
import { useSongStore } from '@/lib/store';

interface IAddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSongModal(props: IAddSongModalProps) {
  const { isOpen, onClose } = props;
  const { fetchSongs } = useSongStore();

  const handleSubmit = async (data: SongFormData) => {
    const response = await fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create song');
    }

    // Refresh songs list
    await fetchSongs();
    onClose();
  };

  if (!isOpen) return null;

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
                Add New Song
              </h2>
            </div>

            <div className="p-6">
              <SongForm onSubmit={handleSubmit} onCancel={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

