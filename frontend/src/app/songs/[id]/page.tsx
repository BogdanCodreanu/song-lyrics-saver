import { notFound } from 'next/navigation';
import { getSongById } from '@/lib/dynamodb';
import SongDetailClient from '@/components/SongDetailClient';
import { currentUser } from '@clerk/nextjs/server';
import { Metadata } from 'next';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface ISongDetailPageProps {
  params: Promise<{ id: string }>;
}

// Helper function to generate presigned URL for metadata (7-day expiration)
async function getMetadataPresignedUrl(imageKey: string): Promise<string | undefined> {
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'eu-central-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'alemar-capoeira-songs',
      Key: imageKey,
    });

    // Expires in 7 days (604800 seconds) - suitable for metadata caching
    const url = await getSignedUrl(s3Client, command, { expiresIn: 604800 });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL for metadata:', error);
    return undefined;
  }
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

  // Prefer metadataImageKey (1.91:1 landscape) for social previews, fallback to regular imageKey
  const imageKeyForMetadata = song.metadataImageKey || song.imageKey;
  
  // Generate presigned URL for image if a key exists
  const imageUrl = imageKeyForMetadata
    ? await getMetadataPresignedUrl(imageKeyForMetadata)
    : undefined;

  return {
    title: `${song.title}`,
    description: lyricsPreview,
    openGraph: {
      title: song.title,
      description: lyricsPreview,
      images: imageUrl ? [{ 
        url: imageUrl, 
        alt: song.title,
        width: 1200,
        height: 630,
      }] : [],
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
