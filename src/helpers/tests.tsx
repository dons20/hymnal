import { act } from "react-dom/test-utils";

export const resizeWindow = (x: number, y: number) => {
	// @ts-ignore
	window.innerWidth = x;
	// @ts-ignore
	window.innerHeight = y;
	act(() => {
		window.dispatchEvent(new Event("resize"));
	});
};
