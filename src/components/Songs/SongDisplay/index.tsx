import React, { useEffect, useMemo, useState } from "react";
import { FaHeart, FaArrowCircleRight, FaArrowCircleLeft, FaBook, FaExpand } from "react-icons/fa";
import { Box, Container, Text, ActionIcon, SimpleGrid, Group, useMantineColorScheme, Transition } from "@mantine/core";
import { Navigate, useNavigate, useParams } from "react-router";
import { useReducedMotion } from "@mantine/hooks";
import { useMainContext } from "../../../utils/context";
import { updateFavesDB } from "../../../helpers";
import { Helmet } from "@dr.pogodin/react-helmet";
import { Button } from "../../index";
import "./SongDisplay.scss";

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
    
    const songIndex = parseInt(songID || "1", 10) - 1;
    const songToRender = songs.find(song => song.number === songIndex + 1) || null;

    // Ensure the route parameter is a number before rendering anything
    useEffect(() => {
        if (!/\d+/.test(songID!)) {
            navigate(-1);
        }
    }, [songID, navigate]);

    useEffect(() => {
        if (songs.length > 1) {
            dispatch!({ type: "setTitle", payload: songToRender?.title || "" });
        }
    }, [dispatch, songs, songToRender]);

    // Create presentation slides in the correct order (V1 -> C -> V2 -> C -> V3 -> C)
    const presentationSlides = useMemo(() => {
        if (!songToRender) {
            return [];
        }
        
        const slides: { type: string; content: string; label: string }[] = [];
        const hasChorus = Boolean(songToRender.chorus);
        
        songToRender.verse.forEach((verse: string, index: number) => {
            // Add verse
            slides.push({
                type: 'verse',
                content: verse,
                label: `Verse ${index + 1}`
            });
            
            // Add chorus after each verse (except if it's the last verse and no chorus exists)
            if (hasChorus) {
                slides.push({
                    type: 'chorus', 
                    content: songToRender.chorus,
                    label: 'Chorus'
                });
            }
        });
        
        return slides;
    }, [songToRender]);

    const songBody = useMemo(
        () =>
            songs.length > 1 &&
            React.Children.toArray(
                songToRender?.verse.map((verse, i) => {
                    if (i === 1 && songToRender.chorus) {
                        return (
                            <>
                                <Box className="chorus">
                                    <Text component="span" className="label" fw={600} size="sm" c={isDark ? 'gray.4' : 'gray.6'}>Chorus</Text>
                                    <Text>{songToRender.chorus}</Text>
                                </Box>
                                <Box className="verse">
                                    <Text component="span" className="label" fw={600} size="sm" c={isDark ? 'gray.4' : 'gray.6'}>Verse {i + 1}</Text>
                                    <Text>{verse}</Text>
                                </Box>
                            </>
                        );
                    }

                    return (
                        <Box className="verse">
                            <Text component="span" className="label" fw={600} size="sm" c={isDark ? 'gray.4' : 'gray.6'}>Verse {i + 1}</Text>
                            <Text>{verse}</Text>
                        </Box>
                    );
                })
            ),
        [songs, songToRender, isDark]
    );

    if (songToRender === null) {
        return <Navigate to="../index" replace />;
    }

    const isFavourite = favourites.includes(songToRender.number - 1);
    const isFirstSong = songToRender.number > 1;
    const isLastSong = songToRender.number < songs.length - 1;

    const toggleFavourite = (number: number) => {
        let faves = [];
        if (favourites.includes(number - 1)) {
            faves = favourites.filter(fave => fave !== number - 1);
            setFavourites(faves);
        } else {
            faves = [...favourites, number - 1];
            setFavourites(faves);
        }
        updateFavesDB(faves);
    };

    // Useful for navigating to the correct spot in the song list
    const backToIndex = () => navigate("/songs/index", { state: { songNumber: songToRender.number - 1 } });
    const previousSong = () => navigate(`/song/${songToRender.number - 1}`);
    const nextSong = () => navigate(`/song/${songToRender.number + 1}`);
    
    const togglePresentationMode = () => {
        setPresentationMode(!presentationMode);
        setCurrentSlide(0);
    };

    const nextSlide = () => {
        if (reducedMotion) {
            // No animation for users who prefer reduced motion
            if (currentSlide < presentationSlides.length - 1) {
                setCurrentSlide(currentSlide + 1);
            } else {
                setCurrentSlide(0);
            }
        } else {
            // Animate slide transition for users who don't mind motion
            setSlideTransitioning(true);
            setTimeout(() => {
                if (currentSlide < presentationSlides.length - 1) {
                    setCurrentSlide(currentSlide + 1);
                } else {
                    setCurrentSlide(0);
                }
                setSlideTransitioning(false);
            }, 150);
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
                        style={{ 
                            ...styles,
                            zIndex: 9999,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '2rem',
                            paddingTop: '4rem', // Extra padding to avoid close button
                            paddingBottom: '4rem', // Extra padding for navigation dots
                        }}
                        onClick={nextSlide}
                    >
                        {/* Close button - positioned safely at top right */}
                        <ActionIcon
                            pos="absolute"
                            top={16}
                            right={16}
                            variant="filled"
                            size="lg"
                            color="gray"
                            onClick={(e) => {
                                e.stopPropagation();
                                closePresentationMode();
                            }}
                            style={{ 
                                zIndex: 10000,
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                color: isDark ? 'white' : 'black',
                                backdropFilter: 'blur(8px)',
                                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                            }}
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
                                        maxWidth: '90vw', 
                                        width: '100%',
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text 
                                        size="lg" 
                                        fw={600} 
                                        mb="xl" 
                                        c={isDark ? 'blue.4' : 'blue.6'}
                                        style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)' }}
                                    >
                                        {currentSlideData.label}
                                    </Text>
                                    <Text 
                                        lh={1.4}
                                        style={{ 
                                            whiteSpace: 'pre-line',
                                            wordBreak: 'break-word',
                                            maxHeight: '60vh',
                                            overflow: 'auto',
                                            fontSize: 'clamp(1.2rem, 4vw, 3rem)',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {currentSlideData.content}
                                    </Text>
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
                                    bg={index === currentSlide ? 'blue.5' : (isDark ? 'gray.5' : 'gray.4')}
                                    style={{ 
                                        borderRadius: '50%', 
                                        cursor: 'pointer',
                                        transition: reducedMotion ? 'none' : 'all 0.2s ease'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!reducedMotion) {
                                            setSlideTransitioning(true);
                                            setTimeout(() => {
                                                setCurrentSlide(index);
                                                setSlideTransitioning(false);
                                            }, 150);
                                        } else {
                                            setCurrentSlide(index);
                                        }
                                    }}
                                />
                            ))}
                        </Group>
                    </Box>
                )}
            </Transition>
        );
    }

    return (
        <Container
            className="container"
            size="lg"
            bg={isDark ? 'inherit' : 'gray.1'}
            style={{ boxShadow: isDark ? undefined : 'var(--mantine-shadow-md)' }}
            my="md"
            py="lg"
            px="xl"
        >
            <Helmet>
                <title>{`Hymns for All Times | ${songToRender!.title}`}</title>
            </Helmet>
            <Box className="header" pos="relative" pr="lg">
                <Text fw={600}># {songToRender!.number}</Text>
                <Text size="xl" fw={500}>{songToRender!.title}</Text>
                <Group gap="xs" pos="absolute" top={0} right={0}>
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
                        color={isFavourite ? "red" : "gray"}
                        bg={isFavourite ? (isDark ? 'red.9' : 'red.1') : (isDark ? 'gray.8' : 'gray.1')}
                        size="lg"
                        onClick={() => toggleFavourite(songToRender.number)}
                        aria-label="Add to Favourites"
                        className="faveIcon"
                    >
                        <FaHeart color={isFavourite ? (isDark ? '#ff6b6b' : '#e03131') : (isDark ? '#868e96' : '#495057')} />
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
            </Box>
            <Box className="body">{songBody}</Box>
            {songToRender.author && (
                <Text className="footer" c={isDark ? 'gray.3' : 'gray.7'}>
                    {songToRender.author}
                </Text>
            )}
            <SimpleGrid
                cols={isFirstSong && isLastSong ? 2 : 1}
                mt="lg"
                mb="md"
                spacing="md"
            >
                {isFirstSong && (
                    <Button onClick={previousSong} leftSection={<FaArrowCircleLeft />} flex="1">
                        Previous Song
                    </Button>
                )}
                {isLastSong && (
                    <Button onClick={nextSong} rightSection={<FaArrowCircleRight />} flex="1">
                        Next Song
                    </Button>
                )}
            </SimpleGrid>
            <Button onClick={backToIndex} variant="outline" fullWidth>
                Back to Index
            </Button>
        </Container>
    );
}

export default SongDisplay;
