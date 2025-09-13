import { useEffect, lazy } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router";
import { Container, useMantineColorScheme } from "@mantine/core";
import withSuspense from "@/helpers/withSuspense";
import { useMainContext } from "@/utils/context";

import styles from "./App.module.scss";

const HomeImport = lazy(() => import("@/pages/Home"));
const SongsImport = lazy(() => import("@/pages/Songs"));
const SongDisplayImport = lazy(() => import("@/components/Songs/SongDisplay"));
const SearchImport = lazy(() => import("@/pages/Search"));
const LoaderImport = lazy(() => import("@/components/Loader"));
const HeaderImport = lazy(() => import("@/components/Header"));
const BottomNavImport = lazy(() => import("@/components/BottomNav"));
const PictureHeaderImport = lazy(() => import("@/components/PictureHeader"));

const Home = withSuspense<typeof HomeImport>(HomeImport);
const Songs = withSuspense<typeof SongsImport>(SongsImport);
const SongDisplay = withSuspense<typeof SongDisplayImport>(SongDisplayImport);
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
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { songs, dispatch } = useMainContext();
    // const notSongListPage = !window.location.pathname.includes("/songs/index");
    const notSongListPage = true;

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
        <Container className={styles.root} fluid>
            <Container component="section" className={styles.app_body} fluid>
                <Header />
                <ScrollRestoration />
                <Container
                    component="main"
                    className={`${styles.app_inner} ${notSongListPage ? styles.app_inner_mobile : ""}`}
                    bg={isDark ? 'gray.8' : 'gray.2'}
                    fluid
                >
                    <PictureHeader />

                    <div className={styles.wrapper}>
                        <Routes>
                            <Route path="home" element={<Home />} />
                            <Route path="songs/*" element={songs.length > 1 ? <Songs /> : <Loader />} />
                            <Route path="song/:songID" element={songs.length > 1 ? <SongDisplay /> : <Loader />} />
                            <Route path="search/*" element={<Search />} />
                            <Route path="favourites/*" element={<Navigate to="/songs/favourites" replace />} />
                            <Route path="/" element={<Navigate to="/home" replace />} />
                        </Routes>
                    </div>
                </Container>

                <BottomNav />
            </Container>
        </Container>
    );
}

export default App;
