import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { FaArrowCircleLeft, FaArrowCircleRight, FaBook, FaExpand, FaHeart } from 'react-icons/fa';
import { Navigate, useNavigate, useParams } from 'react-router';
import {
  ActionIcon,
  Box,
  Container,
  Flex,
  Group,
  Portal,
  Text,
  Title,
  Transition,
  useMantineColorScheme,
} from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { Button } from '@/components';
import { updateFavesDB } from '@/helpers';
import { useMainContext } from '@/utils/context';

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
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideTransitioning, setSlideTransitioning] = useState(false);

  // Touch handling state for swipe detection
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const songIndex = parseInt(songID || '1', 10) - 1;
  const songToRender = songs.find((song) => song.number === songIndex + 1) || null;

  // Ensure the route parameter is a number before rendering anything
  useEffect(() => {
    if (!/\d+/.test(songID!)) navigate(-1);
  }, [songID, navigate]);

  useEffect(() => {
    if (songs.length > 1) dispatch!({ type: 'setTitle', payload: songToRender?.title || '' });
  }, [dispatch, songs, songToRender]);

  // ESC key handler for presentation mode
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && presentationMode) {
        closePresentationMode();
      }
    };

    if (presentationMode) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [presentationMode]);

  // Create presentation slides in the correct order (V1 -> C -> V2 -> C -> V3 -> C)
  const presentationSlides = useMemo(() => {
    if (!songToRender) return [];

    const slides: { type: string; content: string | VocalPart[]; label: string }[] = [];
    const hasChorus = Boolean(songToRender.chorus);

    songToRender.verse.forEach((verse: string, index: number) => {
      // Add verse
      slides.push({
        type: 'verse',
        content: verse,
        label: `Verse ${index + 1}`,
      });

      // Add chorus after each verse (except if it's the last verse and no chorus exists)
      if (hasChorus) {
        slides.push({
          type: 'chorus',
          content:
            songToRender.chorusParts && songToRender.chorusParts.length > 0
              ? songToRender.chorusParts
              : songToRender.chorus,
          label: 'Chorus',
        });
      }
    });

    return slides;
  }, [songToRender]);

  // Helper function to render vocal parts with indicators
  const renderChorusWithParts = (song: Song, isDark: boolean) => {
    if (!song.chorusParts || song.chorusParts.length === 0) {
      // Fallback to regular chorus rendering
      return (
        <Text style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.6 }}>{song.chorus}</Text>
      );
    }

    return (
      <Box className="chorus-parts">
        {song.chorusParts.map((part, index) => (
          <Box
            key={index}
            className="chorus-part"
            style={{ position: 'relative', marginBottom: '0.5rem' }}
          >
            {part.part && (
              <Text
                component="span"
                className="part-indicator"
                style={{
                  position: 'absolute',
                  left: '-1.5rem',
                  top: '0',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color:
                    part.part === 'soprano'
                      ? isDark
                        ? '#74c0fc'
                        : '#1c7ed6' // Blue for soprano
                      : isDark
                        ? '#ffec99'
                        : '#fd7e14', // Orange for baritone
                  backgroundColor:
                    part.part === 'soprano'
                      ? isDark
                        ? 'rgba(116, 192, 252, 0.15)'
                        : 'rgba(28, 126, 214, 0.08)'
                      : isDark
                        ? 'rgba(255, 236, 153, 0.15)'
                        : 'rgba(253, 126, 20, 0.08)',
                  padding: '0.1rem 0.3rem',
                  borderRadius: '4px',
                  border: `1px solid ${
                    part.part === 'soprano'
                      ? isDark
                        ? 'rgba(116, 192, 252, 0.3)'
                        : 'rgba(28, 126, 214, 0.25)'
                      : isDark
                        ? 'rgba(255, 236, 153, 0.3)'
                        : 'rgba(253, 126, 20, 0.25)'
                  }`,
                  minWidth: '1.2rem',
                  textAlign: 'center',
                  display: 'inline-block',
                }}
              >
                {part.part === 'soprano' ? 'A' : part.part === 'baritone' ? 'B' : '♪'}
              </Text>
            )}
            <Text
              style={{
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                lineHeight: 1.6,
                paddingLeft: part.part ? '0' : '0',
                fontWeight: part.part === 'soprano' ? 500 : 400,
                color:
                  part.part === 'soprano'
                    ? isDark
                      ? '#e9ecef'
                      : '#212529' // Standard text color for soprano
                    : isDark
                      ? '#ced4da'
                      : '#495057', // Slightly muted for baritone
              }}
            >
              {part.text}
            </Text>
          </Box>
        ))}
      </Box>
    );
  };

  // Helper function to render presentation slide content
  const renderPresentationContent = (content: string | VocalPart[], isDark: boolean) => {
    if (typeof content === 'string') {
      return (
        <Text
          lh={1.4}
          style={{
            whiteSpace: 'pre-line',
            wordBreak: 'break-word',
            maxHeight: '60vh',
            overflow: 'auto',
            fontSize: 'clamp(1.2rem, 4vw, 3rem)',
            textAlign: 'center',
          }}
        >
          {content}
        </Text>
      );
    }

    // Handle VocalPart[] for presentation mode with larger styling
    return (
      <Box
        style={{
          maxHeight: '60vh',
          overflow: 'auto',
          fontSize: 'clamp(1.2rem, 4vw, 3rem)',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {content.map((part, index) => {
          // Check if this is the end of a B part followed by an A part (new pair starting)
          const isEndOfPair =
            part.part === 'baritone' &&
            index < content.length - 1 &&
            content[index + 1]?.part === 'soprano';

          return (
            <React.Fragment key={index}>
              <Box
                style={{
                  position: 'relative',
                  marginBottom: isEndOfPair ? '2rem' : '1.5rem',
                  paddingLeft: '3rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}
              >
                {part.part && (
                  <Text
                    component="span"
                    style={{
                      position: 'absolute',
                      left: '0',
                      top: '0',
                      fontSize: 'clamp(1rem, 3vw, 2.5rem)',
                      fontWeight: 600,
                      color:
                        part.part === 'soprano'
                          ? isDark
                            ? '#74c0fc'
                            : '#1c7ed6' // Blue for soprano
                          : isDark
                            ? '#ffec99'
                            : '#fd7e14', // Orange for baritone
                      backgroundColor:
                        part.part === 'soprano'
                          ? isDark
                            ? 'rgba(116, 192, 252, 0.15)'
                            : 'rgba(28, 126, 214, 0.08)'
                          : isDark
                            ? 'rgba(255, 236, 153, 0.15)'
                            : 'rgba(253, 126, 20, 0.08)',
                      padding: 'clamp(0.2rem, 1vw, 0.5rem) clamp(0.4rem, 1.5vw, 1rem)',
                      borderRadius: '8px',
                      border: `2px solid ${
                        part.part === 'soprano'
                          ? isDark
                            ? 'rgba(116, 192, 252, 0.3)'
                            : 'rgba(28, 126, 214, 0.25)'
                          : isDark
                            ? 'rgba(255, 236, 153, 0.3)'
                            : 'rgba(253, 126, 20, 0.25)'
                      }`,
                      minWidth: 'clamp(2rem, 4vw, 3rem)',
                      textAlign: 'center',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {part.part === 'soprano' ? 'A' : part.part === 'baritone' ? 'B' : '♪'}
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: 'clamp(1.2rem, 4vw, 3rem)',
                    lineHeight: 1.4,
                    fontWeight: part.part === 'soprano' ? 600 : 400,
                    color:
                      part.part === 'soprano'
                        ? isDark
                          ? '#e9ecef'
                          : '#212529' // Standard text color for soprano
                        : isDark
                          ? '#ced4da'
                          : '#495057', // Slightly muted for baritone
                    textAlign: 'center',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    flex: 1,
                  }}
                >
                  {part.text}
                </Text>
              </Box>
              {isEndOfPair && (
                <Box
                  style={{
                    width: '60%',
                    height: '1px',
                    margin: '3rem auto',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
                    borderRadius: '1px',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    );
  };

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
                <Text style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.6 }}>
                  {verse}
                </Text>
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
            <Text style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.6 }}>{verse}</Text>
          </Box>
        );
      }),
    [songs, songToRender, isDark]
  );

  if (songToRender === null) return <Navigate to="../index" replace />;

  const isFavourite = favourites.includes(songToRender.number - 1);
  const isFirstSong = songToRender.number > 1;
  const isLastSong = songToRender.number < songs.length - 1;

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

  const togglePresentationMode = () => {
    setPresentationMode(!presentationMode);
    setCurrentSlide(0);
  };

  const nextSlide = () => {
    if (reducedMotion) {
      if (currentSlide < presentationSlides.length - 1) {
        // No animation for users who prefer reduced motion
        setCurrentSlide(currentSlide + 1);
      } else setCurrentSlide(0);
    } else {
      // Animate slide transition for users who don't mind motion
      setSlideTransitioning(true);
      setTimeout(() => {
        if (currentSlide < presentationSlides.length - 1) setCurrentSlide(currentSlide + 1);
        else setCurrentSlide(0);

        setSlideTransitioning(false);
      }, 150);
    }
  };

  const previousSlide = () => {
    if (reducedMotion) {
      if (currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      } else setCurrentSlide(presentationSlides.length - 1);
    } else {
      setSlideTransitioning(true);
      setTimeout(() => {
        if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
        else setCurrentSlide(presentationSlides.length - 1);

        setSlideTransitioning(false);
      }, 150);
    }
  };

  // Swipe detection constants
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // Swipe left - go to next slide
        nextSlide();
      } else {
        // Swipe right - go to previous slide
        previousSlide();
      }
    }
  };

  // Enhanced tap handling for directional navigation
  const handlePresentationClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // Define tap areas: left 25%, center 50%, right 25%
    const leftAreaEnd = width * 0.25;
    const rightAreaStart = width * 0.75;

    if (x < leftAreaEnd) {
      // Tap on left area - go to previous slide
      previousSlide();
    } else if (x > rightAreaStart) {
      // Tap on right area - go to next slide
      nextSlide();
    } else {
      // Tap on center area - go to next slide (existing behavior)
      nextSlide();
    }
  };

  const closePresentationMode = () => {
    setPresentationMode(false);
    setCurrentSlide(0);
    setSlideTransitioning(false);
  };

  // Presentation Mode Render
  if (presentationMode && presentationSlides.length > 0) {
    const currentSlideData = presentationSlides[currentSlide];

    return (
      <>
        {/* Render regular content but hidden */}
        <div style={{ display: 'none' }}>
          <Container className="container" size="lg" my="md" py="lg" px="xl">
            <Helmet>
              <title>{`Hymns for All Times | ${songToRender!.title}`}</title>
            </Helmet>
          </Container>
        </div>

        {/* Portal for presentation mode - rendered outside component tree */}
        <Portal>
          <Transition
            mounted={presentationMode}
            transition="fade"
            duration={reducedMotion ? 0 : 300}
          >
            {(styles) => (
              <Box
                pos="fixed"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg={isDark ? 'gray.9' : 'white'}
                className="presentation-mode"
                style={{
                  ...styles,
                  zIndex: 9999,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '2rem',
                  paddingTop: '4rem',
                  paddingBottom: '4rem',
                }}
                onClick={handlePresentationClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Close button - positioned safely at top right */}
                <ActionIcon
                  pos="absolute"
                  top={16}
                  right={16}
                  variant="outline"
                  size="lg"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    closePresentationMode();
                  }}
                  style={{ zIndex: 10000 }}
                >
                  ✕
                </ActionIcon>

                {/* Slide content with transition */}
                <Transition
                  mounted={!slideTransitioning}
                  transition="fade"
                  duration={reducedMotion ? 0 : 150}
                >
                  {(contentStyles) => (
                    <Box
                      style={{
                        ...contentStyles,
                        textAlign: 'center',
                        maxWidth: '95vw',
                        width: '100%',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        size="lg"
                        fw={600}
                        mb="lg"
                        c={isDark ? 'blue.4' : 'blue.6'}
                        style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)' }}
                      >
                        {currentSlideData.label}
                      </Text>
                      {renderPresentationContent(currentSlideData.content, isDark)}
                    </Box>
                  )}
                </Transition>

                {/* Navigation indicators - positioned safely at bottom */}
                <Group
                  pos="absolute"
                  bottom={16}
                  left="50%"
                  style={{
                    transform: 'translateX(-50%)',
                    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  }}
                  gap="xs"
                >
                  {presentationSlides.map((_, index) => (
                    <Box
                      key={index}
                      w={8}
                      h={8}
                      bg={index === currentSlide ? 'blue.5' : isDark ? 'gray.5' : 'gray.4'}
                      style={{
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: reducedMotion ? 'none' : 'all 0.2s ease',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!reducedMotion) {
                          setSlideTransitioning(true);
                          setTimeout(() => {
                            setCurrentSlide(index);
                            setSlideTransitioning(false);
                          }, 150);
                        } else setCurrentSlide(index);
                      }}
                    />
                  ))}
                </Group>
              </Box>
            )}
          </Transition>
        </Portal>
      </>
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
          <ActionIcon
            variant="outline"
            color="blue"
            bg={isDark ? 'gray.8' : 'gray.1'}
            size="lg"
            onClick={togglePresentationMode}
            aria-label="Presentation mode"
          >
            <FaExpand />
          </ActionIcon>
        </Group>
      </Flex>
      <Box className="body">{songBody}</Box>
      {songToRender.author && (
        <Text className="footer" c={isDark ? 'gray.3' : 'gray.7'} fs="italic" ta="right">
          {songToRender.author}
        </Text>
      )}
      <Box mt="lg" mb="md" maw={1200} mx="auto">
        <Flex
          gap="md"
          direction={{ base: 'row' }}
          justify="center"
          wrap="wrap"
          align="stretch"
          className="navigation-buttons"
        >
          {isFirstSong && (
            <Button
              onClick={previousSong}
              leftSection={<FaArrowCircleLeft />}
              size="md"
              style={{
                flex: 1,
                maxWidth: '500px',
                minHeight: '42px',
              }}
            >
              Previous Song
            </Button>
          )}
          {isLastSong && (
            <Button
              onClick={nextSong}
              rightSection={<FaArrowCircleRight />}
              size="md"
              style={{
                flex: 1,
                maxWidth: '500px',
                minHeight: '42px',
              }}
            >
              Next Song
            </Button>
          )}
          {/* When there's no previous button, wrap next and back to index */}
          {!isFirstSong && isLastSong && (
            <Button
              onClick={backToIndex}
              variant="outline"
              size="md"
              style={{
                maxWidth: '500px',
                minHeight: '42px',
                flex: 1,
              }}
            >
              Back to Index
            </Button>
          )}
        </Flex>

        {/* Show back to index button separately when both prev/next exist */}
        {isFirstSong && isLastSong && (
          <Box className="navigation-buttons">
            <Button
              onClick={backToIndex}
              variant="outline"
              fullWidth
              mt="md"
              size="md"
              style={{
                maxWidth: '500px',
                minHeight: '42px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Back to Index
            </Button>
          </Box>
        )}

        {/* Show back to index button when only previous exists */}
        {isFirstSong && !isLastSong && (
          <Box className="navigation-buttons">
            <Button
              onClick={backToIndex}
              variant="outline"
              fullWidth
              mt="md"
              size="md"
              style={{
                maxWidth: '500px',
                minHeight: '42px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Back to Index
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default SongDisplay;
