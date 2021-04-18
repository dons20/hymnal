import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { MainContextProvider } from "App";
import Header from "components/Header";

type ProviderT = {
	children: React.ReactNode;
	value: any;
};

const Providers = ({ children, value }: ProviderT) => {
	return <MainContextProvider value={value}>{children}</MainContextProvider>;
};

describe("#Header", () => {
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
	it("should allow the user to search", async () => {
		const useCtx = jest.fn();
		render(
			<BrowserRouter>
				<Providers value={useCtx}>
					<Header />
				</Providers>
			</BrowserRouter>
		);
		// @ts-expect-error
		const searchWrapper: HTMLFormElement = await screen.findByRole("search");
		expect(searchWrapper).toBeInTheDocument();

		// @ts-expect-error
		const searchField: HTMLInputElement = within(searchWrapper).getByPlaceholderText("Search songs...");
		fireEvent.change(searchField, { target: { value: "test" } });

		expect(searchField.value).toBe("test");
	});
});
