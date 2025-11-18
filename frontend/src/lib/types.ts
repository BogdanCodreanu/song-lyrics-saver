export interface CapoeiraSong {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  title: string;
  lyrics?: string;
  audioKey?: string; // S3 bucket key for audio
  videoKey?: string; // S3 bucket key for video
  imageKey?: string; // S3 bucket key for image
  metadataImageKey?: string; // S3 bucket key for 1.91:1 landscape metadata image
}
