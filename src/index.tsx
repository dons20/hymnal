// Maintain load order for correct initial loading, modify carefully
import "react-app-polyfill/stable";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { unregister } from "./serviceWorker";

import "focus-visible/dist/focus-visible";
import "./index.css";

import { customTheme } from "theme";
import App from "./App";

const rootElement = document.getElementById("root");

if (rootElement?.hasChildNodes()) {
	render(
		<ChakraProvider resetCSS theme={customTheme}>
			<ColorModeScript initialColorMode={customTheme.config.initialColorMode} />
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</ChakraProvider>,
		rootElement
	);
} else {
	render(
		<ChakraProvider resetCSS theme={customTheme}>
			<ColorModeScript initialColorMode={customTheme.config.initialColorMode} />
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</ChakraProvider>,
		rootElement
	);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
unregister();
