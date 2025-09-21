import { lazy, useEffect } from 'react';
import styles from './App.module.scss';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { Container, useMantineColorScheme } from '@mantine/core';
import withSuspense from '@/helpers/withSuspense';
import { useMainContext } from '@/utils/context';

const HomeImport = lazy(() => import('@/pages/Home'));
const SongsImport = lazy(() => import('@/pages/Songs'));
const SongDisplayImport = lazy(() => import('@/components/Songs/SongDisplay'));
const SearchImport = lazy(() => import('@/pages/Search'));
const LoaderImport = lazy(() => import('@/components/Loader'));
const HeaderImport = lazy(() => import('@/components/Header'));
const PictureHeaderImport = lazy(() => import('@/components/PictureHeader'));

const Home = withSuspense<typeof HomeImport>(HomeImport);
const Songs = withSuspense<typeof SongsImport>(SongsImport);
const SongDisplay = withSuspense<typeof SongDisplayImport>(SongDisplayImport);
const Search = withSuspense<typeof SearchImport>(SearchImport);
const Loader = withSuspense<typeof LoaderImport, null>(LoaderImport, null);
const Header = withSuspense<typeof HeaderImport, null>(HeaderImport, null);
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
  const location = useLocation();
  // const notSongListPage = !window.location.pathname.includes("/songs/index");
  const notSongListPage = true;

  // Check if we're on the homepage
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  useEffect(() => {
    const handleOrientationChange = () => {
      dispatch({ type: 'setWidth', payload: document.body.getBoundingClientRect().width });
    };

    window.screen.orientation.addEventListener('change', handleOrientationChange, {
      capture: false,
      passive: true,
    });
    return function cleanup() {
      window.screen.orientation.removeEventListener('change', handleOrientationChange);
    };
  }, [dispatch]);

  return (
    <Container className={styles.root} fluid>
      <Container component="section" className={styles.app_body} fluid>
        {!isHomePage && <Header />}
        <ScrollRestoration />
        <Container
          component="main"
          className={`${styles.app_inner} ${notSongListPage ? styles.app_inner_mobile : ''}`}
          bg={!isHomePage && isDark ? 'gray.8' : !isHomePage ? 'gray.2' : undefined}
          p={0}
          fluid
        >
          {!isHomePage && <PictureHeader />}

          <div className={!isHomePage ? styles.wrapper : undefined}>
            <Routes>
              <Route path="home" element={<Home />} />
              <Route path="songs/*" element={songs.length > 1 ? <Songs /> : <Loader />} />
              <Route
                path="song/:songID"
                element={songs.length > 1 ? <SongDisplay /> : <Loader />}
              />
              <Route path="search/*" element={<Search />} />
              <Route path="favourites/*" element={<Navigate to="/songs/favourites" replace />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </Container>
      </Container>
    </Container>
  );
}

export default App;
