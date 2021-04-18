import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { BottomNav } from "components";

describe("#BottomNav", () => {
	it("should render correctly", () => {
		const { asFragment } = render(
			<BrowserRouter>
				<BottomNav />
			</BrowserRouter>
		);
		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("Songs")).toBeInTheDocument();
		expect(screen.getByText("Favourites")).toBeInTheDocument();
	});
});
