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
     * Checks if songs have already been stored
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
        debug.log(query);
        const songsDB: SongsDB = query.data;
        debug.log(`%cChecking if songs exist already`, 'color: #3182ce; font-size: medium;');
        const localSongs = localForage.default.createInstance({ name: dbName, storeName: 'items' });
        const songsLength = await localSongs.length();

        if (songsLength < songsDB.songs.length) {
          debug.info('Items out of sync with latest items');
          loadNewSongs(songsDB);
        }

        debug.log(`%cChecking for updates`, 'color: #3182ce; font-size: medium;');
        const version = localForage.default.createInstance({ name: dbName, storeName: 'version' });
        if (!version) throw new Error('No version stored');
        const versionNumber = (await version.getItem('value')) as string;
        if (songsDB.version !== versionNumber) {
          debug.info('Version mismatch, sync necessary');
          loadNewSongs(songsDB);
        }

        debug.log(`%cSongs found! Attempting to load...`, 'color: #3182ce; font-size: medium;');
        const songStorage: Song[] = [];
        await localSongs.iterate((value: Song) => {
          songStorage.push(value);
        });

        setSongs(songStorage);
      } catch (e) {
        debug.log(
          `%cLocal entries outdated or undefined, parsing songs DB...`,
          'color: #3182ce; font-size: medium;'
        );
        if (e instanceof Error) debug.info(e.message);
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
