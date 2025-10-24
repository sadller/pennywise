import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check if running in standalone mode (installed)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check if running in iOS Safari and added to home screen
      const isIOSStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      
      return isStandalone || isIOSStandalone;
    };

    const isInstalled = checkIfInstalled();

    setState(prev => ({
      ...prev,
      isInstalled,
      showPrompt: false, // Disabled automatic popup - users can install manually from profile menu
    }));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState(prev => ({
        ...prev,
        isInstallable: true,
        showPrompt: false, // Disabled automatic popup - users can install manually from profile menu
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
    sessionStorage.setItem('pwa-prompt-shown-this-session', 'true');
    setState(prev => ({
      ...prev,
      showPrompt: false,
    }));
  };

  const handleInstall = () => {
    localStorage.setItem('pwa-install-completed', 'true');
    sessionStorage.setItem('pwa-prompt-shown-this-session', 'true');
    setState(prev => ({
      ...prev,
      showPrompt: false,
    }));
  };

  const triggerInstallPrompt = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        localStorage.setItem('pwa-install-completed', 'true');
        setState(prev => ({
          ...prev,
          isInstalled: true,
        }));
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null);
    } else {
      // Show manual install instructions popup
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
