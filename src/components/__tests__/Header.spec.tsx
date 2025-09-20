import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { MantineProvider } from '@mantine/core';
import Header from '@/components/Header';
import { SongsDB } from '@/data/songs';
import { Providers } from '@/helpers/tests';

const songs = SongsDB;
const user = userEvent.setup();

describe('#Header', () => {
  it('renders the title and action icons', async () => {
    render(
      <MantineProvider defaultColorScheme="light">
        <MemoryRouter initialEntries={["/songs/index"]}>
          <Providers value={{ songs }}>
            <Header />
          </Providers>
        </MemoryRouter>
      </MantineProvider>
    );
    const title = await screen.findByText(/Hymns for All Times/);
    expect(title).toBeInTheDocument();

    // Icons present
    expect(await screen.findByTestId('searchTrigger')).toBeInTheDocument();
    expect(await screen.findByTestId('menuTrigger')).toBeInTheDocument();
  });

  it('navigates to search when clicking the search icon', async () => {
    render(
      <MantineProvider defaultColorScheme="light">
        <MemoryRouter initialEntries={["/songs/index"]}>
          <Providers value={{ songs }}>
            <Header />
          </Providers>
        </MemoryRouter>
      </MantineProvider>
    );

    await user.click(await screen.findByTestId('searchTrigger'));
    await waitFor(() => {
      expect(window.location.href).toContain('/search');
    });
  });

  it('opens overlay menu and navigates via links', async () => {
    render(
      <MantineProvider defaultColorScheme="light">
        <MemoryRouter initialEntries={["/songs/index"]}>
          <Providers value={{ songs }}>
            <Header />
          </Providers>
        </MemoryRouter>
      </MantineProvider>
    );

    await user.click(await screen.findByTestId('menuTrigger'));
    expect(await screen.findByTestId('menuOverlay')).toBeInTheDocument();

    // Navigate to Songs
    const songsLink = await screen.findByText('Songs');
    await user.click(songsLink);
    await waitFor(() => {
      expect(window.location.href).toContain('/songs/index');
    });

    // Open again and navigate to Favourites
    await user.click(await screen.findByTestId('menuTrigger'));
    const favesLink = await screen.findByText('Favourites');
    await user.click(favesLink);
    await waitFor(() => {
      expect(window.location.href).toContain('/songs/favourites');
    });
  });
});
