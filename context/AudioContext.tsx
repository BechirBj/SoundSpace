import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Track, RepeatMode, SleepTimerState } from '../types/music';
import { audioPlayer } from '../services/audioService';
import { StorageService } from '../services/storageService';
import { sleepTimerManager } from '../services/sleepTimerService';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffling: boolean;
  queue: Track[];
  queueIndex: number;
  recentlyPlayed: string[];
  sleepTimerState: SleepTimerState;
  playTrack: (track: Track, newQueue?: Track[], startIndex?: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  playNextInQueue: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setSleepTimer: (minutes: number) => void;
  setStopAtTrackEnd: () => void;
  cancelSleepTimer: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Helper for Fisher-Yates array shuffling
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('OFF');
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);
  const [sleepTimerState, setSleepTimerState] = useState<SleepTimerState>(
    sleepTimerManager.getState()
  );

  const stateRef = useRef({
    currentTrack,
    isPlaying,
    queue,
    queueIndex,
    repeatMode,
    isShuffling,
    originalQueue,
  });

  stateRef.current = {
    currentTrack,
    isPlaying,
    queue,
    queueIndex,
    repeatMode,
    isShuffling,
    originalQueue,
  };

  // Load persisted state
  useEffect(() => {
    async function loadPersistedState() {
      const [savedRecent, savedPlayback] = await Promise.all([
        StorageService.getRecentlyPlayed(),
        StorageService.getLastPlaybackState(),
      ]);

      if (savedRecent) {
        setRecentlyPlayed(savedRecent);
      }

      if (savedPlayback) {
        setRepeatMode(savedPlayback.repeatMode || 'OFF');
        setIsShuffling(savedPlayback.isShuffling || false);
      }
    }
    loadPersistedState();
  }, []);

  // Subscribe to audio engine status
  useEffect(() => {
    const unsubscribeStatus = audioPlayer.subscribeStatus((status) => {
      setIsPlaying(status.isPlaying);
      setIsBuffering(status.isBuffering);
      setPosition(status.position);
      if (status.duration > 0) {
        setDuration(status.duration);
      }
    });

    const unsubscribeTimer = sleepTimerManager.subscribe((tState) => {
      setSleepTimerState(tState);
    });

    sleepTimerManager.setOnExpire(async () => {
      await audioPlayer.pause();
      setIsPlaying(false);
    });

    audioPlayer.setOnTrackFinished(async () => {
      sleepTimerManager.onTrackEnded();
      await handleTrackFinished();
    });

    return () => {
      unsubscribeStatus();
      unsubscribeTimer();
    };
  }, []);

  const handleTrackFinished = async () => {
    const { repeatMode, queue, queueIndex } = stateRef.current;

    if (repeatMode === 'ONE') {
      // Repeat same track from start
      await audioPlayer.seekTo(0);
      await audioPlayer.play();
      return;
    }

    if (queueIndex < queue.length - 1) {
      // Advance to next in queue
      const nextIndex = queueIndex + 1;
      const nextSong = queue[nextIndex];
      setQueueIndex(nextIndex);
      await playTrack(nextSong, queue, nextIndex);
    } else if (repeatMode === 'ALL' && queue.length > 0) {
      // Loop back to start of queue
      setQueueIndex(0);
      await playTrack(queue[0], queue, 0);
    } else {
      // Finished queue, stop
      await audioPlayer.stop();
      setIsPlaying(false);
      setPosition(0);
    }
  };

  const playTrack = async (
    track: Track,
    newQueue?: Track[],
    startIndex?: number
  ): Promise<void> => {
    let activeQueue = newQueue || stateRef.current.queue;
    let idx = startIndex !== undefined ? startIndex : activeQueue.findIndex((t) => t.id === track.id);

    if (newQueue) {
      setOriginalQueue(newQueue);
      if (isShuffling) {
        const shuffled = shuffleArray(newQueue.filter((t) => t.id !== track.id));
        activeQueue = [track, ...shuffled];
        idx = 0;
      }
      setQueue(activeQueue);
    }

    if (idx === -1) {
      activeQueue = [track, ...activeQueue];
      setQueue(activeQueue);
      idx = 0;
    }

    setQueueIndex(idx);
    setCurrentTrack(track);
    setDuration(track.duration);
    setPosition(0);

    const played = await audioPlayer.loadAndPlay(track, 0);
    if (played) {
      setIsPlaying(true);
    }

    // Add to recently played and persist
    const updatedRecent = await StorageService.addRecentlyPlayed(track.id);
    setRecentlyPlayed(updatedRecent);

    await StorageService.saveLastPlaybackState({
      trackId: track.id,
      position: 0,
      repeatMode: stateRef.current.repeatMode,
      isShuffling: stateRef.current.isShuffling,
      queueTrackIds: activeQueue.map((t) => t.id),
    });
  };

  const togglePlayPause = async (): Promise<void> => {
    if (!currentTrack) {
      if (queue.length > 0) {
        await playTrack(queue[0], queue, 0);
      }
      return;
    }
    await audioPlayer.togglePlayPause();
  };

  const seekTo = async (seconds: number): Promise<void> => {
    setPosition(seconds);
    await audioPlayer.seekTo(seconds);
  };

  const nextTrack = async (): Promise<void> => {
    const { queue, queueIndex, repeatMode } = stateRef.current;
    if (queue.length === 0) return;

    if (queueIndex < queue.length - 1) {
      const nextIdx = queueIndex + 1;
      setQueueIndex(nextIdx);
      await playTrack(queue[nextIdx], queue, nextIdx);
    } else if (repeatMode === 'ALL') {
      setQueueIndex(0);
      await playTrack(queue[0], queue, 0);
    } else {
      // Loop to beginning if at end
      setQueueIndex(0);
      await playTrack(queue[0], queue, 0);
    }
  };

  const previousTrack = async (): Promise<void> => {
    // If played more than 3 seconds, restart current track
    if (position > 3) {
      await seekTo(0);
      return;
    }

    const { queue, queueIndex } = stateRef.current;
    if (queue.length === 0) return;

    if (queueIndex > 0) {
      const prevIdx = queueIndex - 1;
      setQueueIndex(prevIdx);
      await playTrack(queue[prevIdx], queue, prevIdx);
    } else {
      await seekTo(0);
    }
  };

  const toggleShuffle = () => {
    const nextShuffle = !isShuffling;
    setIsShuffling(nextShuffle);

    if (nextShuffle) {
      // Shuffle upcoming queue while keeping current track
      const current = currentTrack;
      if (current) {
        const remaining = originalQueue.filter((t) => t.id !== current.id);
        const shuffled = [current, ...shuffleArray(remaining)];
        setQueue(shuffled);
        setQueueIndex(0);
      } else {
        setQueue(shuffleArray(originalQueue));
      }
    } else {
      // Restore original queue
      setQueue(originalQueue);
      if (currentTrack) {
        const origIdx = originalQueue.findIndex((t) => t.id === currentTrack.id);
        setQueueIndex(origIdx >= 0 ? origIdx : 0);
      }
    }
  };

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['OFF', 'ALL', 'ONE'];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setRepeatMode(nextMode);
  };

  const playNextInQueue = (track: Track) => {
    setQueue((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      const next = [...filtered];
      const insertIdx = queueIndex + 1;
      next.splice(insertIdx, 0, track);
      return next;
    });
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) {
        return prev;
      }
      return [...prev, track];
    });
    setOriginalQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) {
        return prev;
      }
      return [...prev, track];
    });
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    }
  };

  const clearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setOriginalQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setOriginalQueue([]);
      setQueueIndex(0);
    }
  };

  const setSleepTimer = (minutes: number) => {
    sleepTimerManager.startTimer(minutes);
  };

  const setStopAtTrackEnd = () => {
    sleepTimerManager.setStopAtTrackEnd();
  };

  const cancelSleepTimer = () => {
    sleepTimerManager.cancelTimer();
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isBuffering,
        position,
        duration,
        repeatMode,
        isShuffling,
        queue,
        queueIndex,
        recentlyPlayed,
        sleepTimerState,
        playTrack,
        togglePlayPause,
        seekTo,
        nextTrack,
        previousTrack,
        toggleShuffle,
        cycleRepeatMode,
        playNextInQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setSleepTimer,
        setStopAtTrackEnd,
        cancelSleepTimer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
