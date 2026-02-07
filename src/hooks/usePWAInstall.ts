import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Module-level storage so the event is shared across all hook instances
let deferredPromptEvent: BeforeInstallPromptEvent | null = null;
let listenerRegistered = false;
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((cb) => cb());
}

function registerGlobalListener() {
  if (listenerRegistered || typeof window === 'undefined') return;
  listenerRegistered = true;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPromptEvent = e as BeforeInstallPromptEvent;
    notifySubscribers();
  });

  window.addEventListener('appinstalled', () => {
    deferredPromptEvent = null;
    notifySubscribers();
  });
}

export interface UsePWAInstallReturn {
  /** Whether the app is already running as an installed PWA */
  isStandalone: boolean;
  /** Whether a deferred install prompt is available */
  canPromptInstall: boolean;
  /** Whether the app was just installed in this session */
  wasJustInstalled: boolean;
  /** Trigger the native install prompt. Returns outcome. */
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

export const usePWAInstall = (): UsePWAInstallReturn => {
  const [, forceUpdate] = useState(0);
  const [wasJustInstalled, setWasJustInstalled] = useState(false);

  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true ||
      document.referrer.includes('android-app://'));

  useEffect(() => {
    registerGlobalListener();

    const subscriber = () => {
      forceUpdate((n) => n + 1);
    };
    subscribers.add(subscriber);

    // Listen for appinstalled to set wasJustInstalled
    const handleInstalled = () => {
      setWasJustInstalled(true);
    };
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      subscribers.delete(subscriber);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<
    'accepted' | 'dismissed' | 'unavailable'
  > => {
    if (!deferredPromptEvent) return 'unavailable';

    await deferredPromptEvent.prompt();
    const { outcome } = await deferredPromptEvent.userChoice;
    deferredPromptEvent = null;
    notifySubscribers();

    if (outcome === 'accepted') {
      setWasJustInstalled(true);
    }

    return outcome;
  }, []);

  return {
    isStandalone,
    canPromptInstall: deferredPromptEvent !== null,
    wasJustInstalled,
    promptInstall,
  };
};
