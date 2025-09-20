import { useCallback, useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import Fuse, { FuseResult } from 'fuse.js';
import { FaSearch } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router';
import { List, RowComponentProps } from 'react-window';
import { useDebouncedCallback } from 'use-debounce';
import {
  ActionIcon,
  Box,
  Container,
  Group,
  Text,
  TextInput,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { useQuery } from '../../helpers';
import { useMainContext } from '../../utils/context';
import classes from './Search.module.scss';

const meta = {
  title: 'Search',
  page: 'Search',
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

function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const { songs, dispatch } = useMainContext();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const routerQuery = useQuery(location.search);
  const extractedQuery = routerQuery.get('query');
  const fuse = new Fuse(songs, {
    keys: ['number', 'title'],
    minMatchCharLength: 1,
    threshold: 0.4,
  });
  const [searchQuery, setSearchQuery] = useState(extractedQuery || '');
  const [searchResults, setSearchResults] = useState<FuseResult<Song>[]>(
    fuse.search(extractedQuery || searchQuery)
  );

  /** Triggers navigation to a song at a specified index */
  const navigateToSong = useCallback(
    (songNumber: number) => {
      navigate(`/song/${songNumber}`);
    },
    [navigate]
  );

  const Row = useCallback(
    ({ index, style }: RowComponentProps) => {
      const result = searchResults[index];
      if (!result) return null;

      return (
        <div style={{ ...style, padding: '4px 20px' }}>
          <UnstyledButton
            onClick={() => navigateToSong(result.item.number)}
            style={{ width: '100%' }}
            className={classes.searchResultItem}
          >
            <Box
              p="md"
              className={classes.innerWrapper}
              style={{
                ...itemStyle,
                backgroundColor: isDark ? 'var(--mantine-color-gray-7)' : 'white',
                cursor: 'pointer',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              <Group justify="space-between" align="center">
                <Text fw={700} size="lg">
                  #{result.item.number}
                </Text>
                <Text fw={600} size="md" style={{ flex: 1, textAlign: 'left', marginLeft: '1rem' }}>
                  {result.item.title}
                </Text>
              </Group>
            </Box>
          </UnstyledButton>
        </div>
      );
    },
    [searchResults, isDark, navigateToSong]
  );

  const handleSearch = useDebouncedCallback(
    (value: string) => {
      const result = fuse.search(value);
      setSearchResults(result);
    },
    300,
    { leading: true, trailing: true }
  );

  const submitQuery = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.length > 0) {
      handleSearch(searchQuery);
    }
  };

  const searchQueryChange = (value: string) => {
    setSearchQuery(value);
    if (value.length > 0) {
      handleSearch(value);
    } else {
      setSearchResults([]);
      handleSearch.cancel();
    }
  };

  useEffect(() => {
    dispatch({ type: 'setTitle', payload: meta.title });
  }, [dispatch]);

  useEffect(() => {
    if (extractedQuery) {
      handleSearch(extractedQuery);
    }
  }, [extractedQuery, handleSearch]);

  return (
    <>
      <Helmet>
        <title>{`Hymns for All Times | ${meta.page}`}</title>
      </Helmet>
      <Box pt="lg" h="100vh" className={classes.search}>
        <Container style={{ textAlign: 'center' }} mb="lg">
          <form onSubmit={submitQuery}>
            <TextInput
              size="lg"
              placeholder="Search hymns and songs..."
              value={searchQuery}
              onChange={(e) => searchQueryChange(e.currentTarget.value)}
              rightSection={
                <ActionIcon type="submit" variant="filled" color="blue" aria-label="Search">
                  <FaSearch />
                </ActionIcon>
              }
              style={{ maxWidth: '600px', width: '100%', margin: 'auto' }}
              styles={{
                input: {
                  fontSize: '1.1rem',
                  padding: '0.75rem 1rem',
                },
              }}
            />
          </form>
        </Container>

        {searchResults.length > 0 && (
          <Container>
            <Text size="sm" c="dimmed" ta="center" mb="md">
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </Text>
          </Container>
        )}

        <Box
          style={{
            height: 'calc(100vh - 200px)',
            overflow: 'hidden',
          }}
        >
          {searchResults.length > 0 ? (
            <List
              rowComponent={Row}
              rowCount={searchResults.length}
              rowHeight={calculateRowHeight}
              rowProps={{}}
              overscanCount={6}
            />
          ) : searchQuery.length > 0 ? (
            <Container className={classes.emptyState}>
              <Text ta="center" c="dimmed" mt="xl" size="lg">
                No results found for "{searchQuery}"
              </Text>
              <Text ta="center" c="dimmed" mt="sm" size="sm">
                Try searching with different keywords or check your spelling
              </Text>
            </Container>
          ) : (
            <Container className={classes.emptyState}>
              <Text ta="center" c="dimmed" mt="xl" size="lg">
                Search our collection of hymns and songs
              </Text>
              <Text ta="center" c="dimmed" mt="sm" size="lg">
                Enter a song number, title, or keyword to get started
              </Text>
            </Container>
          )}
        </Box>
      </Box>
    </>
  );
}

export default Search;
