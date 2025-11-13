import { notFound } from 'next/navigation';
import { getSongById } from '@/lib/dynamodb';
import SongDetailClient from '@/components/SongDetailClient';
import { currentUser } from '@clerk/nextjs/server';

interface ISongDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SongDetailPage(props: ISongDetailPageProps) {
  const params = await props.params;
  const song = await getSongById(params.id);

  if (!song) {
    notFound();
  }

  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.isAdmin === true;

  console.log(song);

  return <SongDetailClient song={song} isAdmin={isAdmin} />;
}

