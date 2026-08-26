import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Track, Album, Artist, Folder, Playlist } from '../types/music';
import { MediaLibraryService } from '../services/mediaLibraryService';
import { StorageService } from '../services/storageService';

interface LibraryContextType {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  folders: Folder[];
  playlists: Playlist[];
  favorites: Set<string>;
  isScanning: boolean;
  scanProgress: { count: number; currentTitle: string };
  hasPermission: boolean;
  rescanLibrary: () => Promise<void>;
  createPlaylist: (title: string, description?: string) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  toggleFavorite: (trackId: string) => Promise<boolean>;
  isFavorite: (trackId: string) => boolean;
  getTrackById: (id: string) => Track | undefined;
  getAlbumById: (id: string) => Album | undefined;
  getArtistByName: (name: string) => Artist | undefined;
  getPlaylistById: (id: string) => Playlist | undefined;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<{ count: number; currentTitle: string }>({
    count: 0,
    currentTitle: '',
  });

  const loadInitialData = useCallback(async () => {
    setIsScanning(true);
    try {
      // 1. Load favorites and playlists from storage
      const [storedFavs, storedPlaylists] = await Promise.all([
        StorageService.getFavorites(),
        StorageService.getPlaylists(),
      ]);

      const favSet = new Set(storedFavs);
      setFavorites(favSet);

      // Default sample playlists if none exist
      if (storedPlaylists.length === 0) {
        const defaultPlaylists: Playlist[] = [
          {
            id: 'pl-synthwave',
            title: 'Synthwave Essentials',
            description: 'Neon retro futuristic beats',
            artworkUri: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            trackIds: ['bundled-1', 'bundled-2', 'bundled-3', 'bundled-4'],
          },
          {
            id: 'pl-latenight',
            title: 'Late Night Drive',
            description: 'Smooth atmospheric night journeys',
            artworkUri: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            trackIds: ['bundled-6', 'bundled-7', 'bundled-10', 'bundled-12'],
          },
        ];
        await StorageService.savePlaylists(defaultPlaylists);
        setPlaylists(defaultPlaylists);
      } else {
        setPlaylists(storedPlaylists);
      }

      // 2. Check permission and scan library
      const permitted = await MediaLibraryService.checkPermissions();
      setHasPermission(permitted);

      const scannedTracks = await MediaLibraryService.scanDeviceAudio((count, title) => {
        setScanProgress({ count, currentTitle: title });
      });

      // Mark favorites
      const mappedTracks = scannedTracks.map((t) => ({
        ...t,
        isFavorite: favSet.has(t.id),
      }));

      const indexed = MediaLibraryService.indexLibrary(mappedTracks);

      setTracks(indexed.tracks);
      setAlbums(indexed.albums);
      setArtists(indexed.artists);
      setFolders(indexed.folders);
    } catch (e) {
      console.error('Error loading library:', e);
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const rescanLibrary = async () => {
    setIsScanning(true);
    try {
      const permitted = await MediaLibraryService.requestPermissions();
      setHasPermission(permitted);

      const scanned = await MediaLibraryService.scanDeviceAudio((count, title) => {
        setScanProgress({ count, currentTitle: title });
      });

      const favSet = favorites;
      const mappedTracks = scanned.map((t) => ({
        ...t,
        isFavorite: favSet.has(t.id),
      }));

      const indexed = MediaLibraryService.indexLibrary(mappedTracks);
      setTracks(indexed.tracks);
      setAlbums(indexed.albums);
      setArtists(indexed.artists);
      setFolders(indexed.folders);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleFavorite = async (trackId: string): Promise<boolean> => {
    const isFav = await StorageService.toggleFavorite(trackId);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) {
        next.add(trackId);
      } else {
        next.delete(trackId);
      }
      return next;
    });

    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isFavorite: isFav } : t))
    );
    return isFav;
  };

  const isFavorite = (trackId: string): boolean => {
    return favorites.has(trackId);
  };

  const createPlaylist = async (title: string, description?: string): Promise<Playlist> => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      title: title.trim(),
      description: description?.trim() || 'Custom Playlist',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      trackIds: [],
    };

    const updated = [newPlaylist, ...playlists];
    setPlaylists(updated);
    await StorageService.savePlaylists(updated);
    return newPlaylist;
  };

  const deletePlaylist = async (playlistId: string): Promise<void> => {
    const updated = playlists.filter((p) => p.id !== playlistId);
    setPlaylists(updated);
    await StorageService.savePlaylists(updated);
  };

  const addTrackToPlaylist = async (playlistId: string, trackId: string): Promise<void> => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId) {
        if (!p.trackIds.includes(trackId)) {
          return {
            ...p,
            trackIds: [...p.trackIds, trackId],
            updatedAt: Date.now(),
          };
        }
      }
      return p;
    });
    setPlaylists(updated);
    await StorageService.savePlaylists(updated);
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string): Promise<void> => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId) {
        return {
          ...p,
          trackIds: p.trackIds.filter((id) => id !== trackId),
          updatedAt: Date.now(),
        };
      }
      return p;
    });
    setPlaylists(updated);
    await StorageService.savePlaylists(updated);
  };

  const getTrackById = (id: string): Track | undefined => {
    return tracks.find((t) => t.id === id);
  };

  const getAlbumById = (id: string): Album | undefined => {
    return albums.find((a) => a.id === id);
  };

  const getArtistByName = (name: string): Artist | undefined => {
    return artists.find((a) => a.name.toLowerCase() === name.toLowerCase());
  };

  const getPlaylistById = (id: string): Playlist | undefined => {
    return playlists.find((p) => p.id === id);
  };

  return (
    <LibraryContext.Provider
      value={{
        tracks,
        albums,
        artists,
        folders,
        playlists,
        favorites,
        isScanning,
        scanProgress,
        hasPermission,
        rescanLibrary,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        toggleFavorite,
        isFavorite,
        getTrackById,
        getAlbumById,
        getArtistByName,
        getPlaylistById,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
