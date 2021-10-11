import React from "react";
import userEvent, { specialChars } from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { Router, BrowserRouter } from "react-router-dom";
import { ColorModeScript } from "@chakra-ui/system";
import { MainContextProvider } from "utils/context";
import { ChakraProvider } from "@chakra-ui/react";
import { createMemoryHistory } from "history";
import { resizeWindow } from "helpers/tests";
import Header from "components/Header";
import { SongsDB } from "data/songs";

type ProviderT = {
	children: React.ReactNode;
	value: any;
};

const Providers = ({ children, value }: ProviderT) => (
	<MainContextProvider value={value}>{children}</MainContextProvider>
);

describe("#Header", () => {
	let useCtx: Function | null = null;

	beforeEach(() => {
		useCtx = jest.fn();
	});

	it("should render correctly", async () => {
		const { asFragment } = render(
			<BrowserRouter>
				<Providers value="">
					<Header />
				</Providers>
			</BrowserRouter>
		);
		expect(await screen.findByText(/Hymns for All Times/)).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
	it("should show the search results when typing and hide them when query is erased", async () => {
		render(
			<BrowserRouter>
				<Providers value={{ songs: SongsDB }}>
					<Header />
				</Providers>
			</BrowserRouter>
		);

		const searchWrapper: HTMLFormElement = await screen.findByRole("search");
		expect(searchWrapper).toBeInTheDocument();

		const searchField: HTMLInputElement = await screen.findByTestId("desktopSearch");
		await userEvent.type(searchField, "test", { delay: 50 });

		const resultsList = await screen.findByTestId("searchItemsWrapper");

		expect(searchField.value).toBe("test");
		await waitFor(() => expect(resultsList).not.toBeEmptyDOMElement());

		// userEvent.clear(searchField);
		searchField.setSelectionRange(0, 4);
		userEvent.type(searchField, "{backspace}");

		const searchResultsBox = await screen.findByTestId("searchResultsBox");
		expect(searchResultsBox).toHaveProperty("hidden");
	});
	it("should send the user to a song's page directly when they click a result", async () => {
		render(
			<BrowserRouter>
				<Providers value={{ songs: SongsDB }}>
					<Header />
				</Providers>
			</BrowserRouter>
		);

		const searchWrapper: HTMLFormElement = await screen.findByRole("search");
		expect(searchWrapper).toBeInTheDocument();

		const searchField: HTMLInputElement = screen.getByTestId("desktopSearch");
		userEvent.type(searchField, "test");

		const resultsList = screen.getByTestId("searchItemsWrapper");

		await waitFor(() => expect(resultsList.childElementCount).toBeGreaterThan(0));
		const result = await screen.findByText("Lovest Thou Me");
		userEvent.click(result);

		expect(window.location.href).toContain("/songs/399");
	});
	it("should navigate to the search results page when a search is submitted", () => {
		render(
			<BrowserRouter>
				<Providers value={useCtx}>
					<Header />
				</Providers>
			</BrowserRouter>
		);

		const searchField = screen.getByTestId("desktopSearch");
		userEvent.type(searchField, "test");

		userEvent.type(searchField, specialChars.enter);
		expect(window.location.href).toContain("/search?query=test");
	});
	it("should toggle night mode when the user clicks the night mode toggle button", async () => {
		render(
			<ChakraProvider>
				<ColorModeScript initialColorMode="light" />
				<BrowserRouter basename="/home">
					<Providers value={useCtx}>
						<Header />
					</Providers>
				</BrowserRouter>
			</ChakraProvider>
		);
		const colorModeToggle = await screen.findByLabelText("Toggle Color Mode");

		await waitFor(() => expect(document.body).toHaveClass("chakra-ui-light"));

		userEvent.click(colorModeToggle);
		await waitFor(() => expect(document.body).toHaveClass("chakra-ui-dark"));
	});
	it("should navigate the user home when they click the main logo", async () => {
		const history = createMemoryHistory();
		render(
			<Router history={history}>
				<Providers value={useCtx}>
					<Header />
				</Providers>
			</Router>
		);

		const logo = await screen.findByRole("heading", { name: /Hymns For All Times/i });

		userEvent.click(logo);
		expect(history.location.pathname).toBe("/");
	});
	it("should show a modal popup with a search bar and toggle button on smaller screens", async () => {
		window.matchMedia = jest.fn().mockImplementation(query => ({
			matches: query === "(max-width: 550px)",
			media: "",
			onchange: null,
			addListener: jest.fn(),
			removeListener: jest.fn(),
		}));

		render(
			<BrowserRouter>
				<Providers value={useCtx}>
					<Header />
				</Providers>
			</BrowserRouter>
		);

		resizeWindow(450, 1000);
		const mobileMenuToggle = await screen.findByTestId("mobileMenuTrigger");
		userEvent.click(mobileMenuToggle);

		const searchField = await screen.findByTestId("mobileSearch");
		const searchButton = await screen.findByLabelText("Search Song Database");

		userEvent.type(searchField, "people");
		userEvent.click(searchButton);

		expect(window.location.href).toContain("/search?query=people");
		jest.resetAllMocks();
	});
	it.todo("should navigate the user to the search results page when submitting the mobile search field");
	it.todo("should toggle night mode when the user clicks the mobile toggle button");
});
