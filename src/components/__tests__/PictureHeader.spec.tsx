import React from "react";
import { render, screen } from "@testing-library/react";
import PictureHeader from "components/PictureHeader";
import { MainContextProvider } from "utils/context";
import { BrowserRouter } from "react-router-dom";

type ProviderT = {
	children: React.ReactNode;
	value: any;
};

const Providers = ({ children, value }: ProviderT) => (
	<MainContextProvider value={value}>{children}</MainContextProvider>
);

describe("#PictureHeader", () => {
	it("should render the correct title based on context props", async () => {
		const meta = {
			title: "Test Title",
			subtitle: "Test Subtitle",
		};
		render(
			<BrowserRouter>
				<Providers value={{ meta }}>
					<PictureHeader />
				</Providers>
			</BrowserRouter>
		);
		expect(await screen.findByText(meta.title)).toBeInTheDocument();
		expect(await screen.findByText(meta.subtitle)).toBeInTheDocument();
	});
});
