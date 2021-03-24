import { useEffect, useState } from "react";
import { DBSchema, openDB } from "idb/with-async-ittr";
import { SongsDB } from "data/songs";

interface SongsTDB extends DBSchema {
	song: {
		key: string;
		value: Song;
		indexes: {
			number: string;
			title: string;
		};
	};
}

function useSongLoader(_id = 0) {
	const [songs, setSongs] = useState<Song[]>([]);

	/**
	 * Initiates the process of loading songs from the db
	 */
	useEffect(() => {
		/**
		 * Loads songs from JSON and stores them locally
		 */
		async function loadSongsFromJSON() {
			const db = await openDB<SongsTDB>("Songs", 1, {
				upgrade(db) {
					// Create a store of objects
					const store = db.createObjectStore("song", {
						// The 'number' property of the object will be the key.
						keyPath: "number",
						// If it isn't explicitly set, create a value by auto incrementing.
						autoIncrement: false,
					});
					// Create an index on the 'number' property of the objects.
					store.createIndex("number", "number");
					store.createIndex("title", "title");
				},
			});

			try {
				SongsDB.forEach(async song => await db.add("song", { ...song }));
				setSongs(SongsDB);
			} catch (err) {
				console.info(err.message);
			}
		}

		/**
		 * Checks if songs have already been stored
		 */
		async function checkDB() {
			console.log(`%cChecking if songs exist already`, "color: #b70018; font-size: medium;");
			try {
				const dbExists = (await indexedDB.databases()).map(db => db.name).includes("Songs");
				if (dbExists) {
					console.log(`%cSongs found! Attempting to load...`, "color: #b70018; font-size: medium;");
					const db = await openDB<SongsTDB>("Songs");
					db.addEventListener("error", () => loadSongsFromJSON());
					const songStorage = await db.getAllFromIndex("song", "number");
					// console.info(songStorage);
					setSongs(songStorage);
				} else {
					console.log(`%cNo database entry found, will parse json...`, "color: #b70018; font-size: medium;");
					loadSongsFromJSON();
				}
			} catch (e) {
				console.warn(e);
				loadSongsFromJSON();
			}
		}

		if (songs.length <= 1) {
			console.log("%cLoading Songs from database", "color: #d8001c; font-size: large; font-weight: bold");
			checkDB();
		}
	}, [songs.length]);

	return songs;
}

export default useSongLoader;
