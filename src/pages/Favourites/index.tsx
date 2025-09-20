import { useCallback, useEffect, useMemo } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from 'react-router';
import { List, RowComponentProps } from 'react-window';
import { FaHeart } from 'react-icons/fa';
import { 
  ActionIcon, 
  Anchor, 
  Box, 
  Container, 
  Group, 
  Text, 
  UnstyledButton, 
  useMantineColorScheme 
} from '@mantine/core';
import { useMainContext } from '../../utils/context';
import { updateFavesDB } from '../../helpers';
import classes from './Favourites.module.scss';

const meta = {
  title: 'Favourites',
  page: 'Favourites',
};

const calculateRowHeight = () => {
  const isMobile = window.innerWidth < 768;
  return isMobile ? 100 : 80;
};

const itemStyle = {
  border: '1px solid var(--mantine-color-gray-3)',
  borderRadius: 'var(--mantine-radius-md)',
  transition: 'all 0.2s ease',
  marginBottom: '8px',
};

function Favourites() {
  const navigate = useNavigate();
  const { songs, favourites, setFavourites, dispatch } = useMainContext();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const finalList = useMemo(() => 
    songs
      .filter((song) => favourites.includes(song.number - 1))
      .sort((a, b) => a.number - b.number),
    [songs, favourites]
  );

  const handleSongClick = useCallback(
    (songNumber: number) => {
      navigate(`/song/${songNumber}`);
    },
    [navigate]
  );

  const handleFavoriteToggle = useCallback(
    (songNumber: number) => {
      const newFavorites = favourites.filter((fave) => fave !== songNumber - 1);
      setFavourites(newFavorites);
      updateFavesDB(newFavorites);
    },
    [favourites, setFavourites]
  );

  const Row = useCallback(
    ({ index, style }: RowComponentProps) => {
      const song = finalList[index];
      return (
        <div style={{ ...style, padding: '4px 20px' }}>
          <UnstyledButton
            onClick={() => handleSongClick(song.number)}
            w="100%"
          >
            <Box
              p="md"
              style={{
                ...itemStyle,
                backgroundColor: isDark ? 'var(--mantine-color-gray-7)' : 'white',
                cursor: 'pointer',
                maxWidth: '800px',
                margin: '0 auto',
              }}
              className={`${classes.favouriteItem} favourite-item`}
            >
              <Group justify="space-between" align="center">
                <div style={{ flex: 1 }}>
                  <Text fw={700} size="md">
                    #{song.number} - {song.title}
                  </Text>
                </div>

                <ActionIcon
                  variant="filled"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteToggle(song.number);
                  }}
                  style={{ flexShrink: 0 }}
                >
                  <FaHeart size={14} />
                </ActionIcon>
              </Group>
            </Box>
          </UnstyledButton>
        </div>
      );
    },
    [finalList, isDark, handleSongClick, handleFavoriteToggle]
  );

  const EmptyListRender = useCallback(
    () => (
      <Container style={{ textAlign: 'center', paddingTop: '2rem' }}>
        <Text size="lg" mb="md">
          No favourites yet!
        </Text>
        <Text c="dimmed" mb="lg">
          Start adding songs to your favourites by tapping the heart icon on any song.
        </Text>
        <Anchor component={Link} to="/songs/index" c="blue.5">
          Browse Songs Index
        </Anchor>
      </Container>
    ),
    []
  );

  useEffect(() => {
    dispatch({ type: 'setTitle', payload: meta.title });
  }, [dispatch]);

  return (
    <>
      <Helmet>
        <title>{`Hymns for All Times | ${meta.page}`}</title>
      </Helmet>
      <Box pt="md" h="100vh" className={classes.favourites}>
        {finalList.length === 0 ? (
          <EmptyListRender />
        ) : (
          <>
            <Container mb="md">
              <Text size="sm" c="dimmed" ta="center">
                {finalList.length} favourite{finalList.length !== 1 ? 's' : ''}
              </Text>
            </Container>
            <Box
              style={{
                height: 'calc(100vh - 120px)',
                overflow: 'hidden',
              }}
            >
              <List
                rowComponent={Row}
                rowCount={finalList.length}
                rowHeight={calculateRowHeight}
                rowProps={{}}
                overscanCount={6}
              />
            </Box>
          </>
        )}
      </Box>
    </>
  );
}

export default Favourites;
