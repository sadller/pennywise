import { useStore } from '@/stores/StoreProvider';

export const useNavigationLoading = () => {
  const { ui } = useStore();

  const startNavigation = () => {
    ui.setNavigating(true);
  };

  return { startNavigation };
};
