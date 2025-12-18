/**
 * Auth Entity Types
 */

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthStatusResponse {
  id: string;
  email: string;
  name: string;
  onboardingStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface APIResponse<T> {
  code: string;
  message: string;
  data: T;
}
