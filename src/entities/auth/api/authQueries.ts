/**
 * Auth Queries and Mutations
 * TanStack React Query hooks for auth domain
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions
} from "@tanstack/react-query";
import { authQueryKeys } from "./authQueryKeys";
import { refreshToken, getAuthStatus, joinMember } from "./authApi";
import { AuthTokenResponse, AuthStatusResponse, MemberJoinRequest } from "../types";

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
 * @param mutationOptions - Optional mutation options including onSuccess, onError callbacks
 */
export const useRefreshToken = (
  mutationOptions?: Partial<UseMutationOptions<AuthTokenResponse, Error, void>>
) => {
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
        localStorage.setItem("accessToken", data.accessToken);
      }
    },
    onError: () => {
      // Clear auth state on failure
      queryClient.removeQueries({
        queryKey: authQueryKeys.status.list()
      });
    },
    ...mutationOptions
  });
};

/**
 * useJoinMember - Complete member onboarding
 * Mutation for: POST /api/members/join
 * @param mutationOptions - Optional mutation options including onSuccess, onError callbacks
 */
export const useJoinMember = (
  mutationOptions?: Partial<UseMutationOptions<void, Error, MemberJoinRequest>>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinMember,
    onSuccess: () => {
      // Invalidate auth status to reflect ACTIVE status
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.status.list()
      });
    },
    ...mutationOptions
  });
};
