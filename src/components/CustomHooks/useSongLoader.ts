import { useEffect, useState } from 'react';
import axios from 'axios';
import { SongsDB } from '@/helpers';
import hymns from '@/static/hymns.json';
import setDebug from '@/utils/logger';

const dbName = 'Songs';

setDebug();
const { debug } = window;

/**
 * @deprecated
 * Should probably read from db directly...
 */
function useSongLoader() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [favourites, setFavourites] = useState<number[]>([]);
  debug.log(songs);

  /**
   * Initiates the process of loading songs from the db
   */
  useEffect(() => {
    /**
     * Loads songs from JSON and stores them locally
     */
    async function loadNewSongs({ songs: fetchedSongs, version }: SongsDB) {
      const localForage = await import('localforage');
      const localSongs = localForage.default.createInstance({ storeName: 'items', name: dbName });
      const localVersion = localForage.default.createInstance({ storeName: 'version', name: dbName });

      try {
        await Promise.all([
          fetchedSongs.forEach(async (song, i) => localSongs.setItem(`${i}`, song)),
          localVersion.setItem('value', version).catch((e) => debug.info(e)),
        ]);

        setSongs(fetchedSongs);
      } catch (err) {
        if (err instanceof Error) debug.info(err.message);
      }
    }

    const simpleFetch = async () => {
      setSongs(hymns.songs);
    };

    /**
     * Checks if songs have already been stored and loads them offline-first
     */
    async function checkDB() {
      const localForage = await import('localforage');

      if (!localForage.default.config) {
        simpleFetch();
        return;
      }

      localForage.default.config({
        name: dbName,
        description: 'Stores the songs db and its version number',
      });
      
      try {
        // Try to load songs from local storage first (offline-first approach)
        const localSongs = localForage.default.createInstance({ name: dbName, storeName: 'items' });
        const songsLength = await localSongs.length();
        
        if (songsLength > 0) {
          debug.log(`%cLoading songs from local storage...`, 'color: #3182ce; font-size: medium;');
          const songStorage: Song[] = [];
          await localSongs.iterate((value: Song) => {
            songStorage.push(value);
          });
          
          if (songStorage.length > 0) {
            setSongs(songStorage);
            debug.log(`%c${songStorage.length} songs loaded from local storage`, 'color: #10b981; font-size: medium;');
          }
        }
        
        // Then try to update from network (if online)
        if (navigator.onLine) {
          await updateFromNetwork(localForage);
        }
      } catch (e) {
        debug.log(
          `%cLocal entries outdated or undefined, parsing songs DB...`,
          'color: #3182ce; font-size: medium;'
        );
        if (e instanceof Error) debug.info(e.message);
        
        // Fallback to static data if all else fails
        if (songs.length === 0) {
          simpleFetch();
        }
      }
    }

    async function updateFromNetwork(localForage: any) {
      try {
        /**
         * Delete old DB
         */
        const oldDB = localForage.default.createInstance({ name: 'keyval-store' });
        oldDB.dropInstance().catch(() => debug.info('Problem dropping old DB'));
        
        const query =
          process.env.NODE_ENV === 'production'
            ? await axios.get<SongsDB>(
                process.env.HYMNS_URL || 'https://f002.backblazeb2.com/file/hymnal/hymns.json'
              )
            : { data: hymns };
            
        if (!query.data) return;
        
        const songsDB: SongsDB = query.data;
        debug.log(`%cChecking for updates from network...`, 'color: #3182ce; font-size: medium;');
        
        const localSongs = localForage.default.createInstance({ name: dbName, storeName: 'items' });
        const songsLength = await localSongs.length();

        if (songsLength < songsDB.songs.length) {
          debug.info('Items out of sync with latest items, updating...');
          loadNewSongs(songsDB);
          return;
        }

        debug.log(`%cChecking version...`, 'color: #3182ce; font-size: medium;');
        const version = localForage.default.createInstance({ name: dbName, storeName: 'version' });
        if (!version) throw new Error('No version stored');
        const versionNumber = (await version.getItem('value')) as string;
        
        if (songsDB.version !== versionNumber) {
          debug.info('Version mismatch, sync necessary');
          loadNewSongs(songsDB);
          return;
        }

        debug.log(`%cSongs are up to date`, 'color: #10b981; font-size: medium;');
      } catch (error) {
        debug.log(`%cNetwork update failed, using cached data`, 'color: #f59e0b; font-size: medium;');
        if (error instanceof Error) debug.info(error.message);
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
      } catch (e) {
        debug.log('Error obtaining favourites');
        if (e instanceof Error) debug.info(e.message);
      }
    }

    if (songs.length <= 1) {
      debug.log('%cLoading Songs...', 'color: #3182ce; font-size: large; font-weight: bold');
      checkDB();
      loadFavourites();
    }
  }, [songs.length]);

  return { songs, favourites, setFavourites };
}

export default useSongLoader;
