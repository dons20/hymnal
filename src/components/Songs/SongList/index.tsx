import React, { memo, useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import classes from './SongList.module.scss';
import { Helmet } from '@dr.pogodin/react-helmet';
import { FaFilter, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { List, type RowComponentProps } from 'react-window';
import {
  ActionIcon,
  Affix,
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  LoadingOverlay,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { updateFavesDB } from '@/helpers';
import { useMainContext } from '@/utils/context';

const SORT_BY_OPTIONS = [
  { label: 'Number', value: 'num' },
  { label: 'Alphabetical', value: 'alpha' },
] as const;

const SORT_DIR_OPTIONS = [
  { label: 'Ascending', value: 'asc' },
  { label: 'Descending', value: 'desc' },
] as const;

const itemGroupStyle = {
  border: '1px solid var(--mantine-color-gray-3)',
  borderRadius: 'var(--mantine-radius-sm)',
  transition: 'all 0.2s ease',
};

const calculateRowHeight = () => {
  const isMobile = window.innerWidth < 768;
  const baseHeight = isMobile ? 100 : 80;
  return baseHeight;
};

const SongListContent = memo(
  ({
    displaySongs,
    favourites,
    onSongClick,
    onToggleFavourite,
    isPending,
  }: {
    displaySongs: Song[];
    favourites: number[];
    onSongClick: (songNumber: number) => void;
    onToggleFavourite: (songNumber: number) => void;
    isPending: boolean;
  }) => {
    const favouritesSet = useMemo(() => new Set(favourites), [favourites]);

    const Row = ({
      index,
      style,
      songs,
    }: RowComponentProps<{
      songs: Song[];
    }>) => {
      const song = songs[index];
      const isFavourite = favouritesSet.has(song.number - 1);
      return (
        <div className={classes.songWrapper}>
          <UnstyledButton
            key={song.number}
            onClick={() => onSongClick(song.number)}
            style={{ ...style, ...itemGroupStyle, width: '100%', padding: 8, marginBottom: 8 }}
            className={classes.songItem}
          >
            <Group justify="space-between" p="sm">
              <div style={{ flex: 1 }}>
                <Text fw={700} size="md">
                  #{song.number} - {song.title}
                </Text>
              </div>

              <ActionIcon
                variant={isFavourite ? 'filled' : 'outline'}
                color={isFavourite ? 'red' : 'gray'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavourite(song.number);
                }}
                style={{ flexShrink: 0 }}
                component="span"
              >
                <FaHeart size={14} />
              </ActionIcon>
            </Group>
          </UnstyledButton>
        </div>
      );
    };

    return (
      <Box pos="relative" h="70vh">
        <LoadingOverlay visible={isPending} zIndex={1000} overlayProps={{ blur: 2 }} />
        <List
          rowComponent={Row}
          rowCount={displaySongs.length}
          rowHeight={calculateRowHeight}
          rowProps={{ songs: displaySongs }}
          overscanCount={6}
        />
      </Box>
    );
  }
);

const SongList = () => {
  const navigate = useNavigate();
  const { songs, favourites, setFavourites, dispatch } = useMainContext();

  // Set the page title when component mounts
  useEffect(() => {
    dispatch!({ type: 'setTitle', payload: 'Song List' });
  }, [dispatch]);

  const [opened, { open, close }] = useDisclosure(false);
  const [sortBy, setSortBy] = useState<'num' | 'alpha'>('num');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [enableLetterFilter, setEnableLetterFilter] = useState(false);
  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const [enableRangeFilter, setEnableRangeFilter] = useState(false);
  const [rangeFilter, setRangeFilter] = useState<[number, number] | null>(null);
  const [onlyFaves, setOnlyFaves] = useState(false);

  // Separate applied state (used by list) from UI state (used by Drawer controls)
  const [applied, setApplied] = useState({
    sortBy: 'num' as 'num' | 'alpha',
    sortDirection: 'asc' as 'asc' | 'desc',
    enableLetterFilter: false,
    letterFilter: null as string | null,
    enableRangeFilter: false,
    rangeFilter: null as [number, number] | null,
    onlyFaves: false,
  });

  // Transition for non-blocking updates
  const [isPending, startTransition] = useTransition();

  // Apply current UI settings to the list (invoked from Apply button)
  const handleApply = useCallback(() => {
    startTransition(() => {
      setApplied({
        sortBy,
        sortDirection,
        enableLetterFilter,
        letterFilter,
        enableRangeFilter,
        rangeFilter,
        onlyFaves,
      });
    });
    close();
  }, [
    sortBy,
    sortDirection,
    enableLetterFilter,
    letterFilter,
    enableRangeFilter,
    rangeFilter,
    onlyFaves,
    close,
  ]);

  // Compute unique letters and numeric ranges (100-sized buckets)
  const { letters, numberRanges } = useMemo(() => {
    const lettersSet = new Set<string>();
    const nums: number[] = [];
    const sortedSongs = [...songs].sort((a, b) => a.number - b.number);
    for (const song of sortedSongs) {
      const match = song.title.match('[a-zA-Z]')?.[0];
      if (match) lettersSet.add(match.toUpperCase());
      nums.push(song.number);
    }
    const ranges: [number, number][] = [];
    for (let i = 0; i < nums.length; i += 100) {
      const slice = nums.slice(i, i + 100);
      if (slice.length > 0) ranges.push([slice[0], slice[slice.length - 1]]);
    }
    return { letters: Array.from(lettersSet).sort(), numberRanges: ranges };
  }, [songs]);

  const displaySongs = useMemo(() => {
    let list = [...songs];

    // Apply filters
    if (applied.enableLetterFilter && applied.letterFilter) {
      list = list.filter(
        (song) => song.title.match('[a-zA-Z]')?.[0]?.toUpperCase() === applied.letterFilter
      );
    }
    if (applied.enableRangeFilter && applied.rangeFilter) {
      const [start, end] = applied.rangeFilter;
      list = list.filter((song) => song.number >= start && song.number <= end);
    }
    if (applied.onlyFaves) {
      list = list.filter((song) => favourites.includes(song.number - 1));
    }

    if (applied.sortBy === 'alpha') {
      list.sort((a, b) => {
        const aIdx = a.title.match('[a-zA-Z]')?.index ?? 0;
        const bIdx = b.title.match('[a-zA-Z]')?.index ?? 0;
        const aSub = a.title.substring(aIdx);
        const bSub = b.title.substring(bIdx);
        return aSub.localeCompare(bSub);
      });
    } else {
      list.sort((a, b) => a.number - b.number);
    }
    if (applied.sortDirection === 'desc') list.reverse();

    return list;
  }, [songs, favourites, applied]);

  const handleSongClick = useCallback(
    (songNumber: number) => {
      navigate(`/song/${songNumber}`);
    },
    [navigate]
  );

  const handleFavoriteToggle = useCallback(
    (songNumber: number) => {
      let newFavorites = [...favourites];

      if (favourites.includes(songNumber - 1)) {
        newFavorites = favourites.filter((fave) => fave !== songNumber - 1);
      } else newFavorites.push(songNumber - 1);

      setFavourites(newFavorites);
      updateFavesDB(newFavorites);
    },
    [favourites, setFavourites]
  );

  return (
    <>
      <Helmet>
        <title>Song List - Hymnal</title>
        <meta
          name="description"
          content="Browse and search through our collection of hymns and spiritual songs."
        />
      </Helmet>

      {/* List */}
      <div className={classes.songs}>
        <SongListContent
          displaySongs={displaySongs}
          favourites={favourites}
          onSongClick={handleSongClick}
          onToggleFavourite={handleFavoriteToggle}
          isPending={isPending}
        />
      </div>

      {/* Floating Filter Button */}
      <Affix position={{ bottom: 16, right: 16 }}>
        <Tooltip label="Filters" withArrow>
          <ActionIcon
            size="xl"
            radius="xl"
            variant="filled"
            color="blue"
            onClick={open}
            aria-label="Filters"
          >
            <FaFilter />
          </ActionIcon>
        </Tooltip>
      </Affix>

      {/* Filters Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        title="Filters"
        position="right"
        size={340}
        padding="md"
        keepMounted
      >
        <Stack gap="md">
          {/* Sorting */}
          <div>
            <Text fw={600} mb={6}>
              Sort by
            </Text>
            <SegmentedControl
              fullWidth
              value={sortBy}
              onChange={(v) => setSortBy(v as 'num' | 'alpha')}
              data={SORT_BY_OPTIONS as unknown as { label: string; value: string }[]}
            />
            <Group mt="sm">
              <SegmentedControl
                value={sortDirection}
                onChange={(v) => setSortDirection(v as 'asc' | 'desc')}
                data={SORT_DIR_OPTIONS as unknown as { label: string; value: string }[]}
              />
            </Group>
          </div>

          <Divider />

          {/* Filter by Letter */}
          <div>
            <Group justify="space-between" mb={6}>
              <Text fw={600}>Filter by letter</Text>
              <Switch
                checked={enableLetterFilter}
                onChange={(e) => setEnableLetterFilter(e.currentTarget.checked)}
              />
            </Group>
            <Group gap={6} wrap="wrap">
              {letters.map((ltr) => (
                <Button
                  key={ltr}
                  size="xs"
                  variant={letterFilter === ltr ? 'filled' : 'outline'}
                  onClick={() => setLetterFilter((prev) => (prev === ltr ? null : ltr))}
                  disabled={!enableLetterFilter}
                >
                  {ltr}
                </Button>
              ))}
            </Group>
          </div>

          <Divider />

          {/* Filter by Range */}
          <div>
            <Group justify="space-between" mb={6}>
              <Text fw={600}>Filter by range</Text>
              <Switch
                checked={enableRangeFilter}
                onChange={(e) => setEnableRangeFilter(e.currentTarget.checked)}
              />
            </Group>
            <Stack gap={6}>
              <Group gap={6} wrap="wrap">
                {numberRanges.map(([start, end]) => {
                  const selected =
                    rangeFilter && rangeFilter[0] === start && rangeFilter[1] === end;
                  return (
                    <Button
                      key={`${start}-${end}`}
                      size="xs"
                      variant={selected ? 'filled' : 'outline'}
                      onClick={() =>
                        setRangeFilter((prev) =>
                          prev && prev[0] === start && prev[1] === end ? null : [start, end]
                        )
                      }
                      disabled={!enableRangeFilter}
                    >
                      {start} - {end}
                    </Button>
                  );
                })}
              </Group>
            </Stack>
          </div>

          <Divider />

          {/* Favourites */}
          <Group justify="space-between">
            <Text fw={600}>Only favourites</Text>
            <Switch checked={onlyFaves} onChange={(e) => setOnlyFaves(e.currentTarget.checked)} />
          </Group>

          <Divider />

          <Box>
            <Group justify="space-between">
              <Button
                variant="light"
                onClick={() => {
                  setEnableLetterFilter(false);
                  setLetterFilter(null);
                  setEnableRangeFilter(false);
                  setRangeFilter(null);
                  setOnlyFaves(false);
                  setSortBy('num');
                  setSortDirection('asc');
                }}
              >
                Clear all
              </Button>
              <Button onClick={handleApply}>Apply</Button>
            </Group>
          </Box>
        </Stack>
      </Drawer>
    </>
  );
};

export default SongList;
