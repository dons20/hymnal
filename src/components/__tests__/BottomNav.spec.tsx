import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router';
import { BottomNav } from '@/components';
import { MantineProvider } from '@mantine/core';
import { resizeWindow } from '@/helpers/tests';

// Object.defineProperty(rdd, "isMobile", {
//     value: true,
//     writable: true,
// });
const user = userEvent.setup();

beforeEach(() => {
  // matchMedia mock is provided in vitest.setup.mjs globally, keep here if tests override
});

describe('#BottomNav', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <MantineProvider defaultColorScheme="light">
        <MemoryRouter>
          <BottomNav />
        </MemoryRouter>
      </MantineProvider>
    );
    const Navbar = screen.getByTestId('bottomNavWrapper');
    const HomeButton = screen.getByTestId('Home');
    const SongsButton = screen.getByTestId('Songs');
    const FavouritesButton = screen.getByTestId('Favourites');

    expect(asFragment()).toMatchSnapshot();
    expect(Navbar).toBeInTheDocument();
    expect(HomeButton).toBeInTheDocument();
    expect(SongsButton).toBeInTheDocument();
    expect(FavouritesButton).toBeInTheDocument();
  });
  it('shows only icons on smaller screens', () => {
    render(
      <MantineProvider defaultColorScheme="light">
        <MemoryRouter>
          <BottomNav />
        </MemoryRouter>
      </MantineProvider>
    );
    resizeWindow(450, 500);
    const HomeButton = screen.getByTestId('Home');
    const SongsButton = screen.getByTestId('Songs');
    const FavouritesButton = screen.getByTestId('Favourites');

    expect(HomeButton.innerText).toBeFalsy();
    expect(SongsButton.innerText).toBeFalsy();
    expect(FavouritesButton.innerText).toBeFalsy();

    resizeWindow(768, 500);
    expect(HomeButton).toHaveTextContent('Home');
    expect(SongsButton).toHaveTextContent('Songs');
    expect(FavouritesButton).toHaveTextContent('Favourites');
  });
  it('navigates to the correct route when each button is clicked', async () => {
    render(
      <MantineProvider defaultColorScheme="light">
        <BrowserRouter>
          <BottomNav />
        </BrowserRouter>
      </MantineProvider>
    );
    const HomeButton = screen.getByTestId('Home');
    const SongsButton = screen.getByTestId('Songs');
    const FavouritesButton = screen.getByTestId('Favourites');

    await user.click(FavouritesButton);
    expect(window.location.href).toContain('/songs/favourites');

    await user.click(SongsButton);
    expect(window.location.href).toContain('/songs/index');

    await user.click(HomeButton);
    expect(window.location.href).toContain('/home');
  });
  it.skip('hides when scrolling up and shows when scrolling down', async () => {
    render(
      <MemoryRouter>
        <div style={{ height: 1400 }} />
        <BottomNav />
      </MemoryRouter>
    );
    fireEvent.scroll(window, { target: { scrollY: 500 } });
    const navbar = await screen.findByTestId('bottomNavWrapper');
    await waitFor(() => expect(navbar).toHaveClass('--disabled'));

    fireEvent.scroll(window, { target: { scrollY: 300 } });
    await waitFor(() => expect(navbar).toHaveClass('--disabled', '--hidden'));
  });
});
