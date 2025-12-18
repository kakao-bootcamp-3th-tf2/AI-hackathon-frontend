/**
 * Auth Queries and Mutations
 * TanStack React Query hooks for auth domain
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authQueryKeys } from "./authQueryKeys";
import { refreshToken, getAuthStatus } from "./authApi";
import { AuthTokenResponse, AuthStatusResponse } from "../types";

/**
 * useAuthStatus - Fetch current user authentication status
 * Query for: GET /api/auth/status
 */
export const useAuthStatus = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: authQueryKeys.status.list(),
    queryFn: getAuthStatus,
    enabled: options?.enabled ?? true
  });
};

/**
 * useRefreshToken - Refresh access token using refresh token
 * Mutation for: POST /api/auth/token
 */
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (data: AuthTokenResponse) => {
      // Update auth status cache after successful token refresh
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.status.list()
      });

      // Store token if needed
      if (data.accessToken) {
        // Optionally store in localStorage or pass to httpClient
        localStorage.setItem("accessToken", data.accessToken);
      }
    },
    onError: (error) => {
      // Clear auth state on failure
      queryClient.removeQueries({
        queryKey: authQueryKeys.status.list()
      });
    }
  });
};
