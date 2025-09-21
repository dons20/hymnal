import { useEffect, useState } from 'react';
import { SongsDB } from '@/helpers';
import hymns from '@/static/hymns.json';
import setDebug from '@/utils/logger';

const dbName = 'Songs';

setDebug();
const { debug } = window;

/**
 * Creates a simple hash from the hymns data for cache invalidation
 */
function createContentHash(data: SongsDB): string {
  const content = JSON.stringify(data.songs);
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Local-first song loader - uses only the bundled hymns.json file
 */
function useSongLoader() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [favourites, setFavourites] = useState<number[]>([]);

  /**
   * Loads songs from the bundled JSON and stores them locally
   */
  async function loadSongs() {
    const localForage = await import('localforage');

    if (!localForage.default.config) {
      // If no storage available, just use the hymns directly
      setSongs(hymns.songs);
      return;
    }

    localForage.default.config({
      name: dbName,
      description: 'Stores the songs db and content hash for cache invalidation',
    });

    try {
      const localSongs = localForage.default.createInstance({ name: dbName, storeName: 'items' });
      const hashStore = localForage.default.createInstance({ name: dbName, storeName: 'hash' });

      // Create content hash from current bundled data
      const currentHash = createContentHash(hymns as SongsDB);
      const storedHash = (await hashStore.getItem('value')) as string;

      debug.log(`%cChecking hymns data...`, 'color: #3182ce; font-size: medium;');

      // Check if we have cached songs and if content hasn't changed
      const songsLength = await localSongs.length();
      const hasValidCache = songsLength > 0 && storedHash === currentHash;

      if (hasValidCache) {
        // Load from cache - content hasn't changed
        debug.log(`%cLoading songs from local storage...`, 'color: #3182ce; font-size: medium;');
        const songStorage: Song[] = [];
        await localSongs.iterate((value: Song) => {
          songStorage.push(value);
        });

        if (songStorage.length > 0) {
          setSongs(songStorage);
          debug.log(
            `%c${songStorage.length} songs loaded from local storage (cached)`,
            'color: #10b981; font-size: medium;'
          );
          return;
        }
      }

      // Cache is invalid or doesn't exist - refresh from bundled data
      if (storedHash !== currentHash) {
        debug.log(`%cContent changed, refreshing cache...`, 'color: #f59e0b; font-size: medium;');
      } else {
        debug.log(`%cNo cache found, initializing...`, 'color: #3182ce; font-size: medium;');
      }

      // Clear existing cache
      await localSongs.clear();

      // Store new songs and hash
      const storePromises = hymns.songs.map(async (song, index) =>
        localSongs.setItem(`${index}`, song)
      );

      await Promise.all([...storePromises, hashStore.setItem('value', currentHash)]);

      setSongs(hymns.songs);
      debug.log(
        `%c${hymns.songs.length} songs loaded and cached from bundled data`,
        'color: #10b981; font-size: medium;'
      );
    } catch (error) {
      debug.log(`%cError loading songs, using fallback`, 'color: #ef4444; font-size: medium;');
      if (error instanceof Error) debug.info(error.message);

      // Fallback to bundled data
      setSongs(hymns.songs);
    }
  }

  async function loadFavourites() {
    const localForage = await import('localforage');

    if (!localForage.default.config) return;

    // Create a specific instance for favourites
    const favesStore = localForage.default.createInstance({
      name: 'Songs',
      storeName: 'Favourites',
      description: 'Your favourite songs',
    });

    try {
      const localFavourites: number[] = [];
      await favesStore.iterate((value: number) => {
        localFavourites.push(value);
      });
      setFavourites(localFavourites);
      debug.log(
        `%c${localFavourites.length} favourites loaded`,
        'color: #8b5cf6; font-size: medium;'
      );
    } catch (e) {
      debug.log('Error obtaining favourites');
      if (e instanceof Error) debug.info(e.message);
    }
  }

  /**
   * Initiates the process of loading songs and favourites
   */
  useEffect(() => {
    if (songs.length <= 1) {
      debug.log(
        '%cLoading Songs (Local-First)...',
        'color: #3182ce; font-size: large; font-weight: bold'
      );
      loadSongs();
      loadFavourites();
    }
  }, [songs.length]);

  return { songs, favourites, setFavourites };
}

export default useSongLoader;
