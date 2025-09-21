import { useState } from 'react';
import {
  FaBars,
  FaDownload,
  FaHeart,
  FaHome,
  FaList,
  FaMoon,
  FaSearch,
  FaSun,
  FaSync,
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
  useMatches,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMainContext } from '@/utils/context';

import './Header.scss';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isClearing, setIsClearing] = useState(false);
  const { pwa } = useMainContext();
  const { isInstallable, installApp } = pwa;

  const useFullscreen = useMatches({
    base: true,
    md: false,
    lg: false,
    xl: false,
  });

  const showHeaderThemeToggle = useMatches({
    base: false,
    sm: false,
    md: true,
    lg: true,
    xl: true,
  });

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [isMenuOpen, { open: openMenu, close: closeMenu }] = useDisclosure(false);

  // Check if we're on the homepage
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  const handleHomeClick = () => navigate('/');

  // Clear and refetch song database
  const clearAndRefetchDatabase = async () => {
    try {
      setIsClearing(true);
      closeMenu();

      const localForage = await import('localforage');
      const songsStore = localForage.default.createInstance({
        name: 'Songs',
        storeName: 'items',
      });
      await songsStore.clear();
      const hashStore = localForage.default.createInstance({
        name: 'Songs',
        storeName: 'hash',
      });
      await hashStore.clear();

      // Clear old version storage if it exists
      const versionStore = localForage.default.createInstance({
        name: 'Songs',
        storeName: 'version',
      });
      await versionStore.clear();

      // Reload the page to refetch data
      window.location.reload();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear database:', error);
      setIsClearing(false);
    }
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
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor:
            colorScheme === 'dark' ? 'var(--mantine-color-gray-8)' : 'var(--mantine-color-gray-1)',
          borderBottom: `1px solid ${colorScheme === 'dark' ? 'var(--mantine-color-gray-7)' : 'var(--mantine-color-gray-3)'}`,
        }}
      >
        <Group style={{ cursor: 'pointer' }} onClick={handleHomeClick}>
          <ActionIcon variant="subtle" size="lg" aria-label="Home">
            <FaHome size={16} />
          </ActionIcon>
          <Title order={3}>Hymns for All Times</Title>
        </Group>

        <Group>
          <ActionIcon
            variant="subtle"
            size="lg"
            aria-label="Go to search"
            data-testid="searchTrigger"
            onClick={() => navigate('/search')}
          >
            <FaSearch size={16} />
          </ActionIcon>

          {showHeaderThemeToggle && (
            <ActionIcon
              variant="subtle"
              size="lg"
              aria-label="Toggle color scheme"
              data-testid="headerThemeToggle"
              onClick={toggleColorScheme}
            >
              {colorScheme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
            </ActionIcon>
          )}

          <ActionIcon
            variant="subtle"
            size="lg"
            aria-label="Open menu"
            data-testid="menuTrigger"
            onClick={openMenu}
          >
            <FaBars size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Full-screen overlay menu */}
      <Modal
        opened={isMenuOpen}
        onClose={closeMenu}
        fullScreen={useFullscreen}
        size="lg"
        centered
        overlayProps={{ opacity: 0.85, blur: 2 }}
        radius="md"
        withCloseButton
        title={
          <Text size="xl" fw={600}>
            Menu
          </Text>
        }
      >
        <Stack gap="xl" py="lg" data-testid="menuOverlay">
          <Box>
            <Stack gap="sm">
              <Text
                size="xl"
                role="link"
                onClick={() => {
                  closeMenu();
                  navigate('/home');
                }}
                className="menu-link"
                tabIndex={0}
              >
                <Group component="span" gap="md" align="center">
                  <FaHome size={18} />
                  <span>Home</span>
                </Group>
              </Text>
              <Text
                size="xl"
                onClick={() => {
                  closeMenu();
                  navigate('/songs/index');
                }}
                className="menu-link"
                role="link"
                tabIndex={0}
              >
                <Group component="span" gap="md" align="center">
                  <FaList size={18} />
                  <span>Songs</span>
                </Group>
              </Text>

              <Text
                size="xl"
                onClick={() => {
                  closeMenu();
                  navigate('/songs/favourites');
                }}
                className="menu-link"
                role="link"
                tabIndex={0}
              >
                <Group component="span" gap="md" align="center">
                  <FaHeart size={18} />
                  <span>Favourites</span>
                </Group>
              </Text>
            </Stack>
          </Box>

          <Box>
            {!showHeaderThemeToggle && (
              <Button
                variant="outline"
                color={colorScheme === 'dark' ? 'white' : 'blue'}
                size="md"
                fullWidth
                onClick={toggleColorScheme}
                aria-label="Toggle color scheme"
                data-testid="themeToggle"
                leftSection={colorScheme === 'dark' ? <FaSun /> : <FaMoon />}
              >
                Enable {colorScheme === 'dark' ? 'Light' : 'Dark'} Mode&nbsp;
              </Button>
            )}

            {isInstallable && (
              <Button
                variant="outline"
                color="green"
                size="md"
                fullWidth
                onClick={() => {
                  installApp();
                  closeMenu();
                }}
                leftSection={<FaDownload />}
                aria-label="Install Hymnal App"
                data-testid="installApp"
                mt={!showHeaderThemeToggle ? 'md' : 0}
              >
                Install App
              </Button>
            )}

            <Button
              variant="outline"
              color="orange"
              size="md"
              fullWidth
              onClick={clearAndRefetchDatabase}
              loading={isClearing}
              leftSection={<FaSync />}
              aria-label="Clear local song cache"
              data-testid="clearDatabase"
              mt="md"
            >
              {isClearing ? 'Clearing...' : 'Clear Song Cache'}
            </Button>
          </Box>
        </Stack>
      </Modal>
    </>
  );
};

export default Header;
