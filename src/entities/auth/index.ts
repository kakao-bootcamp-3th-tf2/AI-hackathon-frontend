/**
 * Auth Entity Exports
 * Public API for auth domain
 */

// Types
export type { AuthTokenResponse, AuthStatusResponse, APIResponse } from "./types";

// Query hooks
export { useAuthStatus, useRefreshToken } from "./api/authQueries";

// Query keys (for manual cache management if needed)
export { authQueryKeys } from "./api/authQueryKeys";

// API functions (for direct use without Query)
export { refreshToken, getAuthStatus } from "./api/authApi";
