'use client';

import { motion, AnimatePresence } from 'motion/react';
import moment from 'moment';
import { Icon } from '@iconify/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import AvailabilityChip from './AvailabilityChip';

interface ISongCardProps {
  song: {
    id: string;
    title: string;
    lyrics?: string;
    imageKey?: string;
    audioKey?: string;
    videoKey?: string;
    createdAt: string;
    updatedAt: string;
  };
  index: number;
  onClick: (id: string) => void;
  loading?: boolean;
}

export default function SongCard(props: ISongCardProps) {
  const { song, index, onClick, loading = false } = props;

  return (
    <motion.div
      key={song.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => !loading && onClick(song.id)}
      className={`bg-white dark:bg-zinc-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden relative ${
        loading ? 'pointer-events-none' : 'cursor-pointer'
      }`}
      role="button"
      tabIndex={loading ? -1 : 0}
      aria-busy={loading}
      aria-disabled={loading}
      onKeyDown={(e) => {
        if (!loading && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(song.id);
        }
      }}
    >
      <div className="bg-linear-to-r from-orange-500 to-yellow-500 h-2"></div>
      
      {/* Horizontal Layout: Image on left, Details on right */}
      <div className={`flex items-stretch h-full transition-opacity duration-200 ${loading ? 'opacity-50' : ''}`}>
        {/* Image Section - Compact square on mobile, full height on desktop */}
        {song.imageKey && song.imageKey !== '' ? (
          <div className="w-32 sm:w-48 shrink-0 aspect-square sm:aspect-auto overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            <img 
              src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'alemar-capoeira-songs'}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'eu-central-1'}.amazonaws.com/${song.imageKey}`}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-32 sm:w-48 shrink-0 aspect-square sm:aspect-auto bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <Icon icon="mdi:image-off" className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-400 dark:text-zinc-600" />
          </div>
        )}
        
        {/* Details Section */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col relative">
          {/* Availability Chips - Small circular icons in top right corner */}
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <AvailabilityChip type="lyrics" available={!!song.lyrics && song.lyrics !== 'SAMPLE'} />
            <AvailabilityChip type="song" available={!!song.audioKey && song.audioKey !== ''} />
            <AvailabilityChip type="video" available={!!song.videoKey && song.videoKey !== ''} />
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3 pr-20">
            {song.title}
          </h2>
          
          {/* Lyrics Preview - Limited height with fade */}
          <div className="flex-1 mb-3 min-h-[200px] max-h-[200px]">
            {song.lyrics && song.lyrics !== 'SAMPLE' ? (
              <div className="relative bg-zinc-50 dark:bg-zinc-900 rounded p-3 h-full overflow-hidden">
                <div className="text-xs sm:text-sm prose prose-sm prose-zinc dark:prose-invert max-w-none line-clamp-6 sm:line-clamp-8">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {song.lyrics}
                  </ReactMarkdown>
                </div>
                {/* Vertical fade to black */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-zinc-50 dark:from-zinc-900 to-transparent pointer-events-none"></div>
              </div>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded p-3 h-full flex items-center justify-center">
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500 italic">
                  No lyrics available
                </p>
              </div>
            )}
          </div>

          {/* Dates - Bottom corners */}
          <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
            <span>{moment(song.createdAt).format('DD MMM YYYY')}</span>
            <span>{moment(song.updatedAt).format('DD MMM YYYY')}</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-lg z-20"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/60 border-t-transparent"></div>
            <span className="sr-only" aria-live="polite">
              Loading
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
