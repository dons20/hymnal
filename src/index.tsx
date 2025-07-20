// Maintain load order for correct initial loading, modify carefully
import '@mantine/core/styles.css';
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import MainContext from "@/components/Providers";
import { MantineProvider } from "@mantine/core";
import { theme } from "@/theme";
import "focus-visible/dist/focus-visible";
import "./index.scss";

import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
    <MantineProvider theme={theme} defaultColorScheme="auto">
        <BrowserRouter>
            <MainContext>
                <App />
            </MainContext>
        </BrowserRouter>
    </MantineProvider>
);
