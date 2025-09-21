// Maintain load order for correct initial loading, modify carefully
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import MainContext from '@/components/Providers';
import { theme } from '@/theme';

import 'focus-visible/dist/focus-visible';
import './index.scss';

import App from './App';

// Register PWA service worker
import { registerSW } from 'virtual:pwa-register';

// Register service worker with auto-update
registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
});

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

root.render(
  <HelmetProvider>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <ModalsProvider>
        <Notifications />
        <BrowserRouter>
          <MainContext>
            <App />
          </MainContext>
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  </HelmetProvider>
);
