'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { CapoeiraSong } from '@/lib/types';
import { Icon } from '@iconify/react';

// Dynamically import markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface ISongFormProps {
  song?: CapoeiraSong;
  onSubmit: (data: SongFormData) => Promise<void>;
  onCancel: () => void;
}

export interface SongFormData {
  title: string;
  lyrics: string;
  audioKey: string;
  videoKey: string;
  imageKey: string;
  metadataImageKey: string;
  filesToDelete?: string[]; // S3 keys of files to delete
}

export default function SongForm(props: ISongFormProps) {
  const { song, onSubmit, onCancel } = props;
  
  const [title, setTitle] = useState(song?.title || '');
  const [lyrics, setLyrics] = useState(song?.lyrics || '');
  const [audioKey, setAudioKey] = useState(song?.audioKey || '');
  const [videoKey, setVideoKey] = useState(song?.videoKey || '');
  const [imageKey, setImageKey] = useState(song?.imageKey || '');
  const [metadataImageKey, setMetadataImageKey] = useState(song?.metadataImageKey || '');
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [metadataImageFile, setMetadataImageFile] = useState<File | null>(null);
  
  const [metadataImageError, setMetadataImageError] = useState<string | null>(null);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);

  const handleRemoveFile = (type: 'audio' | 'video' | 'image' | 'metadata-image', currentKey: string) => {
    if (!currentKey) return;
    
    // Add to files to delete
    setFilesToDelete(prev => [...prev, currentKey]);
    
    // Clear the key
    if (type === 'audio') {
      setAudioKey('');
      setAudioFile(null);
    } else if (type === 'video') {
      setVideoKey('');
      setVideoFile(null);
    } else if (type === 'image') {
      setImageKey('');
      setImageFile(null);
    } else if (type === 'metadata-image') {
      setMetadataImageKey('');
      setMetadataImageFile(null);
      setMetadataImageError(null);
    }
  };

  const validateImageAspectRatio = (file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        const width = img.width;
        const height = img.height;
        const ratio = width / height;

        // Valid if ratio is between 1.85 and 1.97 (±3% around 1.91)
        if (ratio >= 1.85 && ratio <= 1.97) {
          resolve({ valid: true });
        } else {
          resolve({
            valid: false,
            error: `Image must have 1.91:1 aspect ratio (e.g., 1200x630px). Current: ${width}x${height} (${ratio.toFixed(2)}:1)`
          });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ valid: false, error: 'Failed to load image' });
      };

      img.src = objectUrl;
    });
  };

  const handleMetadataImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMetadataImageError(null);
    
    const validation = await validateImageAspectRatio(file);
    if (!validation.valid) {
      setMetadataImageError(validation.error || 'Invalid image');
      setMetadataImageFile(null);
      // Clear the input
      e.target.value = '';
      return;
    }

    setMetadataImageFile(file);
  };

  const uploadFile = async (file: File, fieldType: 'audio' | 'video' | 'image' | 'metadata-image'): Promise<string> => {
    // Get presigned URL
    const response = await fetch('/api/upload/presigned-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        fieldType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get upload URL for ${fieldType}`);
    }

    const { presignedUrl, s3Key } = await response.json();

    // Upload file to S3
    setUploadProgress(prev => ({ ...prev, [fieldType]: 0 }));
    
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload ${fieldType}`);
    }

    setUploadProgress(prev => ({ ...prev, [fieldType]: 100 }));
    return s3Key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Block submit if there's a metadata image error
    if (metadataImageError) {
      setError('Please fix the metadata image error before submitting');
      return;
    }

    setUploading(true);

    try {
      let finalAudioKey = audioKey;
      let finalVideoKey = videoKey;
      let finalImageKey = imageKey;
      let finalMetadataImageKey = metadataImageKey;
      const deletionList = [...filesToDelete];

      // Upload new files if selected and track old files for deletion
      if (audioFile) {
        // If replacing an existing file, mark the old one for deletion
        if (song?.audioKey && song.audioKey !== '' && !deletionList.includes(song.audioKey)) {
          deletionList.push(song.audioKey);
        }
        finalAudioKey = await uploadFile(audioFile, 'audio');
      }
      if (videoFile) {
        // If replacing an existing file, mark the old one for deletion
        if (song?.videoKey && song.videoKey !== '' && !deletionList.includes(song.videoKey)) {
          deletionList.push(song.videoKey);
        }
        finalVideoKey = await uploadFile(videoFile, 'video');
      }
      if (imageFile) {
        // If replacing an existing file, mark the old one for deletion
        if (song?.imageKey && song.imageKey !== '' && !deletionList.includes(song.imageKey)) {
          deletionList.push(song.imageKey);
        }
        finalImageKey = await uploadFile(imageFile, 'image');
      }
      if (metadataImageFile) {
        // If replacing an existing file, mark the old one for deletion
        if (song?.metadataImageKey && song.metadataImageKey !== '' && !deletionList.includes(song.metadataImageKey)) {
          deletionList.push(song.metadataImageKey);
        }
        finalMetadataImageKey = await uploadFile(metadataImageFile, 'metadata-image');
      }

      await onSubmit({
        title,
        lyrics,
        audioKey: finalAudioKey,
        videoKey: finalVideoKey,
        imageKey: finalImageKey,
        metadataImageKey: finalMetadataImageKey,
        filesToDelete: deletionList.length > 0 ? deletionList : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Lyrics */}
      <div>
        <label htmlFor="lyrics" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Lyrics (Markdown supported)
        </label>
        <div data-color-mode="auto">
          <MDEditor
            value={lyrics}
            onChange={(val) => setLyrics(val || '')}
            height={300}
            preview="edit"
            hideToolbar={false}
          />
        </div>
      </div>

      {/* Audio Upload */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Audio File
        </label>
        {audioKey && !audioFile && (
          <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-600" />
              Current: {audioKey.split('/').pop()}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveFile('audio', audioKey)}
              className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs"
            >
              <Icon icon="mdi:delete" className="w-4 h-4" />
              Remove
            </button>
          </div>
        )}
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        />
        {uploadProgress.audio !== undefined && uploadProgress.audio < 100 && (
          <div className="mt-2">
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress.audio}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Video File
        </label>
        {videoKey && !videoFile && (
          <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-600" />
              Current: {videoKey.split('/').pop()}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveFile('video', videoKey)}
              className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs"
            >
              <Icon icon="mdi:delete" className="w-4 h-4" />
              Remove
            </button>
          </div>
        )}
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        />
        {uploadProgress.video !== undefined && uploadProgress.video < 100 && (
          <div className="mt-2">
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress.video}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Image File
        </label>
        {imageKey && !imageFile && (
          <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-600" />
              Current: {imageKey.split('/').pop()}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveFile('image', imageKey)}
              className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs"
            >
              <Icon icon="mdi:delete" className="w-4 h-4" />
              Remove
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        />
        {uploadProgress.image !== undefined && uploadProgress.image < 100 && (
          <div className="mt-2">
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress.image}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Metadata Image Upload (1.91:1) */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Metadata Image (1.91:1)
        </label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
          Used for WhatsApp/social previews. Recommended 1200x630px. Must be 1.91:1 landscape ratio.
        </p>
        {metadataImageKey && !metadataImageFile && (
          <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-600" />
              Current: {metadataImageKey.split('/').pop()}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveFile('metadata-image', metadataImageKey)}
              className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs"
            >
              <Icon icon="mdi:delete" className="w-4 h-4" />
              Remove
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleMetadataImageSelect}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        />
        {metadataImageError && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <Icon icon="mdi:alert-circle" className="w-4 h-4" />
            {metadataImageError}
          </div>
        )}
        {uploadProgress['metadata-image'] !== undefined && uploadProgress['metadata-image'] < 100 && (
          <div className="mt-2">
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress['metadata-image']}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={uploading}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading || !title || !!metadataImageError}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {uploading && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
          {song ? 'Update Song' : 'Create Song'}
        </button>
      </div>
    </form>
  );
}
