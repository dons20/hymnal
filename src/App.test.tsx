import { Suspense } from 'react';
import { screen, waitFor } from '@testing-library/react';
import localforage from 'localforage';
import { vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { SongsDB } from '@/data/songs';
import { Providers, resizeWindow } from '@/helpers/tests';
import { renderWithRouter } from '@/utils/tests';
import App from './App';

vi.mock('@/__mocks__/createMocks.ts');

beforeAll(async () => {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  vi.spyOn(console, 'log').mockImplementation(() => {});

  Object.defineProperty(window, 'screen', {
    value: {
      orientation: {
        addEventListener,
        removeEventListener,
      },
    },
    writable: true,
  });
  // jsdom stub
  // @ts-ignore
  window.scrollTo = vi.fn();
});

afterEach(() => {
  localforage.clear();
});

describe('#App', () => {
  it('renders without crashing', async () => {
    const songs = SongsDB;
    const favourites: Song[] = [];
    const spyConfig = vi.spyOn(localforage, 'config');
    const spyCreateInstance = vi.spyOn(localforage, 'createInstance');
    await waitFor(() => {
      expect(spyConfig).toBeTruthy();
    });
    await waitFor(() => {
      expect(spyCreateInstance).toBeTruthy();
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { asFragment } = renderWithRouter(
      <MantineProvider defaultColorScheme="light">
        <Suspense fallback="">
          <Providers value={{ favourites, songs }}>
            <App />
          </Providers>
        </Suspense>
      </MantineProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});

describe('#AppTest', () => {
  it.skip('handles device rotations', async () => {
    const spyConfig = vi.spyOn(localforage, 'config');
    const spyCreateInstance = vi.spyOn(localforage, 'createInstance');
    // vi.spyOn(window, "addEventListener").mockImplementation(() => {});

    await waitFor(() => {
      expect(spyConfig).toBeTruthy();
    });
    await waitFor(() => {
      expect(spyCreateInstance).toBeTruthy();
    });

    renderWithRouter(
      <MantineProvider defaultColorScheme="light">
        <Suspense fallback="">
          <App />
        </Suspense>
      </MantineProvider>,
      { route: '/home' }
    );

    // expect(window.addEventListener).toHaveBeenCalledWith(< String, typeof Function, typeof {} > "");
    resizeWindow(500, 800);
    const container = screen.getByTestId('homeWrapper');
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });
});
