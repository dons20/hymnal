import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const config = {
	initialColorMode: "light",
	useSystemColorMode: true,
};

export const customTheme = extendTheme({
	config,
	style: {
		global: props => ({
			body: {
				color: mode("gray.800", "whiteAlpha.700")(props),
				bg: mode("white", "gray.800")(props),
			},
		}),
	},
});

export default customTheme;
