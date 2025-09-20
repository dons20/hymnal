import { FaBars, FaHome, FaMoon, FaSearch, FaSun } from 'react-icons/fa';
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

import './Header.scss';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const useFullscreen = useMatches({
    base: true,
    lg: false,
    xl: false,
  });

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [isMenuOpen, { open: openMenu, close: closeMenu }] = useDisclosure(false);

  // Check if we're on the homepage
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  const handleHomeClick = () => navigate('/');

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

        {/* Right-side actions: search + menu */}
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
        title={<Title fw={600}>Menu</Title>}
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
                Home
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
                Songs
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
                Favourites
              </Text>
            </Stack>
          </Box>

          <Box>
            <Button
              variant="outline"
              color={colorScheme === 'dark' ? 'white' : 'blue'}
              size="xl"
              fullWidth
              onClick={toggleColorScheme}
              aria-label="Toggle color scheme"
              data-testid="themeToggle"
            >
              Enable {colorScheme === 'dark' ? 'Light' : 'Dark'} Mode&nbsp;
              {colorScheme === 'dark' ? <FaSun /> : <FaMoon />}
            </Button>
          </Box>
        </Stack>
      </Modal>
    </>
  );
};

export default Header;
