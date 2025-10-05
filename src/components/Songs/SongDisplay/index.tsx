import React, { useEffect, useMemo } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaBook,
  FaExpandArrowsAlt,
  FaHeart,
} from 'react-icons/fa';
import { Navigate, useNavigate, useParams } from 'react-router';
import {
  ActionIcon,
  Box,
  Container,
  Flex,
  Group,
  Text,
  Title,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { Button } from '@/components';
import { updateFavesDB } from '@/helpers';
import { useMainContext } from '@/utils/context';
import { renderChorusWithParts } from './helpers';
import { PresentationMode } from './PresentationMode';
import {
  createPresentationClickHandler,
  createTouchEndHandler,
  createTouchMoveHandler,
  createTouchStartHandler,
} from './presentationUtils';
import { usePresentationMode } from './usePresentationMode';

import './SongDisplay.scss';

type ParamTypes = {
  songID?: string;
};

function SongDisplay() {
  const navigate = useNavigate();
  const { songID } = useParams<ParamTypes>();
  const { songs, favourites, setFavourites, dispatch } = useMainContext();
  const { colorScheme } = useMantineColorScheme();
  const reducedMotion = useReducedMotion();
  const isDark = colorScheme === 'dark';

  const songIndex = parseInt(songID || '1', 10) - 1;
  const songToRender = songs.find((song) => song.number === songIndex + 1) || null;

  const {
    presentationMode,
    currentSlide,
    slideTransitioning,
    presentationSlides,
    touchStart,
    touchEnd,
    setTouchStart,
    setTouchEnd,
    togglePresentationMode,
    closePresentationMode,
    nextSlide,
    previousSlide,
    goToSlide,
  } = usePresentationMode({ song: songToRender, reducedMotion });

  // Ensure the route parameter is a number before rendering anything
  useEffect(() => {
    if (!/\d+/.test(songID!)) navigate(-1);
  }, [songID, navigate]);

  useEffect(() => {
    if (songs.length > 1) dispatch!({ type: 'setTitle', payload: songToRender?.title || '' });
  }, [dispatch, songs, songToRender]);

  const songBody = useMemo(
    () =>
      songs.length > 1 &&
      songToRender?.verse.map((verse, i) => {
        if (i === 1 && songToRender.chorus) {
          return (
            <React.Fragment key={`verse-chorus-${i}`}>
              <Box className="chorus">
                <Text
                  component="span"
                  className="label"
                  fw={600}
                  size="lg"
                  c={isDark ? 'gray.4' : 'gray.6'}
                >
                  Chorus
                </Text>
                {renderChorusWithParts(songToRender, isDark)}
              </Box>
              <Box className="verse">
                <Text
                  component="span"
                  className="label"
                  fw={600}
                  size="lg"
                  c={isDark ? 'gray.4' : 'gray.6'}
                >
                  Verse {i + 1}
                </Text>
                <Text className="song-text">{verse}</Text>
              </Box>
            </React.Fragment>
          );
        }

        return (
          <Box key={`verse-${i}`} className="verse">
            <Text
              component="span"
              className="label"
              fw={600}
              size="lg"
              c={isDark ? 'gray.4' : 'gray.6'}
            >
              Verse {i + 1}
            </Text>
            <Text className="song-text">{verse}</Text>
          </Box>
        );
      }),
    [songs, songToRender, isDark]
  );

  if (songToRender === null) return <Navigate to="../index" replace />;

  const isFavourite = favourites.includes(songToRender.number - 1);
  const isFirstSong = songToRender.number === 1;
  const isLastSong = songToRender.number === songs.length;

  const toggleFavourite = (number: number) => {
    let faves = [];
    if (favourites.includes(number - 1)) {
      faves = favourites.filter((fave) => fave !== number - 1);
      setFavourites(faves);
    } else {
      faves = [...favourites, number - 1];
      setFavourites(faves);
    }
    updateFavesDB(faves);
  };

  // Useful for navigating to the correct spot in the song list
  const backToIndex = () =>
    navigate('/songs/index', { state: { songNumber: songToRender.number - 1 } });
  const previousSong = () => navigate(`/song/${songToRender.number - 1}`);
  const nextSong = () => navigate(`/song/${songToRender.number + 1}`);

  // Create touch and click handlers
  const handleTouchStart = createTouchStartHandler(setTouchEnd, setTouchStart);
  const handleTouchMove = createTouchMoveHandler(setTouchEnd);
  const handleTouchEnd = createTouchEndHandler(touchStart, touchEnd, nextSlide, previousSlide);
  const handlePresentationClick = createPresentationClickHandler(nextSlide, previousSlide);

  // Render presentation mode if active
  if (presentationMode && presentationSlides.length > 0) {
    return (
      <PresentationMode
        presentationMode={presentationMode}
        presentationSlides={presentationSlides}
        currentSlide={currentSlide}
        slideTransitioning={slideTransitioning}
        isDark={isDark}
        reducedMotion={reducedMotion}
        songTitle={songToRender!.title}
        onClose={closePresentationMode}
        onClick={handlePresentationClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onSlideClick={goToSlide}
      />
    );
  }

  return (
    <Container
      className="container"
      size="lg"
      my="md"
      py="lg"
      pl="xl"
      bg={colorScheme === 'dark' ? 'transparent' : 'white'}
    >
      <Helmet>
        <title>{`Hymns for All Times | ${songToRender!.title}`}</title>
      </Helmet>
      <Flex
        className="header"
        pos="relative"
        pr="lg"
        justify="space-between"
        wrap="wrap"
        gap="md"
        maw={800}
        m="auto"
        mb="lg"
      >
        <Title order={2} fw={500}>
          <Box component="span" display={{ base: 'block', sm: 'inline' }}>
            # {songToRender!.number}
          </Box>
          <Box
            component="span"
            display={{ base: 'block', sm: 'inline' }}
            ml={{ base: 0, sm: 'xs' }}
          >
            {songToRender!.title}
          </Box>
        </Title>
        <Group gap="xs">
          <Tooltip label="Song List" position="bottom" withArrow>
            <ActionIcon
              variant="outline"
              color="gray"
              bg={isDark ? 'gray.8' : 'gray.1'}
              size="lg"
              onClick={backToIndex}
              aria-label="Back to songs index"
            >
              <FaBook />
            </ActionIcon>
          </Tooltip>
          <Tooltip
            label={isFavourite ? 'Remove Favourite' : 'Add Favourite'}
            position="bottom"
            withArrow
          >
            <ActionIcon
              variant="outline"
              color={isFavourite ? 'red' : 'gray'}
              bg={isFavourite ? (isDark ? 'red.9' : 'red.1') : isDark ? 'gray.8' : 'gray.1'}
              size="lg"
              onClick={() => toggleFavourite(songToRender.number)}
              aria-label="Add to Favourites"
              className="faveIcon"
            >
              <FaHeart
                color={
                  isFavourite ? (isDark ? '#ff6b6b' : '#e03131') : isDark ? '#868e96' : '#495057'
                }
              />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Present" position="bottom" withArrow>
            <ActionIcon
              variant="outline"
              color="blue"
              bg={isDark ? 'gray.8' : 'gray.1'}
              size="lg"
              onClick={togglePresentationMode}
              aria-label="Presentation mode"
            >
              <FaExpandArrowsAlt />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Flex>
      <Box className="body">{songBody}</Box>
      {songToRender.author ? (
        <Text className="footer" c={isDark ? 'gray.3' : 'gray.7'} fs="italic" ta="right">
          {songToRender.author}
        </Text>
      ) : (
        <Box mb="md">
          &nbsp;
        </Box>
      )}
      <Box className="navigation-container">
        <Flex
          className="navigation-flex navigation-buttons"
          gap="md"
          wrap="wrap"
          justify="center"
        >
          {!isFirstSong && (
            <Button
              onClick={previousSong}
              leftSection={<FaArrowCircleLeft />}
              size="md"
              className="navigation-button"
            >
              Previous Song
            </Button>
          )}
          {!isLastSong && (
            <Button
              onClick={nextSong}
              rightSection={<FaArrowCircleRight />}
              size="md"
              className="navigation-button"
              style={{ order: isFirstSong ? 2 : 0 }}
            >
              Next Song
            </Button>
          )}
          <Button
            onClick={backToIndex}
            variant="outline"
            size="md"
            className="navigation-button"
            style={{ order: isFirstSong ? 1 : 0 }}
          >
            Back to Index
          </Button>
        </Flex>
      </Box>
    </Container>
  );
}

export default SongDisplay;
