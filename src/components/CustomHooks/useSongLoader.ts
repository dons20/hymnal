import { useEffect, useState } from "react";

const dbName = "Songs";

/** @deprecated Should probably read from db directly... */
function useSongLoader(_id = 0) {
	const [songs, setSongs] = useState<Song[]>([]);

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
			const _songs = localForage.createInstance({ storeName: "items", name: dbName });
			const _version = localForage.createInstance({ storeName: "version", name: dbName });

			try {
				await Promise.all([
					SongsJS.SongsDB.forEach(async (song, i) => await _songs.setItem(`${i}`, song)),
					_version.setItem("value", SongsJS.version).catch(e => console.info(e)),
				]);

				setSongs(SongsJS.SongsDB);
			} catch (err) {
				console.info(err.message);
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
			oldDB.dropInstance().catch(e => console.info("Problem dropping old DB"));

			try {
				console.log(`%cChecking if songs exist already`, "color: #3182ce; font-size: medium;");
				const _songs = localForage.createInstance({ name: dbName, storeName: "items" });
				const songsLength = await _songs.length();
				if (songsLength < SongsJS.SongsDB.length) throw new Error("Items out of sync with latest items");

				console.log(`%cChecking for updates`, "color: #3182ce; font-size: medium;");
				const _version = localForage.createInstance({ name: dbName, storeName: "version" });
				if (!_version) throw new Error("No version stored");
				const versionNumber = (await _version.getItem("value")) as string;
				if (SongsJS.version !== versionNumber) throw new Error("Version mismatch, sync necessary");

				console.log(`%cSongs found! Attempting to load...`, "color: #3182ce; font-size: medium;");
				const songStorage: Song[] = [];
				await _songs.iterate(function (value: Song) {
					songStorage.push(value);
				});
				console.info(songStorage);
				setSongs(songStorage);
			} catch (e) {
				console.log(
					`%cLocal entries outdated or undefined, parsing songs DB...`,
					"color: #3182ce; font-size: medium;"
				);
				console.info(e.message);
				loadNewSongs();
			}
		}

		if (songs.length <= 1) {
			console.log("%cLoading Songs...", "color: #3182ce; font-size: large; font-weight: bold");
			checkDB();
		}
	}, [songs.length]);

	return songs;
}

export default useSongLoader;
