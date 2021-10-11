// jest.mock("localforage");
import { Suspense } from "react";
import { screen, waitFor } from "@testing-library/react";
import { renderWithRouter } from "utils/tests";
import { resizeWindow } from "helpers/tests";
import localforage from "localforage";
import App from "./App";

jest.mock("__mocks__/createMocks.ts");

beforeAll(async () => {
	const addEventListener = jest.fn();
	const removeEventListener = jest.fn();
	jest.spyOn(console, "log").mockImplementation(() => {});

	// @ts-ignore
	window.screen.orientation = { addEventListener, removeEventListener };
	window.scrollTo = jest.fn();
});

afterEach(() => {
	localforage.clear();
});

describe("#App", () => {
	it("renders without crashing", async () => {
		const spyConfig = jest.spyOn(localforage, "config");
		const spyCreateInstance = jest.spyOn(localforage, "createInstance");
		await waitFor(() => {
			expect(spyConfig).toBeTruthy();
			expect(spyCreateInstance).toBeTruthy();
		});
		jest.spyOn(console, "warn").mockImplementation(() => {});
		const { asFragment } = renderWithRouter(
			<Suspense fallback="">
				<App />
			</Suspense>
		);

		await waitFor(() => {
			expect(asFragment()).toMatchSnapshot();
		});
	});
});

describe("#AppTest", () => {
	it.skip("handles device rotations", async () => {
		const spyConfig = jest.spyOn(localforage, "config");
		const spyCreateInstance = jest.spyOn(localforage, "createInstance");
		// jest.spyOn(window, "addEventListener").mockImplementation(() => {});

		await waitFor(async () => {
			expect(spyConfig).toBeTruthy();
			expect(spyCreateInstance).toBeTruthy();
		});

		renderWithRouter(
			<Suspense fallback="">
				<App />
			</Suspense>,
			{ route: "/home" }
		);

		// expect(window.addEventListener).toHaveBeenCalledWith(< String, typeof Function, typeof {} > "");
		resizeWindow(500, 800);
		const container = screen.getByTestId("homeWrapper");
		await waitFor(() => {
			expect(container).toBeInTheDocument();
		});
	});
});
