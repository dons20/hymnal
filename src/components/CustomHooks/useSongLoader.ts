/* eslint-disable no-console */
import { useEffect, useState } from "react";

const dbName = "Songs";

/**
 * @deprecated
 * Should probably read from db directly...
 */
function useSongLoader() {
	const [songs, setSongs] = useState<Song[]>([]);
	const [favourites, setFavourites] = useState<number[]>([]);

	/**
	 * Initiates the process of loading songs from the db
	 */
	useEffect(() => {
		/**
		 * Loads songs from JSON and stores them locally
		 */
		async function loadNewSongs() {
			const SongsJS = await import("data/songs");
			const localForage = await import("localforage");
			const localSongs = localForage.createInstance({ storeName: "items", name: dbName });
			const version = localForage.createInstance({ storeName: "version", name: dbName });

			try {
				await Promise.all([
					SongsJS.SongsDB.forEach(async (song, i) => localSongs.setItem(`${i}`, song)),
					version.setItem("value", SongsJS.version).catch(e => console.info(e)),
				]);

				setSongs(SongsJS.SongsDB);
			} catch (err) {
				if (err instanceof Error) console.info(err.message);
			}
		}

		/**
		 * Checks if songs have already been stored
		 */
		async function checkDB() {
			const SongsJS = await import("data/songs");
			const localForage = await import("localforage");
			localForage.config({
				name: dbName,
				description: "Stores the songs db and its version number",
			});

			/**
			 * Delete old DB
			 */
			const oldDB = localForage.createInstance({ name: "keyval-store" });
			oldDB.dropInstance().catch(() => console.info("Problem dropping old DB"));

			try {
				console.log(`%cChecking if songs exist already`, "color: #3182ce; font-size: medium;");
				const localSongs = localForage.createInstance({ name: dbName, storeName: "items" });
				const songsLength = await localSongs.length();
				if (songsLength < SongsJS.SongsDB.length) throw new Error("Items out of sync with latest items");

				console.log(`%cChecking for updates`, "color: #3182ce; font-size: medium;");
				const version = localForage.createInstance({ name: dbName, storeName: "version" });
				if (!version) throw new Error("No version stored");
				const versionNumber = (await version.getItem("value")) as string;
				if (SongsJS.version !== versionNumber) throw new Error("Version mismatch, sync necessary");

				console.log(`%cSongs found! Attempting to load...`, "color: #3182ce; font-size: medium;");
				const songStorage: Song[] = [];
				await localSongs.iterate((value: Song) => {
					songStorage.push(value);
				});
				// console.info(songStorage);
				setSongs(songStorage);
			} catch (e) {
				console.log(
					`%cLocal entries outdated or undefined, parsing songs DB...`,
					"color: #3182ce; font-size: medium;"
				);
				if (e instanceof Error) console.info(e.message);
				loadNewSongs();
			}
		}

		async function loadFavourites() {
			const name = "Songs";
			const storeName = "Favourites";
			const localForage = await import("localforage");

			localForage.config({
				name,
				storeName,
				description: "Your favourite songs",
			});

			try {
				const localFavourites: number[] = [];
				await localForage.iterate((value: number) => {
					localFavourites.push(value);
				});
				setFavourites(favourites);
			} catch (e) {
				console.log("Error obtaining favourites");
				if (e instanceof Error) console.info(e.message);
			}
		}

		if (songs.length <= 1) {
			console.log("%cLoading Songs...", "color: #3182ce; font-size: large; font-weight: bold");
			checkDB();
			loadFavourites();
		}
	}, [songs.length, favourites]);

	return { songs, favourites, setFavourites };
}

export default useSongLoader;
