import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      // Consider data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Don't retry on 4xx errors
      retryOnMount: false,
    },
    mutations: {
      // Retry failed mutations 1 time
      retry: 1,
    },
  },
}); 