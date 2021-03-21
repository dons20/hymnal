import React, { useReducer, useEffect } from "react";
import { Route, Switch, Redirect, useLocation } from "react-router-dom";
import { useSongLoader } from "components/CustomHooks";
import { isMobile } from "react-device-detect";
import { Spinner } from "@chakra-ui/react";
import styles from "./App.module.scss";
import { withSuspense } from "helpers";

const Header = withSuspense(React.lazy(() => import("components/Header")));
const BottomNav = withSuspense(React.lazy(() => import("components/BottomNav")));
const PictureHeader = withSuspense(React.lazy(() => import("components/PictureHeader")));

const Home = withSuspense(React.lazy(() => import("pages/Home")));
const Songs = withSuspense(React.lazy(() => import("pages/Songs")));
const Settings = withSuspense(React.lazy(() => import("pages/Settings")));

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
	dispatch?: React.Dispatch<ACTIONTYPE>;
	songs?: Song[];
	pages?: typeof pages;
	meta?: State;
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

export const MainContext = React.createContext<CTX>({});

function App() {
	const [state, dispatch] = useReducer(reducer, initialAppState);
	const songs = useSongLoader();

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
		<MainContext.Provider value={{ meta: state, dispatch, songs, pages }}>
			<div className={styles.root}>
				<section className={styles.app_body}>
					<Header />
					<ScrollRestoration />
					<main className={styles.app_inner}>
						<PictureHeader />

						<div className={styles.wrapper}>
							<Switch>
								<Route path="/home" component={Home} />
								<Route path="/songs">
									{songs.length > 1 ? (
										<Songs />
									) : (
										<div className="loader">
											<Spinner size="xl" />
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
			</div>
		</MainContext.Provider>
	);
}

export default App;
