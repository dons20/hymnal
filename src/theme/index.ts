import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import type { Dict } from "@chakra-ui/utils";

const config = {
    initialColorMode: "system",
};

export const customTheme = extendTheme({
    config,
    style: {
        global: (props: Dict<unknown>) => ({
            body: {
                color: mode("gray.800", "whiteAlpha.700")(props),
                bg: mode("white", "gray.800")(props),
            },
        }),
    },
});

export default customTheme;
