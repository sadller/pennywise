'use client';

import { useEffect } from 'react';
import { useStore } from '@/stores/StoreProvider';
import { getAppConstants } from '@/services/utilService';

const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const { util } = useStore();

  useEffect(() => {
    const fetchAppConstants = async () => {
      try {
        const data = await getAppConstants();
        util.setAppConstants(data);
      } catch (error) {
        console.error('Failed to fetch app constants', error);
      }
    };

    fetchAppConstants();
  }, [util]);

  return <>{children}</>;
};

export default AppInitializer;
