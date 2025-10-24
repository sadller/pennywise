'use client';

import React from 'react';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const PWAProvider: React.FC = () => {
  const { showPrompt, dismissPrompt, handleInstall } = usePWAInstall();

  return (
    <PWAInstallPrompt
      open={showPrompt}
      onClose={dismissPrompt}
      onInstall={handleInstall}
    />
  );
};

export default PWAProvider;
