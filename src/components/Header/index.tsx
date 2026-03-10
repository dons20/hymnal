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
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useMainContext } from '@/utils/context';

import './Header.scss';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isClearing, setIsClearing] = useState(false);
  const { pwa } = useMainContext();
  const { isInstallable, installApp } = pwa;
  const isMobile = useMediaQuery('(max-width: 768px)');

  const useFullscreen = useMatches({
    base: true,
    md: false,
    lg: false,
    xl: false,
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
        wrap="nowrap"
        px={{ base: 'sm', sm: 'md' }}
        py="md"
        className="page-header"
        pos="sticky"
        top={0}
        gap="xs"
        style={{
          zIndex: 100,
          backgroundColor:
            colorScheme === 'dark' ? 'var(--mantine-color-gray-8)' : 'var(--mantine-color-gray-1)',
          borderBottom: `1px solid ${colorScheme === 'dark' ? 'var(--mantine-color-gray-7)' : 'var(--mantine-color-gray-3)'}`,
        }}
      >
        <Group gap={isMobile ? 0 : 'xs'} wrap="nowrap" style={{ cursor: 'pointer' }} onClick={handleHomeClick}>
          <ActionIcon variant="subtle" size="lg" aria-label="Home">
            <FaHome size={16} />
          </ActionIcon>
          <Title order={3}>Hymns for All Times</Title>
        </Group>

        <Group gap={0} style={{ flexShrink: 0 }}>
          <ActionIcon
            variant="subtle"
            size="lg"
            aria-label="Go to search"
            data-testid="searchTrigger"
            onClick={() => navigate('/search')}
          >
            <FaSearch size={16} />
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            size="lg"
            aria-label="Toggle color scheme"
            data-testid="headerThemeToggle"
            onClick={toggleColorScheme}
          >
            {colorScheme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
          </ActionIcon>

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
        classNames={{
          content: 'menu-modal-content',
          header: 'menu-modal-header',
          title: 'menu-modal-title',
          body: 'menu-modal-body',
          close: 'menu-modal-close',
        }}
        title={
          <Text size="xl" fw={700}>
            Menu
          </Text>
        }
      >
        <Stack gap="xl" py="lg" data-testid="menuOverlay">
          <Box>
            <Stack gap="sm">
              <Button
                variant="subtle"
                color="blue"
                size="md"
                fullWidth
                justify="flex-start"
                onClick={() => {
                  closeMenu();
                  navigate('/home');
                }}
                className="menu-link"
                data-active={location.pathname === '/home' || location.pathname === '/'}
                leftSection={<FaHome size={18} />}
              >
                Home
              </Button>
              <Button
                variant="subtle"
                color="blue"
                size="md"
                fullWidth
                justify="flex-start"
                onClick={() => {
                  closeMenu();
                  navigate('/songs/index');
                }}
                className="menu-link"
                data-active={location.pathname.startsWith('/songs/index')}
                leftSection={<FaList size={18} />}
              >
                Songs
              </Button>

              <Button
                variant="subtle"
                color="blue"
                size="md"
                fullWidth
                justify="flex-start"
                onClick={() => {
                  closeMenu();
                  navigate('/songs/favourites');
                }}
                className="menu-link"
                data-active={location.pathname.startsWith('/songs/favourites')}
                leftSection={<FaHeart size={18} />}
              >
                Favourites
              </Button>
            </Stack>
          </Box>

          <Box className="menu-actions">
            {isInstallable && (
              <Button
                variant="filled"
                color="blue"
                size="md"
                fullWidth
                onClick={() => {
                  installApp();
                  closeMenu();
                }}
                leftSection={<FaDownload />}
                aria-label="Install Hymnal App"
                data-testid="installApp"
                className="menu-action menu-action-primary"
              >
                Install App
              </Button>
            )}

            <Button
              variant="subtle"
              color="blue"
              size="md"
              fullWidth
              onClick={clearAndRefetchDatabase}
              loading={isClearing}
              leftSection={<FaSync />}
              aria-label="Clear local song cache"
              data-testid="clearDatabase"
              className="menu-action menu-action-secondary"
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
