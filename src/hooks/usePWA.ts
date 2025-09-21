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

  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register service worker and set up analytics
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
    
    // Set up analytics management for offline/online modes
    setupAnalyticsListeners();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOffline: false }));
      notifications.show({
        id: 'online-status',
        title: 'Connection Restored',
        message: 'You are back online!',
        color: 'green',
        autoClose: 3000,
      });
    };

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOffline: true }));
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
      
      setPwaState(prev => ({ 
        ...prev, 
        isInstallable: true, 
        installPrompt: e 
      }));

      // Show our own install notification for desktop users
      // Mobile users will see the native browser prompt
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (!isMobile) {
        // Only prevent default on desktop where we want custom UI
        e.preventDefault();
        
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
      setPwaState(prev => ({ 
        ...prev, 
        isInstallable: false, 
        installPrompt: null 
      }));
      
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

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setServiceWorkerRegistration(registration);

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setPwaState(prev => ({ ...prev, isUpdateAvailable: true }));
              
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

      // eslint-disable-next-line no-console
      console.log('Service Worker registered successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Service Worker registration failed:', error);
    }
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'SW_INSTALLED') {
      // Show caching complete notification
      notifications.show({
        id: 'cache-ready',
        title: 'App Ready for Offline Use!',
        message: event.data.message || 'All content has been cached and is available offline.',
        color: 'green',
        autoClose: 5000,
      });
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
        
        setPwaState(prev => ({ 
          ...prev, 
          isInstallable: false, 
          installPrompt: null 
        }));
        
        // Hide install notification
        notifications.hide('pwa-install');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Install prompt failed:', error);
      }
    }
  };

  const updateApp = () => {
    if (serviceWorkerRegistration) {
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