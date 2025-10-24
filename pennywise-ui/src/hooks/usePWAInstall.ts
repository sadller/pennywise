import { useState, useEffect } from 'react';

interface PWAInstallState {
  showPrompt: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const usePWAInstall = () => {
  const [state, setState] = useState<PWAInstallState>({
    showPrompt: false,
    isInstallable: false,
    isInstalled: false,
  });

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check if running in standalone mode (installed)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check if running in iOS Safari and added to home screen
      const isIOSStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      
      return isStandalone || isIOSStandalone;
    };

    // Check if user has already dismissed the prompt
    const hasUserDismissed = () => {
      return localStorage.getItem('pwa-install-dismissed') === 'true';
    };

    // Check if user has already installed the app
    const hasUserInstalled = () => {
      return localStorage.getItem('pwa-install-completed') === 'true';
    };

    const isInstalled = checkIfInstalled();
    const userDismissed = hasUserDismissed();
    const userInstalled = hasUserInstalled();

    setState(prev => ({
      ...prev,
      isInstalled,
      showPrompt: !isInstalled && !userDismissed && !userInstalled,
    }));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        isInstallable: true,
        showPrompt: !isInstalled && !userDismissed && !userInstalled,
      }));
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      localStorage.setItem('pwa-install-completed', 'true');
      setState(prev => ({
        ...prev,
        isInstalled: true,
        showPrompt: false,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismissPrompt = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setState(prev => ({
      ...prev,
      showPrompt: false,
    }));
  };

  const handleInstall = () => {
    localStorage.setItem('pwa-install-completed', 'true');
    setState(prev => ({
      ...prev,
      showPrompt: false,
    }));
  };

  const triggerInstallPrompt = () => {
    if (state.isInstallable) {
      // Trigger the native install prompt
      const event = new CustomEvent('beforeinstallprompt');
      window.dispatchEvent(event);
    } else {
      // Show manual install instructions
      setState(prev => ({
        ...prev,
        showPrompt: true,
      }));
    }
  };

  return {
    ...state,
    dismissPrompt,
    handleInstall,
    triggerInstallPrompt,
  };
};
