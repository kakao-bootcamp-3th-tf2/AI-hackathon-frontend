/**
 * Auth API Functions
 * Axios-based API calls for authentication
 */

import { apiInstance } from "@/shared/api/instance";
import { AuthTokenResponse, AuthStatusResponse, APIResponse } from "../types";

/**
 * Refresh Access Token using Refresh Token (from HttpOnly cookie)
 * POST /api/auth/token
 */
export const refreshToken = async () => {
  const response = await apiInstance.post<APIResponse<AuthTokenResponse>>(
    "/api/auth/token"
  );
  return response.data.data;
};

/**
 * Get current auth status and user information
 * GET /api/auth/status
 */
export const getAuthStatus = async () => {
  const response = await apiInstance.get<APIResponse<AuthStatusResponse>>(
    "/api/auth/status"
  );
  return response.data.data;
};
