import { useCallback, useEffect, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from 'react-router';
import { CellComponentProps, Grid } from 'react-window';
import { Anchor, Box, Container, SimpleGrid, Text, useMantineColorScheme } from '@mantine/core';
import { useMainContext } from '../../utils/context';

const meta = {
  title: 'Favourites',
  page: 'Favourites',
};

function Favourites() {
  const navigate = useNavigate();
  const { songs, favourites, dispatch } = useMainContext();
  const finalList = songs
    .filter((song) => favourites.includes(song.number - 1))
    .sort((a, b) => a.number - b.number);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const wrapperRef = useRef<HTMLDivElement>(null);
  const numRows = favourites.length;
  const numColumns = useRef(1);

  /** Triggers navigation to a song at a specified index */
  const memoDisplaySong = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      function displaySong(ev: React.MouseEvent<HTMLDivElement>) {
        const songID = ev.currentTarget.getAttribute('data-song-id');
        navigate(`${process.env.PUBLIC_URL}/songs/${songID}`);
      }

      displaySong(e);
    },
    [navigate]
  );

  /** Renders a single cell */
  const Cell = useCallback(
    ({ columnIndex, rowIndex, style, data }: CellComponentProps<{ data: Song[] }>) => {
      const itemIndex = rowIndex * numColumns.current + columnIndex;
      if (itemIndex >= finalList.length) 
        {return null;}
      
      return (
        <Box
          key={data[itemIndex].number}
          className="gridItemWrapper"
          style={{ cursor: 'default', ...style }}
          pl={`${window.innerWidth * 0.07}px`}
        >
          <SimpleGrid
            data-song-id={data[itemIndex].number}
            h={100}
            px="md"
            py="md"
            style={{
              alignItems: 'center',
              maxWidth: '800px',
              margin: 'auto',
              cursor: 'pointer',
              transition: 'transform 0.1s ease-in-out',
              willChange: 'transform',
            }}
            bg={isDark ? 'gray.7' : 'gray.1'}
            onClick={memoDisplaySong}
            cols={2}
            spacing="md"
            styles={{
              root: {
                boxShadow: 'var(--mantine-shadow-md)',
                borderRadius: 'var(--mantine-radius-md)',
              },
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
            }}
          >
            <Text className="listNumber" fw={600}>
              # {data[itemIndex].number}
            </Text>
            <Text className="listTitle">{data[itemIndex].title}</Text>
          </SimpleGrid>
        </Box>
      );
    },
    [isDark, finalList.length, memoDisplaySong]
  );

  const EmptyListRender = useCallback(
    () => (
      <Container style={{ textAlign: 'center' }}>
        <Text>Sorry, it seems you haven&apos;t added any favourites yet!</Text>
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
      <SimpleGrid pt="md" h="100%" bg={isDark ? 'gray.8' : 'gray.2'} cols={1}>
        {finalList.length === 0 && <EmptyListRender />}
        <Box ref={wrapperRef} pos="relative" style={{ overflow: 'hidden' }} h="100%">
          <Grid
            rowHeight={120}
            columnWidth="50%"
            columnCount={numColumns.current}
            rowCount={numRows}
            cellProps={{ data: finalList }}
            cellComponent={Cell}
          />
        </Box>
      </SimpleGrid>
    </>
  );
}

export default Favourites;
