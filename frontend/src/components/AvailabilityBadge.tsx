'use client';

import { Icon } from '@iconify/react';

interface IAvailabilityBadgeProps {
  type: 'lyrics' | 'song' | 'video' | 'image';
  available: boolean;
}

export default function AvailabilityBadge(props: IAvailabilityBadgeProps) {
  const { type, available } = props;

  const config = {
    lyrics: {
      icon: 'mdi:text-box',
      label: 'Lyrics',
      availableClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    song: {
      icon: 'mdi:music-note',
      label: 'Song',
      availableClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    video: {
      icon: 'mdi:video',
      label: 'Video',
      availableClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    },
    image: {
      icon: 'mdi:image',
      label: 'Image',
      availableClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    },
  };

  const { icon, label, availableClass } = config[type];
  const unavailableClass = 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-500';

  return (
    <span
      className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
        available ? availableClass : unavailableClass
      }`}
    >
      <Icon icon={icon} className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

