import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

export const renderWithRouter = (
	ui: React.ReactElement<any, string | React.JSXElementConstructor<any>>,
	{ route = "/" } = {}
) => {
	window.history.pushState({}, "Test page", route);

	// @ts-ignore
	return render(ui, { wrapper: BrowserRouter });
};

export default renderWithRouter;
