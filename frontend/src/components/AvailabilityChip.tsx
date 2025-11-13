'use client';

import { Icon } from '@iconify/react';

interface IAvailabilityChipProps {
  type: 'lyrics' | 'song' | 'video' | 'image';
  available: boolean;
}

export default function AvailabilityChip(props: IAvailabilityChipProps) {
  const { type, available } = props;

  const config = {
    lyrics: {
      icon: 'mdi:text-box',
      label: 'Lyrics',
      availableClass: 'bg-green-500 text-white dark:bg-green-600',
    },
    song: {
      icon: 'mdi:music-note',
      label: 'Song',
      availableClass: 'bg-blue-500 text-white dark:bg-blue-600',
    },
    video: {
      icon: 'mdi:video',
      label: 'Video',
      availableClass: 'bg-purple-500 text-white dark:bg-purple-600',
    },
    image: {
      icon: 'mdi:image',
      label: 'Image',
      availableClass: 'bg-orange-500 text-white dark:bg-orange-600',
    },
  };

  const { icon, label, availableClass } = config[type];
  const unavailableClass = 'bg-zinc-300 text-zinc-500 dark:bg-zinc-600 dark:text-zinc-400';

  return (
    <span
      className={`flex items-center justify-center w-6 h-6 rounded-full ${
        available ? availableClass : unavailableClass
      }`}
      title={`${label}${available ? ' available' : ' unavailable'}`}
    >
      <Icon icon={icon} className="w-3.5 h-3.5" />
    </span>
  );
}

