import { create } from 'zustand';
import { CapoeiraSong } from './types';

interface SongStore {
  songs: CapoeiraSong[];
  loading: boolean;
  error: string | null;
  fetchSongs: () => Promise<void>;
  refetchSongs: () => Promise<void>;
  clearCache: () => void;
  getSongById: (id: string) => CapoeiraSong | undefined;
}

export const useSongStore = create<SongStore>((set, get) => ({
  songs: [],
  loading: false,
  error: null,
  
  fetchSongs: async () => {
    // Only fetch if not already loaded
    if (get().songs.length > 0) {
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/songs');
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      const data = await response.json();
      set({ songs: data.songs, loading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred',
        loading: false 
      });
    }
  },
  
  refetchSongs: async () => {
    // Force refetch regardless of cache
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/songs');
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      const data = await response.json();
      set({ songs: data.songs, loading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred',
        loading: false 
      });
    }
  },
  
  clearCache: () => {
    set({ songs: [], error: null });
  },
  
  getSongById: (id: string) => {
    return get().songs.find(song => song.id === id);
  },
}));

