import { useCallback, useEffect, useRef, useState } from "react";
import { FixedSizeGrid } from "react-window";
import { useNavigate, useLocation } from "react-router";
import { Box, Container, SimpleGrid, TextInput, ActionIcon, useMantineColorScheme, Text, UnstyledButton } from "@mantine/core";
import AutoSizer from "react-virtualized-auto-sizer";
import { useDebouncedCallback } from "use-debounce";
import { useMainContext } from "../../utils/context";
import Fuse, { FuseResult } from "fuse.js";
import { FaSearch } from "react-icons/fa";
import { useQuery } from "../../helpers";
import { Helmet } from "react-helmet";
import "./Search.scss";

const meta = {
    title: "Search",
    page: "Search",
};

function Search() {
    const navigate = useNavigate();
    const location = useLocation();
    const { songs, dispatch } = useMainContext();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const routerQuery = useQuery(location.search);
    const extractedQuery = routerQuery.get("query");
    const fuse = new Fuse(songs, { keys: ["number", "title"], minMatchCharLength: 1, threshold: 0.4 });
    const [searchQuery, setSearchQuery] = useState(extractedQuery || "");
    const [searchResults, setSearchResults] = useState<FuseResult<Song>[]>(fuse.search(extractedQuery || searchQuery));
    const wrapperRef = useRef<HTMLDivElement>(null);

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

    /** Triggers navigation to a song at a specified index */
    const navigateToSong = useCallback(
        (songNumber: number) => {
            navigate(`/song/${songNumber}`);
        },
        [navigate]
    );

    useEffect(() => {
        dispatch({ type: "setTitle", payload: meta.title });
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
            <Box pt="lg" h="100vh" bg={isDark ? 'gray.8' : 'gray.2'}>
                <Container style={{ textAlign: 'center' }} mb="lg">
                    <form onSubmit={submitQuery}>
                        <TextInput
                            size="lg"
                            placeholder="Search hymns and songs..."
                            value={searchQuery}
                            onChange={(e) => searchQueryChange(e.currentTarget.value)}
                            rightSection={
                                <ActionIcon
                                    type="submit"
                                    variant="filled"
                                    color="blue"
                                    aria-label="Search"
                                >
                                    <FaSearch />
                                </ActionIcon>
                            }
                            style={{ maxWidth: '600px', width: '90%' }}
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
                    ref={wrapperRef} 
                    style={{ 
                        height: 'calc(100vh - 200px)', 
                        overflow: 'hidden'
                    }}
                >
                    {searchResults.length > 0 ? (
                        <AutoSizer>
                            {({ height, width }) => (
                                <FixedSizeGrid
                                    height={height}
                                    width={width}
                                    rowHeight={120}
                                    columnWidth={Math.min(width - 40, 800)}
                                    columnCount={1}
                                    rowCount={searchResults.length}
                                    itemData={searchResults}
                                    style={{ overflowX: "hidden" }}
                                >
                                    {({ rowIndex, style, data }) => {
                                        const result = data[rowIndex];
                                        if (!result) {
                                            return null;
                                        }

                                        return (
                                            <div style={{...style, padding: '8px 20px'}}>
                                                <UnstyledButton
                                                    onClick={() => navigateToSong(result.item.number)}
                                                    style={{ width: '100%' }}
                                                    className="search-result-item"
                                                >
                                                    <Box
                                                        p="md"
                                                        style={{
                                                            border: "1px solid var(--mantine-color-gray-3)",
                                                            borderRadius: "var(--mantine-radius-md)",
                                                            backgroundColor: isDark ? 'var(--mantine-color-gray-7)' : 'white',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            maxWidth: '800px',
                                                            margin: '0 auto'
                                                        }}
                                                    >
                                                        <SimpleGrid cols={2} style={{ alignItems: 'center' }}>
                                                            <Text fw={700} size="lg">#{result.item.number}</Text>
                                                            <Text fw={600} size="md">{result.item.title}</Text>
                                                        </SimpleGrid>
                                                        {result.item.author && (
                                                            <Text size="sm" c="dimmed" mt="xs">
                                                                by {result.item.author}
                                                            </Text>
                                                        )}
                                                    </Box>
                                                </UnstyledButton>
                                            </div>
                                        );
                                    }}
                                </FixedSizeGrid>
                            )}
                        </AutoSizer>
                    ) : searchQuery.length > 0 ? (
                        <Container>
                            <Text ta="center" c="dimmed" mt="xl">
                                No results found for "{searchQuery}"
                            </Text>
                        </Container>
                    ) : (
                        <Container>
                            <Text ta="center" c="dimmed" mt="xl">
                                Enter a search term to find hymns and songs
                            </Text>
                        </Container>
                    )}
                </Box>
            </Box>
        </>
    );
}

export default Search;