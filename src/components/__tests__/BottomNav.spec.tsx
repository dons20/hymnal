import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { resizeWindow } from "helpers/tests";
import * as rdd from "react-device-detect";
import { BottomNav } from "components";

// @ts-expect-error
rdd.isMobile = true;

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

		userEvent.click(FavouritesButton);
		expect(window.location.href).toContain("/songs/favourites");

		userEvent.click(SongsButton);
		expect(window.location.href).toContain("/songs/index");

		userEvent.click(HomeButton);
		expect(window.location.href).toContain("/home");
	});
	it("hides when scrolling up and shows when scrolling down", async () => {
		render(
			<BrowserRouter>
				<div style={{ height: 1400 }} />
				<BottomNav />
			</BrowserRouter>
		);
		fireEvent.scroll(window, { target: { scrollY: 500 } });
		const navbar = await screen.findByTestId("bottomNavWrapper");
		await waitFor(() => expect(navbar).toHaveClass("--disabled"));

		fireEvent.scroll(window, { target: { scrollY: 300 } });
		await waitFor(() => expect(navbar).toHaveClass("--disabled", "--hidden"));
	});
});
