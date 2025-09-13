import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { /** MemoryRouter, */ BrowserRouter } from "react-router";
import { Providers, resizeWindow } from "@/helpers/tests";
import MainContext from "@/components/Providers";
import Header from "@/components/Header";
import { SongsDB } from "@/data/songs";

const songs = SongsDB;
const user = userEvent.setup();

beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
    }));
});

describe("#Header", () => {
    it("should render correctly", async () => {
        const { asFragment } = render(
            <BrowserRouter>
                <Providers value={{ songs }}>
                    <Header />
                </Providers>
            </BrowserRouter>
        );
        const title = await screen.findByText(/Hymns for All Times/);
        expect(title).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });
    it("should show the search results when typing and hide them when query is erased", async () => {
        render(
            <BrowserRouter>
                <Providers value={{ songs }}>
                    <MainContext>
                        <Header />
                    </MainContext>
                </Providers>
            </BrowserRouter>
        );

        const searchWrapper: HTMLFormElement = await screen.findByRole("search");
        expect(searchWrapper).toBeInTheDocument();

        const searchField: HTMLInputElement = await screen.findByTestId("desktopSearch");
        await user.type(searchField, "test");

        const resultsList = await screen.findByTestId("searchItemsWrapper");

        expect(searchField.value).toBe("test");
        await waitFor(() => expect(resultsList).not.toBeEmptyDOMElement());

        searchField.setSelectionRange(0, 4);
        await user.type(searchField, "{backspace}");

        const searchResultsBox = await screen.findByTestId("searchResultsBox");
        expect(searchResultsBox).toHaveProperty("hidden");
    });
    it("should send the user to a song's page directly when they click a result", async () => {
        render(
            <BrowserRouter>
                <Providers value={{ songs }}>
                    <MainContext>
                        <Header />
                    </MainContext>
                </Providers>
            </BrowserRouter>
        );

        const searchWrapper: HTMLFormElement = await screen.findByRole("search");
        expect(searchWrapper).toBeInTheDocument();

        const searchField: HTMLInputElement = screen.getByTestId("desktopSearch");
        await user.type(searchField, "test");

        const resultsList = screen.getByTestId("searchItemsWrapper");

        // TODO: test something from the child elements
        await waitFor(() => expect(resultsList.childElementCount).toBeGreaterThan(0));
        const result = await screen.findByText("Lovest Thou Me");
        await user.click(result);

        await waitFor(() => {
            expect(window.location.href).toContain("/songs/399");
        });
    });
    it("should navigate to the search results page when a search is submitted", async () => {
        render(
            <BrowserRouter>
                <Providers value={{ songs }}>
                    <Header />
                </Providers>
            </BrowserRouter>
        );

        const searchField = screen.getByTestId("desktopSearch");
        await user.type(searchField, "test");

        await user.type(searchField, "[Enter]");
        await waitFor(() => {
            expect(window.location.href).toContain("/search?query=test");
        });
    });
    it.skip("should toggle night mode when the user clicks the night mode toggle button", async () => {
        // render(
        //     <ChakraProvider>
        //         <ColorModeScript initialColorMode="light" />
        //         <MemoryRouter initialEntries={["/home"]}>
        //             <Providers value={{ songs }}>
        //                 <Header />
        //             </Providers>
        //         </MemoryRouter>
        //     </ChakraProvider>
        // );
        // const colorModeToggle = await screen.findByLabelText("Toggle Color Mode");

        // await waitFor(() => expect(document.body).toHaveClass("chakra-ui-light"));

        // await user.click(colorModeToggle);
        // await waitFor(() => expect(document.body).toHaveClass("chakra-ui-dark"));
    });
    it.skip("should navigate the user home when they click the main logo", async () => {
        // const history = createMemoryHistory();
        // render(
        //     <MemoryRouter>
        //         <Providers value={{ songs }}>
        //             <Header />
        //         </Providers>
        //     </MemoryRouter>
        // );

        // const logo = await screen.findByRole("heading", { name: /Hymns For All Times/i });

        // await user.click(logo);
        // expect(history.location.pathname).toBe("/");
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
                <Providers value={{ songs }}>
                    <Header />
                </Providers>
            </BrowserRouter>
        );

        resizeWindow(450, 1000);
        const mobileMenuToggle = await screen.findByTestId("mobileMenuTrigger");
        await user.click(mobileMenuToggle);

        const searchField = await screen.findByTestId("mobileSearch");
        const searchButton = await screen.findByLabelText("Search Song Database");

        await user.type(searchField, "people");
        await user.click(searchButton);

        await waitFor(() => {
            expect(window.location.href).toContain("/search?query=people");
        });
    });
    it.todo("should navigate the user to the search results page when submitting the mobile search field");
    it.todo("should toggle night mode when the user clicks the mobile toggle button");
});
