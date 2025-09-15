import { useEffect, useRef, useState } from 'react';
import classes from './HomepageSearch.module.scss';
import cx from 'classnames';
import Fuse, { FuseResult } from 'fuse.js';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { useDebouncedCallback } from 'use-debounce';
import {
  ActionIcon,
  Box,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useMainContext } from '@/utils/context';

interface HomepageSearchProps {
  isDark: boolean;
}

const HomepageSearch = ({ isDark }: HomepageSearchProps) => {
  const navigate = useNavigate();
  const { songs } = useMainContext();
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState<FuseResult<Song>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const fuse = new Fuse(songs, {
    keys: ['number', 'title'],
    minMatchCharLength: 2,
    threshold: 0.4,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) 
        setIsDropdownOpen(false);
      
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = useDebouncedCallback((value: string) => {
    setIsLoading(true);

    if (value.length === 0) {
      setIsDropdownOpen(false);
      setQueryResults([]);
      setIsLoading(false);
      return;
    }

    // Simulate loading delay for smoother UX
    setTimeout(() => {
      const result = fuse.search(value, { limit: 5 });
      setQueryResults(result);
      setIsDropdownOpen(result.length > 0);
      setIsLoading(false);
    }, 200);
  }, 300);

  const searchQueryChange = (value: string) => {
    setQuery(value);
    setIsLoading(value.length > 0);
    handleSearch(value);
  };

  const submitQuery = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.length > 0) {
      setIsDropdownOpen(false);
      navigate(`/search?query=${query}`);
    }
  };

  const gotoSong = (songNumber: number) => {
    setIsDropdownOpen(false);
    setQuery('');
    setQueryResults([]);
    navigate(`/song/${songNumber}`);
  };

  return (
    <div className="search-container" ref={searchContainerRef}>
      <form onSubmit={submitQuery}>
        <TextInput
          size="lg"
          placeholder="Search hymns and songs..."
          value={query}
          onChange={(e) => searchQueryChange(e.currentTarget.value)}
          className={cx('glass-search', { 'dark-theme': isDark })}
          classNames={{ input: classes.input, section: classes.section }}
          rightSection={
            isLoading ? (
              <Loader size="sm" className="loading-spinner" />
            ) : (
              <ActionIcon
                type="submit"
                variant="subtle"
                size="lg"
                aria-label="Search"
                style={{
                  backgroundColor: 'transparent',
                  color: isDark ? '#fff' : '#1976d2',
                }}
                onClick={() => query.length > 0 && navigate(`/search?query=${query}`)}
              >
                <FaSearch size={18} />
              </ActionIcon>
            )
          }
        />
      </form>

      {/* Search Results Dropdown */}
      {isDropdownOpen && queryResults.length > 0 && (
        <Box className={`search-dropdown ${isDark ? 'dark-theme' : ''}`}>
          <Stack gap="xs" p="sm">
            {queryResults.map((result) => (
              <UnstyledButton
                key={result.item.number}
                onClick={() => gotoSong(result.item.number)}
                className={`search-result-item ${isDark ? 'dark-theme' : ''}`}
                role="button"
              >
                <SimpleGrid cols={2} style={{ textAlign: 'left', alignItems: 'center' }}>
                  <Text size="sm" fw={600} style={{ color: isDark ? '#fff' : '#333' }}>
                    #{result.item.number}
                  </Text>
                  <Text size="sm" fw={500} style={{ color: isDark ? '#e0e0e0' : '#555' }}>
                    {result.item.title}
                  </Text>
                </SimpleGrid>
              </UnstyledButton>
            ))}
          </Stack>
        </Box>
      )}
    </div>
  );
};

export default HomepageSearch;
