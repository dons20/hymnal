// Maintain load order for correct initial loading, modify carefully
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import MainContext from "@/components/Providers";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { theme } from "@/theme";
import "focus-visible/dist/focus-visible";
import "./index.scss";

import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
    <>
        <ColorSchemeScript defaultColorScheme="auto" />
        <MantineProvider theme={theme} defaultColorScheme="auto">
            <ModalsProvider>
                <Notifications />
                <BrowserRouter>
                    <MainContext>
                        <App />
                    </MainContext>
                </BrowserRouter>
            </ModalsProvider>
        </MantineProvider>
    </>
);
