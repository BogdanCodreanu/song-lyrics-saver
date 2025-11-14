import { notFound } from 'next/navigation';
import { getSongById } from '@/lib/dynamodb';
import SongDetailClient from '@/components/SongDetailClient';
import { currentUser } from '@clerk/nextjs/server';
import { Metadata } from 'next';

interface ISongDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: ISongDetailPageProps): Promise<Metadata> {
  const params = await props.params;
  const song = await getSongById(params.id);

  if (!song) {
    return {
      title: 'Song Not Found',
      description: 'The requested song could not be found.',
    };
  }

  // Extract first portion of lyrics for description (remove markdown and truncate)
  const lyricsPreview = song.lyrics && song.lyrics !== 'SAMPLE'
    ? song.lyrics
        .replace(/[#*_~`]/g, '') // Remove markdown formatting
        .replace(/\n+/g, ' ') // Replace line breaks with spaces
        .trim()
        .substring(0, 150) + '...'
    : 'View the lyrics and media for this Capoeira song';

  // Build S3 image URL if imageKey exists
  const imageUrl = song.imageKey
    ? `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'alemar-capoeira-songs'}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'eu-central-1'}.amazonaws.com/${song.imageKey}`
    : undefined;

  return {
    title: `${song.title}`,
    description: lyricsPreview,
    openGraph: {
      title: song.title,
      description: lyricsPreview,
      images: imageUrl ? [{ url: imageUrl, alt: song.title }] : [],
      type: 'music.song',
    },
    twitter: {
      card: 'summary_large_image',
      title: song.title,
      description: lyricsPreview,
      images: imageUrl ? [imageUrl] : [],
    },
  };
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

