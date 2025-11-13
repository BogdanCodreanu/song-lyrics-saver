'use client';

import { motion } from 'motion/react';
import moment from 'moment';
import { Icon } from '@iconify/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import AvailabilityBadge from './AvailabilityBadge';

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
}

export default function SongCard(props: ISongCardProps) {
  const { song, index, onClick } = props;

  return (
    <motion.div
      key={song.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => onClick(song.id)}
      className="bg-white dark:bg-zinc-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden cursor-pointer"
    >
      <div className="bg-linear-to-r from-orange-500 to-yellow-500 h-2"></div>
      
      {/* Horizontal Layout: Image on left, Details on right */}
      <div className="flex flex-col sm:flex-row">
        {/* Image Section - Portrait 2:3 ratio */}
        {song.imageKey && song.imageKey !== '' ? (
          <div className="w-full sm:w-48 shrink-0 aspect-2/3 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            <img 
              src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'alemar-capoeira-songs'}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'eu-central-1'}.amazonaws.com/${song.imageKey}`}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full sm:w-48 shrink-0 aspect-2/3 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <Icon icon="mdi:image-off" className="w-16 h-16 text-zinc-400 dark:text-zinc-600" />
          </div>
        )}
        
        {/* Details Section */}
        <div className="p-6 flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            {song.title}
          </h2>
          
          {/* Availability Badges */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <AvailabilityBadge type="lyrics" available={!!song.lyrics && song.lyrics !== 'SAMPLE'} />
            <AvailabilityBadge type="song" available={!!song.audioKey && song.audioKey !== ''} />
            <AvailabilityBadge type="video" available={!!song.videoKey && song.videoKey !== ''} />
          </div>

          <div className="mb-4 text-xs text-zinc-400 dark:text-zinc-500">
            <span>Created: {moment(song.createdAt).format('DD MMM YYYY')}</span>
            <span className="mx-2">•</span>
            <span>Updated: {moment(song.updatedAt).format('DD MMM YYYY')}</span>
          </div>

          {/* Lyrics Preview with Fade */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Lyrics:
            </h3>
            {song.lyrics && song.lyrics !== 'SAMPLE' ? (
              <div className="relative bg-zinc-50 dark:bg-zinc-900 rounded p-3 h-24 overflow-hidden">
                <div className="text-sm prose prose-sm prose-zinc dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {song.lyrics}
                  </ReactMarkdown>
                </div>
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
      </div>
    </motion.div>
  );
}

