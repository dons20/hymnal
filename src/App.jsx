import React, { Suspense, useReducer, useEffect } from "react";
import { useSongLoader, useTouchScreenDetection } from "components/CustomHooks";
import { Route, Switch, Redirect, useLocation } from "react-router-dom";
import { Home, Songs, Settings } from "pages";
import BottomNav from "components/BottomNav";
import styles from "./App.module.scss";
import { Spin } from "antd";

const Header = React.lazy(() => import("components/Header"));
const PictureHeader = React.lazy(() => import("components/PictureHeader"));

const pages = {
	HOME: "/home",
	INDEX: "/songs",
	FAVOURITES: "/favourites",
	SETTINGS: "/settings",
};

const initialAppState = {
	meta: {
		title: "",
		subtitle: "",
		width: document.body.getBoundingClientRect().width,
	},
};

/**
 * @param {initialAppState} _state
 * @param {{ type: String, payload: Object }} action
 */
function reducer(_state, action) {
	switch (action.type) {
		case "setTitle":
			return { ..._state, title: action.payload };
		case "setSubtitle":
			return { ..._state, subtitle: action.payload };
		case "setWidth":
			return { ..._state, width: action.payload };
		default:
			throw new Error(`Invalid Action Specified: ${action.payload}`);
	}
}

const ScrollRestoration = () => {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	return null;
};

/**
 * @typedef {Object} Song
 * @property {Number} number
 * @property {String} title
 * @property {String[]} verse
 * @property {String} chorus
 * @property {String} author
 */

/**
 * @type {React.Context<CTX>}
 * @typedef {Object} CTX
 * @property {initialAppState} CTX.meta
 * @property {React.Dispatch<{type: String, payload: *}>} CTX.dispatch
 * @property {Song[]} CTX.songs
 * @property {pages} CTX.pages
 */
export const MainContext = React.createContext(null);

function App() {
	const [state, dispatch] = useReducer(reducer, initialAppState);
	const songs = useSongLoader();
	const hasTouchScreen = useTouchScreenDetection();
	const isMobile = state.meta.width <= 1200 && hasTouchScreen;

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
		<div className={styles.root}>
			<MainContext.Provider value={{ meta: state, dispatch, songs, pages }}>
				<section className={styles.app_body}>
					<Suspense fallback={<div>Loading...</div>}>
						<Header />
					</Suspense>
					<ScrollRestoration />
					<main className={styles.app_inner}>
						<Suspense fallback={<div>Loading...</div>}>
							<PictureHeader />
						</Suspense>

						<div className={styles.wrapper}>
							<Switch>
								<Route path="/home" component={Home} />
								<Route path="/songs">
									{songs.length > 1 ? (
										<Songs />
									) : (
										<div className="loader">
											<Spin size="large" />
										</div>
									)}
								</Route>
								<Route path="settings" component={Settings} />
								<Route>
									<Redirect to="/home" />
								</Route>
							</Switch>
						</div>
					</main>

					{/* Bottom Navigation on mobile */ isMobile ? <BottomNav /> : null}
				</section>
			</MainContext.Provider>
		</div>
	);
}

export default App;
