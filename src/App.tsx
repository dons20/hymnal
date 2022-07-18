import { useEffect, lazy } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useColorModeValue } from "@chakra-ui/color-mode";
import withSuspense from "helpers/withSuspense";
import { useMainContext } from "utils/context";
import { isMobile } from "react-device-detect";
import { Box } from "@chakra-ui/layout";

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

const ScrollRestoration = () => {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	return null;
};

function App() {
	const pageBG = useColorModeValue("gray.200", "gray.800");
	const { songs, dispatch } = useMainContext();

	useEffect(() => {
		const handleOrientationChange = () => {
			dispatch({ type: "setWidth", payload: document.body.getBoundingClientRect().width });
		};

		window.screen.orientation.addEventListener("change", handleOrientationChange, {
			capture: false,
			passive: true,
		});
		return function cleanup() {
			window.screen.orientation.removeEventListener("change", handleOrientationChange);
		};
	}, [dispatch]);

	return (
		<Box className={styles.root}>
			<Box as="section" className={styles.app_body}>
				<Header />
				<ScrollRestoration />
				<Box as="main" className={`${styles.app_inner} ${isMobile ? styles.app_inner_mobile : ""}`} bg={pageBG}>
					<PictureHeader />

					<div className={styles.wrapper}>
						<Routes>
							<Route path="home" element={<Home />} />
							<Route path="songs/*" element={songs.length > 1 ? <Songs /> : <Loader />} />
							<Route path="search/*" element={<Search />} />
							<Route path="favourites/*" element={<Navigate to="/songs/favourites" replace />} />
							<Route path="/" element={<Navigate to="/home" replace />} />
						</Routes>
					</div>
				</Box>

				<BottomNav />
			</Box>
		</Box>
	);
}

export default App;
