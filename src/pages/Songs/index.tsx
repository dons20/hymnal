import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Box, useMantineColorScheme } from '@mantine/core';
import withSuspense from '../../helpers/withSuspense';

import './Songs.scss';

const SongList = withSuspense(lazy(() => import('../../components/Songs/SongList')));
const SongDisplay = withSuspense(lazy(() => import('../../components/Songs/SongDisplay')));
const Favourites = withSuspense(lazy(() => import('../Favourites')));

function Listing() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box className="songs" bg={isDark ? 'gray.8' : 'gray.2'}>
      <Routes>
        <Route path="index" element={<SongList />} />
        <Route path="favourites" element={<Favourites />} />
        <Route path=":songID" element={<SongDisplay />} />
        <Route path="/" element={<Navigate to="/songs/index" replace />} />
      </Routes>
    </Box>
  );
}

export default Listing;
