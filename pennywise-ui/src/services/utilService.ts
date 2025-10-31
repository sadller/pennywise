import { apiClient } from './apiClient';

interface AppConstants {
  categories: string[];
  payment_modes: string[];
}

export const getAppConstants = async () => {
  const response = await apiClient.get<AppConstants>('/utils/app-constants');
  return {
    categories: response.categories,
    paymentModes: response.payment_modes
  };
};
