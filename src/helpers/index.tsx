import React from "react";
import { SongsDB, version } from "data/songs";

/**
 * Loads songs from JSON and stores them locally
 */
export async function loadNewSongs() {
	const localForage = await import("localforage");
	const _songs = localForage.createInstance({ storeName: "items" });
	const _version = localForage.createInstance({ storeName: "version" });
	const favourites = localForage.createInstance({ storeName: "favourites" });

	try {
		await Promise.all([
			SongsDB.forEach((song, i) => _songs.setItem(`${i}`, { ...song }).catch(e => console.info(e))),
			_version.setItem("value", version).catch(e => console.info(e)),
			favourites.clear(),
		]);
	} catch (err) {
		console.info(err.message);
	}
}

/**
 * Checks if songs have already been stored
 */
export async function checkDB() {
	const dbName = "Songs";
	const localForage = await import("localforage");
	localForage.config({
		name: dbName,
		description: "Stores the songs db and its version number",
	});

	try {
		console.log(`%cChecking if songs exist already`, "color: #3182ce; font-size: medium;");
		const _songs = localForage.createInstance({ storeName: "items" });
		const songsLength = await _songs.length();
		if (songsLength < SongsDB.length) throw new Error("Items out of sync with latest items");

		console.log(`%cChecking for updates`, "color: #3182ce; font-size: medium;");
		const _version = localForage.createInstance({ storeName: "version" });
		if (!_version) throw new Error("No version stored");
		const versionNumber = (await _version.getItem("value")) as string;
		if (version !== versionNumber) throw new Error("Version mismatch, sync necessary");

		console.log(`%cSongs found! Attempting to load...`, "color: #3182ce; font-size: medium;");
	} catch (e) {
		console.log(`%cLocal entries outdated or undefined, parsing songs DB...`, "color: #3182ce; font-size: medium;");
		console.info(e.message);
		loadNewSongs();
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
		if (c === undefined) throw new Error("useCtx must be inside a Provider with a value");
		return c;
	}
	return [useCtx, ctx.Provider] as const; // 'as const' makes TypeScript infer a tuple
}

export async function updateFavesDB(indexes: number[]) {
	const name = "Songs";
	const storeName = "Favourites";
	const localForage = await import("localforage");

	localForage.config({
		name,
		storeName,
		description: "Your favourite songs",
	});

	for (let i = 0; i < indexes.length; i++) {
		await localForage.setItem(`${indexes[i]}`, indexes[i]);
	}
}
