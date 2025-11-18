'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Icon } from '@iconify/react';

interface IMetadataImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

// Helper to center crop with correct aspect ratio
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function MetadataImageCropper(props: IMetadataImageCropperProps) {
  const { imageFile, onCropComplete, onCancel } = props;

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [processing, setProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result?.toString() || null);
    });
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1.91));
  };

  const getCroppedImage = useCallback(
    async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Set canvas size to cropped dimensions
      canvas.width = crop.width * scaleX;
      canvas.height = crop.height * scaleY;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.95
        );
      });
    },
    []
  );

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImage(imgRef.current, completedCrop);
      onCropComplete(croppedBlob);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-800 rounded-lg shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex-shrink-0 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Crop Metadata Image
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Crop to 1.91:1 ratio (1200x630 recommended)
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!imageSrc ? (
            <div className="flex items-center justify-center py-12">
              <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1.91}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    className="max-w-full max-h-[50vh] object-contain"
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-zinc-200 dark:border-zinc-700 px-6 py-4 bg-white dark:bg-zinc-800">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              disabled={!completedCrop || processing}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {processing && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
              Use Cropped Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
