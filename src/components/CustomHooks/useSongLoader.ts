import { useEffect, useState } from "react";
import { get, set } from "idb-keyval";
import axios from "axios";

const NewSong: Song = {
	number: -1,
	title: "",
	verse: [],
	chorus: "",
	author: "",
};

function useSongLoader(_id = 0) {
	const [songs, setSongs] = useState([NewSong]);

	/**
	 * Initiates the process of loading songs from the db
	 */
	useEffect(() => {
		/** Iterates over song array to make strings readable */
		function cleanupStrings(songs: Song[]) {
			let obj = songs;
			for (let i = 0; i < obj.length; i++) {
				if (obj[i].chorus.length > 0) {
					obj[i].chorus = replaceString(obj[i].chorus);
				}
				let verses = [];
				for (let j = 0; j < obj[i].verse.length; j++) {
					if (obj[i].verse[j].length > 0) {
						verses.push(replaceString(obj[i].verse[j]));
					}
				}
				obj[i].verse = verses;
			}

			return obj;
		}

		/**
		 * Loads songs from JSON and stores them locally
		 */
		async function loadSongsFromJSON() {
			let songsJson: Song[];
			try {
				songsJson = await fetchSongs<Song[]>();
				setSongs(cleanupStrings(songsJson));
				set("songs", songsJson);
			} catch (err) {
				console.error(err.message);
			}
		}

		if (songs.length <= 1) {
			console.log("%cLoading Songs from database", "color: #d8001c; font-size: large; font-weight: bold");
			checkDB().then(async res => {
				if (res) {
					let songsFromLocalStore = await get("songs");
					setSongs(cleanupStrings(songsFromLocalStore));
				} else {
					loadSongsFromJSON();
				}
			});
		}
	}, [songs.length]);

	/**
	 * Checks if songs have already been stored
	 */
	async function checkDB() {
		console.log(`%cChecking if songs exist already`, "color: #b70018; font-size: medium;");
		let songStorage = await get("songs");
		if (songStorage !== undefined) {
			console.log(`%cSongs found! Attempting to load...`, "color: #b70018; font-size: medium;");
			return true;
		}
		console.log(`%cNo database entry found, will parse json...`, "color: #b70018; font-size: medium;");
		return false;
	}

	/**
	 * Removes unnecessary characters and spaces from string
	 */
	function replaceString(string: string) {
		let newString = string
			.replace(/\*/g, "")
			.replace(/\s{2,}/g, "\n")
			.trim();
		return newString;
	}

	/**
	 * Fetches song database and returns it for parsing
	 */
	async function fetchSongs<T>(): Promise<T> {
		const url = process.env.PUBLIC_URL + "/songs.json";
		try {
			const response = await axios.post(url);
			if (response.status !== 200) throw new Error(`File not found on server!`);
			return response.data;
		} catch (err) {
			throw new Error(err);
		}
	}

	return songs;
}

export default useSongLoader;
