import { useState } from "react";
import { Stack, Text, Group, ActionIcon, ScrollArea, UnstyledButton } from "@mantine/core";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router";
import { useMainContext } from "../../../utils/context";
import { updateFavesDB } from "../../../helpers";
import { Helmet } from "@dr.pogodin/react-helmet";
import "./SongList.scss";

interface Song {
    number: number;
    title: string;
    verse: string[];
    chorus: string;
    author?: string;
}

const SongList = () => {
    const navigate = useNavigate();
    const { songs, favourites, setFavourites } = useMainContext();
    const [currentSongs] = useState<Song[]>(songs);

    const handleSongClick = (songNumber: number) => {
        navigate(`/song/${songNumber}`);
    };

    const handleFavoriteToggle = (songNumber: number) => {
        let newFavorites = [...favourites];
        
        if (favourites.includes(songNumber - 1)) {
            newFavorites = favourites.filter(fave => fave !== songNumber - 1);
        } else {
            newFavorites.push(songNumber - 1);
        }
        
        setFavourites(newFavorites);
        updateFavesDB(newFavorites);
    };

    return (
        <>
            <Helmet>
                <title>Song List - Hymnal</title>
                <meta name="description" content="Browse and search through our collection of hymns and spiritual songs." />
            </Helmet>
            
            <ScrollArea h="calc(100vh - 200px)">
                <Stack gap="xs" p="md">
                    {currentSongs.map((song) => (
                        <UnstyledButton
                            key={song.number}
                            onClick={() => handleSongClick(song.number)}
                            style={{ width: '100%' }}
                            className="song-item"
                        >
                            <Group
                                justify="space-between"
                                p="sm"
                                style={{ 
                                    border: "1px solid var(--mantine-color-gray-3)",
                                    borderRadius: "var(--mantine-radius-sm)",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <Text fw={700} size="md">#{song.number} - {song.title}</Text>
                                    {song.author && (
                                        <Text size="sm" c="dimmed">by {song.author}</Text>
                                    )}
                                </div>
                                
                                <ActionIcon
                                    variant={favourites.includes(song.number - 1) ? "filled" : "outline"}
                                    color={favourites.includes(song.number - 1) ? "red" : "gray"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFavoriteToggle(song.number);
                                    }}
                                    style={{ flexShrink: 0 }}
                                >
                                    <FaHeart size={14} />
                                </ActionIcon>
                            </Group>
                        </UnstyledButton>
                    ))}
                </Stack>
            </ScrollArea>
        </>
    );
};

export default SongList;