import React, { Suspense } from "react";
import { SongsDB, version } from "data/songs";
import localForage from "localforage";
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

export const lazyImport = (importPromise: Promise<any>) => withSuspense(React.lazy(() => importPromise));

/**
 * Loads songs from JSON and stores them locally
 */
export async function loadNewSongs() {
	const _songs = localForage.createInstance({ storeName: "items" });
	const _version = localForage.createInstance({ storeName: "version" });

	try {
		await Promise.all([
			SongsDB.forEach((song, i) => _songs.setItem(`${i}`, { ...song }).catch(e => console.info(e))),
			_version.setItem("value", version).catch(e => console.info(e)),
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
		// const songStorage: Song[] = [];
		// await _songs.iterate(function (value: Song) {
		// 	songStorage.push(value);
		// });
		// console.info(songStorage);
	} catch (e) {
		console.log(`%cLocal entries outdated or undefined, parsing songs DB...`, "color: #3182ce; font-size: medium;");
		console.info(e.message);
		loadNewSongs();
	}
}

export function useQuery(search: string) {
	return new URLSearchParams(search);
}
