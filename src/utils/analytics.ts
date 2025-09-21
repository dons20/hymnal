/**
 * Analytics utilities for managing Umami tracking based on online/offline status
 */

import setDebug from './logger';

// Initialize debug logger
setDebug();
const { debug } = window;

// Extend the Window interface to include umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}

// Store original umami functions to restore later
let originalUmami: typeof window.umami | null = null;
let isAnalyticsDisabled = false;

/**
 * Disables Umami analytics by replacing the umami object with no-op functions
 */
export function disableAnalytics() {
  if (typeof window !== 'undefined' && window.umami && !isAnalyticsDisabled) {
    debug.log('📊 Analytics disabled (offline mode)');
    
    // Store the original umami object
    originalUmami = window.umami;
    
    // Replace with no-op functions
    window.umami = {
      track: () => {
        debug.log('📊 Analytics tracking blocked (offline)');
      }
    };
    
    isAnalyticsDisabled = true;
  }
}

/**
 * Enables Umami analytics by restoring the original umami object
 */
export function enableAnalytics() {
  if (typeof window !== 'undefined' && originalUmami && isAnalyticsDisabled) {
    debug.log('📊 Analytics enabled (online mode)');
    
    // Restore the original umami object
    window.umami = originalUmami;
    originalUmami = null;
    isAnalyticsDisabled = false;
  }
}

/**
 * Manages analytics based on online/offline status
 */
export function manageAnalytics() {
  if (typeof window === 'undefined') return;
  
  if (navigator.onLine) {
    enableAnalytics();
  } else {
    disableAnalytics();
  }
}

/**
 * Sets up listeners for online/offline events to automatically manage analytics
 */
export function setupAnalyticsListeners() {
  if (typeof window === 'undefined') return;
  
  // Handle online/offline events
  window.addEventListener('online', () => {
    debug.log('🌐 Network connection restored');
    enableAnalytics();
  });
  
  window.addEventListener('offline', () => {
    debug.log('🌐 Network connection lost');
    disableAnalytics();
  });
  
  // Initial setup based on current status
  manageAnalytics();
}