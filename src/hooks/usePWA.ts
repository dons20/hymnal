import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { setupAnalyticsListeners } from '../utils/analytics';
import setDebug from '../utils/logger';

// Initialize debug logger
setDebug();
const { debug } = window;

interface PWAState {
  isInstallable: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: any;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isOffline: !navigator.onLine,
    isUpdateAvailable: false,
    installPrompt: null,
  });

  const [serviceWorkerRegistration, setServiceWorkerRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  // Register service worker and set up analytics
  useEffect(() => {
    // vite-plugin-pwa handles service worker registration automatically
    // but we still need to set up update detection and messaging
    if ('serviceWorker' in navigator) {
      setupServiceWorkerListeners();
    }

    // Set up analytics management for offline/online modes
    setupAnalyticsListeners();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setPwaState((prev) => ({ ...prev, isOffline: false }));
      
      // Hide offline notification and show online notification
      notifications.hide('offline-status');
      notifications.show({
        id: 'online-status',
        title: 'Connection Restored',
        message: 'You are back online!',
        color: 'green',
        autoClose: 3000,
      });
    };

    const handleOffline = () => {
      setPwaState((prev) => ({ ...prev, isOffline: true }));
      
      // Hide online and other connection-related notifications
      notifications.hide('online-status');
      notifications.hide('cache-ready'); // Don't show both offline and cache-ready at same time
      notifications.show({
        id: 'offline-status',
        title: 'Offline Mode',
        message: 'App will continue to work offline with cached content.',
        color: 'orange',
        autoClose: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Only preventDefault if we want to show our own custom install UI
      // For now, let's allow the native browser prompt to show
      debug.log('PWA: Install prompt available');

      setPwaState((prev) => ({
        ...prev,
        isInstallable: true,
        installPrompt: e,
      }));

      // Show our own install notification for desktop users
      // Mobile users will see the native browser prompt
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (!isMobile) {
        // Only prevent default on desktop where we want custom UI
        e.preventDefault();

        // Hide other install-related notifications
        notifications.hide('pwa-ios-hint');
        notifications.hide('pwa-mobile-hint');
        
        // Show install notification after app is cached (desktop only)
        setTimeout(() => {
          notifications.show({
            id: 'pwa-install',
            title: 'Install App',
            message: 'Install Hymnal for quick access and offline use!',
            color: 'blue',
            autoClose: false,
            withCloseButton: true,
          });
        }, 2000);
      } else if (isIOS) {
        // iOS Safari doesn't support beforeinstallprompt, show instructions
        // Hide other install-related notifications
        notifications.hide('pwa-install');
        notifications.hide('pwa-mobile-hint');
        
        setTimeout(() => {
          notifications.show({
            id: 'pwa-ios-hint',
            title: 'Add to Home Screen',
            message: 'Tap the Share button and select "Add to Home Screen" to install!',
            color: 'blue',
            autoClose: 10000,
            withCloseButton: true,
          });
        }, 3000);
      } else {
        // Android Chrome and other browsers
        // Hide other install-related notifications
        notifications.hide('pwa-install');
        notifications.hide('pwa-ios-hint');
        
        setTimeout(() => {
          notifications.show({
            id: 'pwa-mobile-hint',
            title: 'Add to Home Screen',
            message: 'Look for "Add to Home Screen" or "Install" option in your browser menu!',
            color: 'blue',
            autoClose: 8000,
            withCloseButton: true,
          });
        }, 3000);
      }
    };

    const handleAppInstalled = () => {
      setPwaState((prev) => ({
        ...prev,
        isInstallable: false,
        installPrompt: null,
      }));

      // Hide all install-related notifications
      notifications.hide('pwa-install');
      notifications.hide('pwa-ios-hint');
      notifications.hide('pwa-mobile-hint');

      notifications.show({
        id: 'app-installed',
        title: 'App Installed!',
        message: 'Hymnal has been successfully installed.',
        color: 'green',
        autoClose: 5000,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const setupServiceWorkerListeners = async () => {
    try {
      // Get the registration that vite-plugin-pwa created
      const registration = await navigator.serviceWorker.ready;
      setServiceWorkerRegistration(registration);

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      // Track if this is the initial installation
      const isInitialInstall = !navigator.serviceWorker.controller;

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            // Only show update notification if:
            // 1. The new worker is installed 
            // 2. There's already a controlling service worker (not first install)
            // 3. The page is not being refreshed
            if (newWorker.state === 'installed' && 
                navigator.serviceWorker.controller && 
                !isInitialInstall) {
              
              setPwaState((prev) => ({ ...prev, isUpdateAvailable: true }));

              // Hide install-related notifications when showing update
              notifications.hide('cache-ready');
              notifications.hide('pwa-install');

              notifications.show({
                id: 'app-update',
                title: 'App Update Available',
                message: 'A new version is available. Refresh to update.',
                color: 'blue',
                autoClose: false,
                withCloseButton: true,
              });
            }
          });
        }
      });

      // Also check if there's already an update waiting
      if (registration.waiting && !isInitialInstall) {
        setPwaState((prev) => ({ ...prev, isUpdateAvailable: true }));
        
        // Hide conflicting notifications
        notifications.hide('cache-ready');
        notifications.hide('pwa-install');
        
        notifications.show({
          id: 'app-update',
          title: 'App Update Available',
          message: 'A new version is available. Refresh to update.',
          color: 'blue',
          autoClose: false,
          withCloseButton: true,
        });
      }

      // eslint-disable-next-line no-console
      console.log('Service Worker listeners set up successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Service Worker listener setup failed:', error);
    }
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'SW_INSTALLED') {
      // Only show cache-ready notification if we're online and not showing update notifications
      if (navigator.onLine && !pwaState.isUpdateAvailable) {
        // Hide offline notification if showing cache-ready
        notifications.hide('offline-status');
        
        notifications.show({
          id: 'cache-ready',
          title: 'App Ready for Offline Use!',
          message: event.data.message || 'All content has been cached and is available offline.',
          color: 'green',
          autoClose: 5000,
        });
      }
    }
  };

  const installApp = async () => {
    if (pwaState.installPrompt) {
      try {
        await pwaState.installPrompt.prompt();
        const { outcome } = await pwaState.installPrompt.userChoice;

        if (outcome === 'accepted') {
          // eslint-disable-next-line no-console
          console.log('User accepted the install prompt');
        }

        setPwaState((prev) => ({
          ...prev,
          isInstallable: false,
          installPrompt: null,
        }));

        // Hide all install-related notifications
        notifications.hide('pwa-install');
        notifications.hide('pwa-ios-hint');
        notifications.hide('pwa-mobile-hint');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Install prompt failed:', error);
      }
    }
  };

  const updateApp = () => {
    if (serviceWorkerRegistration) {
      // Hide update notification immediately
      notifications.hide('app-update');
      
      serviceWorkerRegistration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return {
    ...pwaState,
    installApp,
    updateApp,
  };
}
