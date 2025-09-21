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
import { useMediaQuery } from '@mantine/hooks';
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
  const [keyboardInset, setKeyboardInset] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const fuse = new Fuse(songs, {
    keys: ['number', 'title'],
    minMatchCharLength: 2,
    threshold: 0.4,
  });

  // Auto-align when dropdown appears and while keyboard is toggling
  useEffect(() => {
    if (!(isDropdownOpen && queryResults.length > 0)) return;

    const buffer = 20; // extra space to keep below the dropdown
    const desiredTop = isMobile ? 12 : 100; // desired px from top for the input

    const align = () => {
      if (!searchContainerRef.current || !dropdownRef.current) return;

      const container = searchContainerRef.current;
      const dropdown = dropdownRef.current;

      // Measurements relative to the page
      const containerRect = container.getBoundingClientRect();
      const containerTopPage = window.scrollY + containerRect.top;

      // Visual viewport metrics (precise when keyboard is open)
      const vv = window.visualViewport;
      const visibleTop = window.scrollY + (vv?.offsetTop ?? 0);
      // Calculate occluded bottom area (likely keyboard height)
      const occludedBottom = Math.max(
        0,
        window.innerHeight - (vv?.height ?? window.innerHeight) - (vv?.offsetTop ?? 0)
      );
      // Update spacer so the page can scroll beyond the keyboard
      setKeyboardInset(isMobile ? occludedBottom : 0);

      // Step 1: place the input near the top (desiredTop)
      const currentTopInViewport = containerTopPage - visibleTop; // px from top of visible area
      const deltaToDesired = currentTopInViewport - desiredTop;
      if (Math.abs(deltaToDesired) > 6) {
        window.scrollBy({ top: deltaToDesired, behavior: 'smooth' });
      }

      // Step 2: ensure dropdown fully fits in the visible viewport
      // Recompute using rAF to reflect any scroll positioning that just happened
      requestAnimationFrame(() => {
        if (!searchContainerRef.current || !dropdownRef.current) return;
        const dRect = dropdown.getBoundingClientRect();
        const dBottomPage = window.scrollY + dRect.bottom;

        const vv2 = window.visualViewport;
        const vTop2 = window.scrollY + (vv2?.offsetTop ?? 0);
        const vHeight2 = vv2?.height ?? window.innerHeight;
        const vBottom2 = vTop2 + vHeight2;

        const overflow = dBottomPage - (vBottom2 - buffer);
        if (overflow > 0) {
          window.scrollBy({ top: overflow, behavior: 'smooth' });
        }
      });
    };

    // Initial align after render
    const timeoutId = window.setTimeout(() => {
      requestAnimationFrame(align);
    }, 50);

    // Keep aligned while keyboard opens/closes or viewport changes
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', align);
      vv.addEventListener('scroll', align);
    }
    window.addEventListener('resize', align);

    return () => {
      window.clearTimeout(timeoutId);
      if (vv) {
        vv.removeEventListener('resize', align);
        vv.removeEventListener('scroll', align);
      }
      window.removeEventListener('resize', align);
    };
  }, [isDropdownOpen, queryResults.length, isMobile]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    searchQueryChange(value);
  };

  const handleFocus = () => {
    if (queryResults.length > 0) {
      setIsDropdownOpen(true);
    }
  };

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
    <div className={classes.searchContainer} ref={searchContainerRef}>
      <form onSubmit={submitQuery}>
        <TextInput
          size="lg"
          placeholder="Search hymns and songs..."
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          classNames={{ input: classes.input, section: classes.section }}
          rightSection={
            isLoading ? (
              <Loader size="sm" color="blue" />
            ) : (
              <ActionIcon
                type="submit"
                variant="subtle"
                size="lg"
                aria-label="Search"
                className={classes.searchIcon}
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

      {/* Search Results Dropdown - positioned below input */}
      {isDropdownOpen && queryResults.length > 0 && (
        <Box
          ref={dropdownRef}
          className={cx(classes.searchDropdown, { [classes.darkTheme]: isDark })}
        >
          <Stack gap="xs" p="sm">
            {queryResults.map((result) => (
              <UnstyledButton
                key={result.item.number}
                onClick={() => gotoSong(result.item.number)}
                className={cx(classes.searchResultItem, { [classes.darkTheme]: isDark })}
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
            {/* View More Results CTA */}
            <UnstyledButton
              onClick={() => {
                setIsDropdownOpen(false);
                if (query.length > 0) navigate(`/search?query=${query}`);
              }}
              className={cx(classes.searchResultItem, classes.viewMore, {
                [classes.darkTheme]: isDark,
              })}
              aria-label="View more search results"
            >
              <Text
                size="sm"
                fw={700}
                ta="center"
                style={{ width: '100%', color: isDark ? '#fff' : '#333' }}
              >
                View More Results
              </Text>
            </UnstyledButton>
          </Stack>
        </Box>
      )}
      {/* Keyboard spacer to increase scrollable height when dropdown is open on mobile */}
      {isMobile && isDropdownOpen && keyboardInset > 0 && (
        <div
          className={classes.keyboardSpacer}
          style={{ height: keyboardInset }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default HomepageSearch;
