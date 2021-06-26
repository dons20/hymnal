import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { resizeWindow } from "helpers/tests";
import { BottomNav } from "components";

describe("#BottomNav", () => {
	it("should render correctly", () => {
		const { asFragment } = render(
			<BrowserRouter>
				<BottomNav />
			</BrowserRouter>
		);
		const Navbar = screen.getByTestId("bottomNavWrapper");
		const HomeButton = screen.getByTestId("Home");
		const SongsButton = screen.getByTestId("Songs");
		const FavouritesButton = screen.getByTestId("Favourites");

		expect(asFragment()).toMatchSnapshot();
		expect(Navbar).toBeInTheDocument();
		expect(HomeButton).toBeInTheDocument();
		expect(SongsButton).toBeInTheDocument();
		expect(FavouritesButton).toBeInTheDocument();
	});
	it("shows only icons on smaller screens", () => {
		render(
			<BrowserRouter>
				<BottomNav />
			</BrowserRouter>
		);
		resizeWindow(450, 500);
		const HomeButton = screen.getByTestId("Home");
		const SongsButton = screen.getByTestId("Songs");
		const FavouritesButton = screen.getByTestId("Favourites");

		expect(HomeButton.innerText).toBeFalsy();
		expect(SongsButton.innerText).toBeFalsy();
		expect(FavouritesButton.innerText).toBeFalsy();

		resizeWindow(768, 500);
		expect(HomeButton).toHaveTextContent("Home");
		expect(SongsButton).toHaveTextContent("Songs");
		expect(FavouritesButton).toHaveTextContent("Favourites");
	});
	it("navigates to the correct route when each button is clicked", () => {
		render(
			<BrowserRouter>
				<BottomNav />
			</BrowserRouter>
		);
		const HomeButton = screen.getByTestId("Home");
		const SongsButton = screen.getByTestId("Songs");
		const FavouritesButton = screen.getByTestId("Favourites");

		fireEvent.click(FavouritesButton);
		expect(window.location.href).toContain("/songs/favourites");

		fireEvent.click(SongsButton);
		expect(window.location.href).toContain("/songs/index");

		fireEvent.click(HomeButton);
		expect(window.location.href).toContain("/home");
	});
	it("hides when scrolling up and is shown when scrolling down", async () => {
		render(
			<BrowserRouter>
				<div style={{ height: 1400 }}></div>
				<BottomNav />
			</BrowserRouter>
		);
		resizeWindow(500, 1600);
		fireEvent.scroll(window, { target: { scrollY: 500 } });
		const navbar = screen.getByTestId("bottomNavWrapper");
		expect(navbar).toHaveClass("--disabled");

		fireEvent.scroll(window, { target: { scrollY: 300 } });
		waitFor(() => expect(navbar).toHaveClass("--disabled", "--hidden"));
	});
});
