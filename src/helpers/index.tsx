import React from 'react';
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
    debug.log(
      `%cFavourites updated: ${indexes.length} items`,
      'color: #10b981; font-size: medium;'
    );
  } catch (err) {
    if (err instanceof Error) debug.error('Failed to update favourites:', err.message);
  }
}
