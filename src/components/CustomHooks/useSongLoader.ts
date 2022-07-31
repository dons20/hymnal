import { useEffect, useState } from "react";
import hymns from "static/hymns.json";
import setDebug from "utils/logger";
import { SongsDB } from "helpers";
import axios from "axios";

const dbName = "Songs";

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
			const localForage = await import("localforage");
			const localSongs = localForage.createInstance({ storeName: "items", name: dbName });
			const localVersion = localForage.createInstance({ storeName: "version", name: dbName });

			try {
				await Promise.all([
					fetchedSongs.forEach(async (song, i) => localSongs.setItem(`${i}`, song)),
					localVersion.setItem("value", version).catch(e => debug.info(e)),
				]);

				setSongs(fetchedSongs);
			} catch (err) {
				if (err instanceof Error) debug.info(err.message);
			}
		}

		const simpleFetch = async () => {
			const query = process.env.NODE_ENV === "production" ? await axios.get<SongsDB>(process.env.HYMNS_URL || "https://f002.backblazeb2.com/file/hymnal/hymns.json") : { data: hymns };
			setSongs(query.data.songs);
		};

		/**
		 * Checks if songs have already been stored
		 */
		async function checkDB() {
			const localForage = await import("localforage");

			if (!localForage.config) {
				simpleFetch();
				return;
			}

			localForage.config({
				name: dbName,
				description: "Stores the songs db and its version number",
			});
			try {
				/**
				 * Delete old DB
				 */
				const oldDB = localForage.createInstance({ name: "keyval-store" });
				oldDB.dropInstance().catch(() => debug.info("Problem dropping old DB"));
				const query = process.env.NODE_ENV === "production" ? await axios.get<SongsDB>(process.env.HYMNS_URL || "https://f002.backblazeb2.com/file/hymnal/hymns.json") : { data: hymns };
				if (!query.data) return;
				debug.log(query);
				const songsDB: SongsDB = query.data;
				debug.log(`%cChecking if songs exist already`, "color: #3182ce; font-size: medium;");
				const localSongs = localForage.createInstance({ name: dbName, storeName: "items" });
				const songsLength = await localSongs.length();

				if (songsLength < songsDB.songs.length) {
					debug.info("Items out of sync with latest items");
					loadNewSongs(songsDB);
				}

				debug.log(`%cChecking for updates`, "color: #3182ce; font-size: medium;");
				const version = localForage.createInstance({ name: dbName, storeName: "version" });
				if (!version) throw new Error("No version stored");
				const versionNumber = (await version.getItem("value")) as string;
				if (songsDB.version !== versionNumber) {
					debug.info("Version mismatch, sync necessary");
					loadNewSongs(songsDB);
				}

				debug.log(`%cSongs found! Attempting to load...`, "color: #3182ce; font-size: medium;");
				const songStorage: Song[] = [];
				await localSongs.iterate((value: Song) => {
					songStorage.push(value);
				});

				setSongs(songStorage);
			} catch (e) {
				debug.log(
					`%cLocal entries outdated or undefined, parsing songs DB...`,
					"color: #3182ce; font-size: medium;"
				);
				if (e instanceof Error) debug.info(e.message);
			}
		}

		async function loadFavourites() {
			const name = "Songs";
			const storeName = "Favourites";
			const localForage = await import("localforage");

			if (!localForage.config) return;
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
				debug.log("Error obtaining favourites");
				if (e instanceof Error) debug.info(e.message);
			}
		}

		if (songs.length <= 1) {
			debug.log("%cLoading Songs...", "color: #3182ce; font-size: large; font-weight: bold");
			checkDB();
			loadFavourites();
		}
	}, [songs.length, favourites]);

	return { songs, favourites, setFavourites };
}

export default useSongLoader;
