'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import moment from 'moment';
import { Icon } from '@iconify/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { CapoeiraSong } from '@/lib/types';
import EditSongModal from './EditSongModal';
import ReactPlayer from 'react-player'

interface ISongDetailClientProps {
  song: CapoeiraSong;
  isAdmin?: boolean;
}

export default function SongDetailClient(props: ISongDetailClientProps) {
  const { song, isAdmin = false } = props;
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  
  // Determine initial tab - default to video if song unavailable but video is
  const getInitialTab = () => {
    const hasAudio = song.audioKey && song.audioKey !== '';
    const hasVideo = song.videoKey && song.videoKey !== '';
    
    if (!hasAudio && hasVideo) {
      return 'video';
    }
    return 'song';
  };
  
  const [activeTab, setActiveTab] = useState<'song' | 'video'>(getInitialTab());

  // Fetch presigned URLs for media files
  useEffect(() => {
    const fetchMediaUrls = async () => {
      setLoadingMedia(true);
      try {
        if (song.audioKey && song.audioKey !== '') {
          const response = await fetch(`/api/media/presigned-url?key=${encodeURIComponent(song.audioKey)}`);
          if (response.ok) {
            const data = await response.json();
            setAudioUrl(data.url);
          }
        }
        
        if (song.videoKey && song.videoKey !== '') {
          const response = await fetch(`/api/media/presigned-url?key=${encodeURIComponent(song.videoKey)}`);
          if (response.ok) {
            const data = await response.json();
            setVideoUrl(data.url);
          }
        }
      } catch (error) {
        console.error('Error fetching media URLs:', error);
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchMediaUrls();
  }, [song.audioKey, song.videoKey]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/songs/${song.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete song');
      }

      // Navigate back to home
      router.push('/');
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Failed to delete song');
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-linear-to-br from-orange-50 via-yellow-50 to-green-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900"
    >
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Songs
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl overflow-hidden relative"
        >
          <div className="bg-linear-to-r from-orange-500 to-yellow-500 h-3"></div>
          
          {/* Hero Image Section */}
          {song.imageKey && song.imageKey !== '' && (
            <div className="w-full h-96 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              <img 
                src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'alemar-capoeira-songs'}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'eu-central-1'}.amazonaws.com/${song.imageKey}`}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                {song.title}
              </h1>
              
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Icon icon="mdi:pencil" className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                  >
                    <Icon icon="mdi:delete" className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="mb-6 text-xs text-zinc-400 dark:text-zinc-500">
              <span>Created: {moment(song.createdAt).format('DD MMM YYYY')}</span>
              <span className="mx-2">•</span>
              <span>Updated: {moment(song.updatedAt).format('DD MMM YYYY')}</span>
            </div>

            {/* Song/Video Toggle - only show if at least one is available */}
            {((song.audioKey && song.audioKey !== '') || (song.videoKey && song.videoKey !== '')) && (
              <div className="mb-8">
                <div className="inline-flex rounded-lg bg-zinc-200 dark:bg-zinc-700 p-1">
                  <button
                    onClick={() => setActiveTab('song')}
                    disabled={!song.audioKey || song.audioKey === ''}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'song'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow'
                        : (song.audioKey && song.audioKey !== '')
                        ? 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        : 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    {(song.audioKey && song.audioKey !== '') && <span>🎵</span>}
                    Song
                  </button>
                  <button
                    onClick={() => setActiveTab('video')}
                    disabled={!song.videoKey || song.videoKey === ''}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'video'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow'
                        : (song.videoKey && song.videoKey !== '')
                        ? 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        : 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    {(song.videoKey && song.videoKey !== '') && <span>🎬</span>}
                    Video
                  </button>
                </div>
              </div>
            )}

            {/* Media Player */}
            {activeTab === 'song' && song.audioKey && song.audioKey !== '' && (
              <div className="mb-8 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                  🎵 Audio Player
                </h2>
                <div className="bg-zinc-200 dark:bg-zinc-700 rounded-lg p-4">
                  {loadingMedia || !audioUrl ? (
                    <div className="bg-zinc-200 dark:bg-zinc-700 rounded-lg p-4 animate-pulse h-16 flex items-center justify-center text-zinc-500">
                      Loading audio...
                    </div>
                  ) : (
                    <>
                      <ReactPlayer src={audioUrl} controls={true} width="100%" height="60px" />
                    </>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                  {song.audioKey.split('/').pop()}
                </p>
              </div>
            )}

            {activeTab === 'video' && song.videoKey && song.videoKey !== '' && (
              <div className="mb-8 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                  🎬 Video Player
                </h2>
                <div className="bg-zinc-900 rounded-lg overflow-hidden aspect-video">
                  {loadingMedia || !videoUrl ? (
                    <div className="bg-zinc-700 rounded-lg p-4 animate-pulse h-full flex items-center justify-center text-zinc-300">
                      Loading video...
                    </div>
                  ) : (
                    <>
                      <ReactPlayer src={videoUrl} controls={true} width="100%" height="100%" />
                    </>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                  {song.videoKey.split('/').pop()}
                </p>
              </div>
            )}

            {/* Lyrics */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Lyrics
              </h2>
              {song.lyrics && song.lyrics !== 'SAMPLE' ? (
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {song.lyrics}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-zinc-500 dark:text-zinc-500 italic text-center py-8">
                  Lyrics unknown
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Modal */}
      <EditSongModal
        isOpen={isEditModalOpen}
        song={song}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Delete Confirmation */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDeleteConfirmOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Delete Song?
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to delete "{song.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
