import { useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { FaMoon, FaSun } from 'react-icons/fa';
import { Link } from 'react-router';
import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { HomepageSearch } from '@/components';
import { useMainContext } from '@/utils/context';

import './Home.scss';

const meta = {
  title: 'Homepage',
  page: 'Home',
};

// Music note symbols for the animated background
const musicNotes = ['♪', '♫', '♬', '♩', '♭', '♮', '♯', '𝄞', '𝄢', '♬', '♪', '♫'];

function HomeScreen() {
  const { pages, dispatch } = useMainContext();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    dispatch!({ type: 'setTitle', payload: meta.title });
  }, [dispatch]);

  return (
    <>
      <Helmet>
        <title>{`Hymns for All Times | ${meta.page}`}</title>
      </Helmet>

      {/* Animated Background */}
      <div className={`splash-background ${isDark ? 'dark-theme' : 'light-theme'}`}>
        {musicNotes.map((note, index) => (
          <div
            key={index}
            className={`music-note ${isDark ? 'dark-theme' : 'light-theme'}`}
            style={{
              animationDelay: `${-index * 2}s`,
              top: `${10 + index * 7}%`,
            }}
          >
            {note}
          </div>
        ))}
      </div>

      {/* Theme Toggle Button */}
      <ActionIcon
        className="theme-toggle"
        variant="outline"
        color="blue"
        radius="md"
        size="lg"
        onClick={toggleColorScheme}
        aria-label="Toggle color scheme"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          color: isDark ? '#fff' : '#1976d2',
        }}
      >
        {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
      </ActionIcon>

      {/* Main Splash Content */}
      <div className="splash-container" data-testid="homeWrapper">
        <h1 className={`splash-title ${isDark ? 'dark-theme' : 'light-theme'}`}>
          Hymns for All Times
        </h1>

        <p className={`splash-subtitle ${isDark ? 'dark-theme' : 'light-theme'}`}>
          Discover and explore beautiful hymns for worship and reflection
        </p>

        {/* Homepage Search */}
        <HomepageSearch isDark={isDark} />

        {/* CTA Buttons */}
        <div className="cta-buttons">
          <Link to={pages.INDEX} className={`cta-button secondary ${isDark ? 'dark-theme' : ''}`}>
            Browse All Songs
          </Link>

          <Link
            to={pages.FAVOURITES}
            className={`cta-button secondary ${isDark ? 'dark-theme' : ''}`}
          >
            View Favourites
          </Link>
        </div>
      </div>
    </>
  );
}

export default HomeScreen;
