import React, { Suspense } from "react";
import { openDB } from "idb/with-async-ittr";
import { SongsDB } from "data/songs";
import { Loader } from "components";

export const withSuspense = <P extends React.ReactNode & object, Q extends React.ReactNode & object>(
	LazyComponent: React.FC<P>,
	FallbackComponent?: React.FC<Q>
) => {
	return (props: React.ReactNode) => (
		<Suspense
			fallback={
				FallbackComponent ? (
					<FallbackComponent {...(props as Q)} />
				) : (
					<Loader />
					// <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
				)
			}
		>
			<LazyComponent {...(props as P)} />
		</Suspense>
	);
};

const createDB = async () => {
	console.log(`%cNo database entry found, will parse json...`, "color: #b70018; font-size: medium;");
	await openDB<SongsTDB>("Songs", 1, {
		upgrade(db) {
			// Create a store of objects
			const store = db.createObjectStore("song", {
				// The 'number' property of the object will be the key.
				keyPath: "number",
				// If it isn't explicitly set, create a value by auto incrementing.
				autoIncrement: false,
			});
			// Create an index on the 'number' property of the songs.
			store.createIndex("number", "number");
			// Create an index on the 'title' property of the songs.
			store.createIndex("title", "title");
		},
	});
};

export const loadSongsFromDB = async () => {
	const db = await openDB<SongsTDB>("Songs");

	try {
		SongsDB.forEach(async song => await db.add("song", { ...song }));
		return db.getAll("song", "");
	} catch (err) {
		console.info(err.message);
	}
};

/**
 * Checks if songs have already been stored
 */
export const checkDB = async () => {
	console.log(`%cChecking if songs exist already`, "color: #b70018; font-size: medium;");
	try {
		const dbExists = (await indexedDB.databases()).map(db => db.name).includes("Songs");
		if (dbExists) {
			const db = await openDB<SongsTDB>("Songs");
			db.addEventListener("error", createDB);
			console.log(`%cSongs found! Attempting to load...`, "color: #b70018; font-size: medium;");
			const songStorage = await db.getAllFromIndex("song", "number");
			console.info(songStorage);
			return songStorage;
		} else {
			console.log(`%cNo database entry found, will parse json...`, "color: #b70018; font-size: medium;");
			loadSongsFromDB();
		}
	} catch (e) {
		console.warn(e);
		loadSongsFromDB();
	}
};
