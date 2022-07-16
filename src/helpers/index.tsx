/* eslint-disable no-console */
import React from "react";
import axios from "axios";

interface SongPropsA {
	number: number;
	title: string;
	verse: string[];
	chorus: string;
	author: string;
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

/**
 * Loads songs from JSON and stores them locally
 */
export async function loadNewSongs(fetchedSongs: SongProps[]) {
	const localForage = await import("localforage");
	const songs = localForage.createInstance({ storeName: "items" });
	const localVersion = localForage.createInstance({ storeName: "version" });
	const favourites = localForage.createInstance({ storeName: "favourites" });

	try {
		await Promise.all([
			fetchedSongs.forEach((song, i) => songs.setItem(`${i}`, { ...song }).catch(e => console.info(e))),
			localVersion.setItem("value", localVersion).catch(e => console.info(e)),
			favourites.clear(),
		]);
	} catch (err) {
		if (err instanceof Error) console.info(err.message);
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

	let songsDB: SongsDB;
	try {
		const fetchedData = await axios.get<SongsDB>("https://f002.backblazeb2.com/file/hymnal/hymns.json");
		if (!fetchedData.data) return;
		songsDB = fetchedData.data;

		console.log(`%cChecking if songs exist already`, "color: #3182ce; font-size: medium;");
		const songs = localForage.createInstance({ storeName: "items" });
		const songsLength = await songs.length();
		if (songsLength < songsDB.songs.length) {
			console.info("Items out of sync with latest items");
			loadNewSongs(songsDB.songs);
		}

		console.log(`%cChecking for updates`, "color: #3182ce; font-size: medium;");
		const localVersion = localForage.createInstance({ storeName: "version" });
		if (!localVersion) throw new Error("No version stored");
		const versionNumber = (await localVersion.getItem("value")) as string;
		if (songsDB.version !== versionNumber) {
			console.info("Version mismatch, sync necessary");
			loadNewSongs(songsDB.songs);
		}

		console.log(`%cSongs found! Attempting to load...`, "color: #3182ce; font-size: medium;");
	} catch (e) {
		if (e instanceof Error) console.error(e.message);
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
	return [useCtx, ctx.Provider, ctx.Consumer] as const; // 'as const' makes TypeScript infer a tuple
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

	indexes.forEach(async item => {
		await localForage.setItem(`${item}`, item);
	});
}
