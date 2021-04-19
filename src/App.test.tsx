import { Suspense } from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import App from "./App";

jest.mock("__mocks__/createMocks.ts");
it("renders without crashing", () => {
	jest.spyOn(console, "log").mockImplementation(() => {});
	jest.spyOn(console, "warn").mockImplementation(() => {});
	window.scrollTo = jest.fn();
	const { asFragment } = render(
		<MemoryRouter>
			<Suspense fallback="">
				<App />
			</Suspense>
		</MemoryRouter>
	);
	expect(asFragment()).toMatchSnapshot();
});
