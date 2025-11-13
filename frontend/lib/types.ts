export interface CapoeiraSong {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  title: string;
  lyrics: string;
  mp3Key: string; // S3 bucket key
}
