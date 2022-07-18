// Maintain load order for correct initial loading, modify carefully
import "react-app-polyfill/stable";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { createStandaloneToast } from '@chakra-ui/toast';
import { customTheme } from "theme";

import MainContext from "components/Providers";
import { unregister } from "./serviceWorker";
import "focus-visible/dist/focus-visible";
import "./index.scss";

import App from "./App";

const { ToastContainer, toast } = createStandaloneToast();
const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
	<ChakraProvider resetCSS theme={customTheme}>
		<ColorModeScript initialColorMode={customTheme.config.initialColorMode} />
		<BrowserRouter>
			<MainContext>
				<App />	
			</MainContext>
		</BrowserRouter>
		<ToastContainer />
	</ChakraProvider>
);

toast({ title: 'Chakra UI' });

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
unregister();
