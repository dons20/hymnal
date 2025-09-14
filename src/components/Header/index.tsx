import { useState } from "react";
import { 
    Group, 
    TextInput, 
    ActionIcon, 
    Title, 
    useMantineColorScheme,
    Modal,
    Stack,
    Portal,
    Paper,
    Text,
    UnstyledButton,
    CloseButton,
    Box,
    SimpleGrid
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { FaSearch, FaSun, FaMoon, FaHome, FaBars } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router";
import { useDebouncedCallback } from "use-debounce";
import { useMainContext } from "../../utils/context";
import Fuse, { FuseResult } from "fuse.js";
import "./Header.scss";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { songs } = useMainContext();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [isDropdownOpen, { open: openDropdown, close: closeDropdown }] = useDisclosure(false);
    const [isMobileModalOpen, { open: openMobileModal, close: closeMobileModal }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 550px)');
    
    // Check if we're on the homepage
    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    
    const fuse = new Fuse(songs, { keys: ["number", "title"], minMatchCharLength: 2, threshold: 0.4 });
    const [query, setQuery] = useState("");
    const [mobileQuery, setMobileQuery] = useState("");
    const [queryResults, setQueryResults] = useState<FuseResult<Song>[]>([]);

    const handleHomeClick = () => navigate("/");

    const handleSearch = useDebouncedCallback((value: string) => {
        if (value.length === 0) {
            closeDropdown();
            return;
        }
        const result = fuse.search(value, { limit: 6 });
        setQueryResults(result.slice(0, 6));
        if (result.length > 0) {
            openDropdown();
        }
    }, 500);

    const searchQueryChange = (value: string) => {
        setQuery(value);
        handleSearch(value);
    };

    const mobileSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        setMobileQuery(searchValue);
    };

    const searchSongs = (_?: React.FormEvent, mobile?: boolean) => {
        const shouldSearchMobile = mobile && mobileQuery.length > 0;
        const shouldSearchDesktop = !mobile && query.length > 0;
        if (shouldSearchMobile || shouldSearchDesktop) {
            closeDropdown();
            closeMobileModal();
            setQuery("");
            setMobileQuery("");
            setQueryResults([]);
            navigate(`/search?query=${shouldSearchMobile ? mobileQuery : query}`);
        }
    };

    const submitQuery = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (query.length > 0) {
            searchSongs();
        }
    };

    const submitMobileQuery = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (mobileQuery.length > 0) {
            searchSongs(e, true);
        }
    };

    const gotoSong = (songNumber: number) => {
        closeDropdown();
        setQuery("");
        navigate(`/song/${songNumber}`);
    };

    // Don't render the header on homepage
    if (isHomePage) {
        return null;
    }

    return (
        <>
            <Group 
                justify="space-between" 
                p="md" 
                className="page-header"
                style={{ 
                    position: "sticky", 
                    top: 0, 
                    zIndex: 100, 
                    backgroundColor: colorScheme === 'dark' ? 'var(--mantine-color-gray-8)' : 'var(--mantine-color-gray-1)',
                    borderBottom: `1px solid ${colorScheme === 'dark' ? 'var(--mantine-color-gray-7)' : 'var(--mantine-color-gray-3)'}`
                }}
            >
                <Group style={{ cursor: 'pointer' }} onClick={handleHomeClick}>
                    <ActionIcon 
                        variant="subtle" 
                        size="lg" 
                        aria-label="Home"
                    >
                        <FaHome size={16} />
                    </ActionIcon>
                    <Title order={3}>Hymns for All Times</Title>
                </Group>

                {isMobile ? (
                    <ActionIcon
                        variant="subtle"
                        size="lg"
                        onClick={openMobileModal}
                        aria-label="Open mobile menu"
                        data-testid="mobileMenuTrigger"
                    >
                        <FaBars size={16} />
                    </ActionIcon>
                ) : (
                    <Group>
                        <Box style={{ position: 'relative' }}>
                            <form onSubmit={submitQuery}>
                                <TextInput
                                    placeholder="Search songs..."
                                    value={query}
                                    onChange={(e) => searchQueryChange(e.currentTarget.value)}
                                    rightSection={
                                        <ActionIcon
                                            type="submit"
                                            variant="filled"
                                            color="blue"
                                            aria-label="Search Song Database"
                                            onClick={() => searchSongs()}
                                        >
                                            <FaSearch size={14} />
                                        </ActionIcon>
                                    }
                                    style={{ minWidth: 300 }}
                                    data-testid="desktopSearch"
                                />
                            </form>

                            {/* Search Results Dropdown */}
                            {isDropdownOpen && !isMobile && (
                                <Portal>
                                    <Paper
                                        shadow="md"
                                        p="md"
                                        style={{
                                            position: 'absolute',
                                            top: '60px',
                                            right: '65px',
                                            width: 350,
                                            zIndex: 105,
                                        }}
                                        data-testid="searchResultsBox"
                                    >
                                        <CloseButton
                                            onClick={closeDropdown}
                                            style={{ position: 'absolute', top: 8, right: 8 }}
                                        />
                                        <Stack gap="xs" mt="lg" data-testid="searchItemsWrapper">
                                            {queryResults.map((result) => (
                                                <UnstyledButton
                                                    key={result.item.number}
                                                    onClick={() => gotoSong(result.item.number)}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: 'var(--mantine-radius-sm)',
                                                        backgroundColor: 'var(--mantine-color-blue-6)',
                                                        color: 'white',
                                                        width: '100%'
                                                    }}
                                                    role="button"
                                                >
                                                    <SimpleGrid cols={2} style={{ textAlign: 'left' }}>
                                                        <Text size="sm" fw={600}>
                                                            #{result.item.number}
                                                        </Text>
                                                        <Text size="sm" fw={600}>
                                                            {result.item.title}
                                                        </Text>
                                                    </SimpleGrid>
                                                </UnstyledButton>
                                            ))}
                                        </Stack>
                                    </Paper>
                                </Portal>
                            )}
                        </Box>
                        
                        <ActionIcon
                            variant="subtle"
                            size="lg"
                            onClick={toggleColorScheme}
                            aria-label="Toggle color scheme"
                        >
                            {colorScheme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
                        </ActionIcon>
                    </Group>
                )}
            </Group>

            {/* Mobile Modal */}
            <Modal
                opened={isMobileModalOpen}
                onClose={closeMobileModal}
                title="Menu"
                centered
            >
                <Stack gap="lg">
                    <form onSubmit={submitMobileQuery}>
                        <TextInput
                            placeholder="Search songs..."
                            value={mobileQuery}
                            onChange={mobileSearchQueryChange}
                            rightSection={
                                <ActionIcon
                                    type="submit"
                                    variant="filled"
                                    color="blue"
                                    aria-label="Search Song Database"
                                    onClick={(e) => searchSongs(e, true)}
                                >
                                    <FaSearch size={14} />
                                </ActionIcon>
                            }
                            data-testid="mobileSearch"
                        />
                    </form>

                    <UnstyledButton
                        onClick={toggleColorScheme}
                        style={{
                            padding: '12px',
                            borderRadius: 'var(--mantine-radius-sm)',
                            backgroundColor: 'var(--mantine-color-blue-6)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {colorScheme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
                        <Text>Toggle {colorScheme === 'light' ? 'Dark' : 'Light'} Mode</Text>
                    </UnstyledButton>
                </Stack>
            </Modal>
        </>
    );
};

export default Header;