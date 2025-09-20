import React from 'react';
import axios from 'axios';
import hymns from '@/static/hymns.json';
import setDebug from '@/utils/logger';

interface SongPropsA {
  number: number;
  title: string;
  verse: string[];
  chorus: string;
  author?: string;
}
interface SongPropsB {
  number: number;
  title: string;
  verse: string[];
  chorus: string;
  author: string;
}

export type SongProps = SongPropsA | SongPropsB;

export type SongsDB = { songs: SongProps[]; version: string };

setDebug();
const { debug } = window;

/**
 * Loads songs from JSON and stores them locally
 */
export async function loadNewSongs(fetchedSongs: SongProps[]) {
  const localForage = await import('localforage');
  const songs = localForage.default.createInstance({ storeName: 'items' });
  const localVersion = localForage.default.createInstance({ storeName: 'version' });
  const favourites = localForage.default.createInstance({ storeName: 'favourites' });

  try {
    await Promise.all([
      fetchedSongs.forEach((song, i) =>
        songs.setItem(`${i}`, { ...song }).catch((e) => debug.info(e))
      ),
      localVersion.setItem('value', localVersion).catch((e) => debug.info(e)),
      favourites.clear(),
    ]);
  } catch (err) {
    if (err instanceof Error) debug.info(err.message);
  }
}

/**
 * Checks if songs have already been stored
 */
export async function checkDB() {
  const dbName = 'Songs';
  const localForage = await import('localforage');
  
  // Use default export for config
  localForage.default.config({
    name: dbName,
    description: 'Stores the songs db and its version number',
  });

  let songsDB: SongsDB;
  try {
    const fetchedData =
      process.env.NODE_ENV === 'production'
        ? await axios.get<SongsDB>(
            process.env.HYMNS_URL || 'https://f002.backblazeb2.com/file/hymnal/hymns.json'
          )
        : { data: hymns };
    if (!fetchedData.data) return;
    songsDB = fetchedData.data;

    debug.log(`%cChecking if songs exist already`, 'color: #3182ce; font-size: medium;');
    const songs = localForage.default.createInstance({ storeName: 'items' });
    const songsLength = await songs.length();
    if (songsLength < songsDB.songs.length) {
      debug.info('Items out of sync with latest items');
      loadNewSongs(songsDB.songs);
    }

    debug.log(`%cChecking for updates`, 'color: #3182ce; font-size: medium;');
    const localVersion = localForage.default.createInstance({ storeName: 'version' });
    if (!localVersion) throw new Error('No version stored');
    const versionNumber = (await localVersion.getItem('value')) as string;
    if (songsDB.version !== versionNumber) {
      debug.info('Version mismatch, sync necessary');
      loadNewSongs(songsDB.songs);
    }

    debug.log(`%cSongs found! Attempting to load...`, 'color: #3182ce; font-size: medium;');
  } catch (e) {
    if (e instanceof Error) debug.error(e.message);
  }
}

export function useQuery(search: string) {
  return new URLSearchParams(search);
}

/**
 * A helper to create a Context and Provider with no upfront default value, and
 * without having to check for undefined all the time.
 */
export function createCtx<A extends {} | null>() {
  const ctx = React.createContext<A | undefined>(undefined);
  function useCtx() {
    const c = React.useContext(ctx);
    if (c === undefined) throw new Error('useCtx must be inside a Provider with a value');
    return c;
  }
  return [useCtx, ctx.Provider, ctx.Consumer] as const; // 'as const' makes TypeScript infer a tuple
}

export async function updateFavesDB(indexes: number[]) {
  const localForage = await import('localforage');
  
  // Create a specific instance for favourites
  const favesStore = localForage.default.createInstance({
    name: 'Songs',
    storeName: 'Favourites',
    description: 'Your favourite songs',
  });

  try {
    // Clear existing favourites first
    await favesStore.clear();
    
    // Add each favourite index
    const promises = indexes.map(async (item) => {
      return favesStore.setItem(`${item}`, item);
    });
    
    await Promise.all(promises);
    debug.log(`%cFavourites updated: ${indexes.length} items`, 'color: #10b981; font-size: medium;');
  } catch (err) {
    if (err instanceof Error) debug.error('Failed to update favourites:', err.message);
  }
}
