import { render, screen } from "@testing-library/react";
import { Link, MemoryRouter } from "react-router-dom";
import { createMemoryHistory } from "history";
import { Button } from "components";
import { BrowserRouter } from "react-router-dom";

describe("#Button", () => {
	it("should render the provided children", () => {
		const child = <p>This is a sample child</p>;
		render(<Button data-testId="button">{child}</Button>);
		expect(screen.getByTestId("button").firstChild).toBe(child);
	});
	it("should render an anchor element when 'Link' is passed to the 'as' prop", () => {
		render(
			<Button as={Link} to="/another-page" data-testId="button">
				Sample Button Text
			</Button>,
			{ wrapper: BrowserRouter }
		);

		const button = screen.getByTestId("button");
		expect(button.nodeName).toBe("a");
		expect(button.getAttribute("href")).toBe("/another-page");
	});
});
