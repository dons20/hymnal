import { Suspense } from "react";
import { render, screen } from "@testing-library/react";
import SongDisplay from "components/Songs/SongDisplay";
import { MemoryRouter } from "react-router-dom";
import { MainContextProvider } from "App";
import { SongsDB } from "data/songs";

type ProviderT = {
	children: React.ReactNode;
	value: any;
};

const Providers = ({ children, value }: ProviderT) => {
	return <MainContextProvider value={value}>{children}</MainContextProvider>;
};

describe("#SongDisplay", () => {
	it("renders the matching song based on the route", () => {
		const songs = SongsDB;
		const favourites: Song[] = [];
		const dispatch = jest.fn();
		const { asFragment } = render(
			<MemoryRouter initialEntries={["/songs/1"]}>
				<Providers value={{ songs, favourites, dispatch }}>
					<Suspense fallback="">
						<SongDisplay />
					</Suspense>
				</Providers>
			</MemoryRouter>
		);
		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByText(songs[0].title)).toBeInTheDocument();
	});
});
