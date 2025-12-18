/**
 * Query Client Configuration
 * TanStack React Query client setup
 */

import { QueryClient } from "@tanstack/react-query";
import { QUERY_CONFIG } from "./config";

/**
 * Create and configure QueryClient instance
 * Used in QueryClientProvider wrapper in _app.tsx
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_CONFIG.staleTime,
        gcTime: QUERY_CONFIG.gcTime,
        retry: QUERY_CONFIG.retry,
        retryDelay: QUERY_CONFIG.retryDelay,
        refetchOnWindowFocus: false
      },
      mutations: {
        retry: 1,
        retryDelay: 1000
      }
    }
  });
};

// Singleton instance
let queryClientInstance: QueryClient | null = null;

export const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always create a new instance
    return createQueryClient();
  }

  // Browser: reuse single instance
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient();
  }

  return queryClientInstance;
};
