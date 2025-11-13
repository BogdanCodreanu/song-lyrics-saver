import { notFound } from 'next/navigation';
import moment from 'moment';
import { getSongById } from '@/lib/dynamodb';
import SongDetailClient from '@/components/SongDetailClient';

interface ISongDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SongDetailPage(props: ISongDetailPageProps) {
  const params = await props.params;
  const song = await getSongById(params.id);

  if (!song) {
    notFound();
  }

  return <SongDetailClient song={song} />;
}

