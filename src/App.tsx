import React, { useReducer, useEffect, lazy } from "react";
import { Route, Switch, Redirect, useLocation } from "react-router-dom";
import { useSongLoader } from "components/CustomHooks";
import withSuspense from "helpers/withSuspense";
import { isMobile } from "react-device-detect";
import { createCtx } from "helpers";
import styles from "./App.module.scss";

const HomeImport = lazy(() => import("pages/Home"));
const SongsImport = lazy(() => import("pages/Songs"));
const SearchImport = lazy(() => import("pages/Search"));
const LoaderImport = lazy(() => import("components/Loader"));
const HeaderImport = lazy(() => import("components/Header"));
const BottomNavImport = lazy(() => import("components/BottomNav"));
const PictureHeaderImport = lazy(() => import("components/PictureHeader"));

const Home = withSuspense<typeof HomeImport>(HomeImport);
const Songs = withSuspense<typeof SongsImport>(SongsImport);
const Search = withSuspense<typeof SearchImport>(SearchImport);
const Loader = withSuspense<typeof LoaderImport, null>(LoaderImport, null);
const Header = withSuspense<typeof HeaderImport, null>(HeaderImport, null);
const BottomNav = withSuspense<typeof BottomNavImport, null>(BottomNavImport, null);
const PictureHeader = withSuspense<typeof PictureHeaderImport, null>(PictureHeaderImport, null);

const pages = {
	HOME: "/home",
	INDEX: "/songs",
	FAVOURITES: "/favourites",
	SETTINGS: "/settings",
};

type ACTIONTYPE =
	| { type: "setTitle"; payload: string }
	| { type: "setSubtitle"; payload: string }
	| { type: "setWidth"; payload: number };

type State = {
	title: string;
	subtitle: string;
	width: number;
};

type CTX = {
	dispatch: React.Dispatch<ACTIONTYPE>;
	songs: Song[];
	favourites: number[];
	setFavourites: React.Dispatch<React.SetStateAction<number[]>>;
	pages: typeof pages;
	meta: State;
};

const initialAppState = {
	title: "",
	subtitle: "",
	width: document.body.getBoundingClientRect().width,
};

function reducer(state: State, action: ACTIONTYPE): State {
	switch (action.type) {
		case "setTitle":
			return { ...state, title: action.payload };
		case "setSubtitle":
			return { ...state, subtitle: action.payload };
		case "setWidth":
			return { ...state, width: action.payload };
		default:
			return state;
	}
}

const ScrollRestoration = () => {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	return null;
};

export const [useMainContext, MainContextProvider] = createCtx<CTX>();

function App() {
	const [state, dispatch] = useReducer(reducer, initialAppState);
	const { songs, favourites, setFavourites } = useSongLoader();

	function handleOrientationChange() {
		dispatch({ type: "setWidth", payload: document.body.getBoundingClientRect().width });
	}

	useEffect(() => {
		window.addEventListener("orientationchange", handleOrientationChange, {
			capture: false,
			passive: true,
		});
		return function cleanup() {
			window.addEventListener("orientationchange", handleOrientationChange);
		};
	}, []);

	return (
		<MainContextProvider value={{ meta: state, dispatch, songs, pages, favourites, setFavourites }}>
			<div className={styles.root}>
				<section className={styles.app_body}>
					<Header />
					<ScrollRestoration />
					<main className={`${styles.app_inner} ${isMobile ? styles.app_inner_mobile : ""}`}>
						<PictureHeader />

						<div className={styles.wrapper}>
							<Switch>
								<Route path="/home" component={Home} />
								<Route path="/songs">{songs.length > 1 ? <Songs /> : <Loader />}</Route>
								<Route path="/search" component={Search} />
								<Route path="/favourites">
									<Redirect to="/songs/favourites" />
								</Route>
								<Route>
									<Redirect to="/home" />
								</Route>
							</Switch>
						</div>
					</main>

					<BottomNav />
				</section>
			</div>
		</MainContextProvider>
	);
}

export default App;
