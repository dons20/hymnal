import { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import SongList from '@/components/Songs/SongList';
import { SongsDB } from '@/data/songs';
import { MainContextProvider, type CTX } from '@/utils/context';

type ProviderT = {
  children: React.ReactNode;
  value: unknown;
};

const Providers = ({ children, value }: ProviderT) => {
  return <MainContextProvider value={value as CTX}>{children}</MainContextProvider>;
};

describe('#SongList', () => {
  it.skip('renders a list of songs', async () => {
    const songs = SongsDB;
    const favourites: Song[] = [];
    const dispatch = jest.fn();
    render(
      <MemoryRouter>
        <Providers value={{ songs, favourites, dispatch }}>
          <Suspense fallback="">
            <SongList />
          </Suspense>
        </Providers>
      </MemoryRouter>
    );
    const title = await screen.findByText(songs[0].title);
    screen.debug(title, 20000);
    expect(title).toBeInTheDocument();
  });
});
