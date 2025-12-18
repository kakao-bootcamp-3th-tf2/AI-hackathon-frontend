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
  onboardingStatus: "PENDING" | "ACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface MemberJoinRequest {
  memberId: number;
  telecom: string; // 선택한 요금제 (예: "SKT", "LG U+", "KT")
  payments: string[]; // 카드와 페이 이름 리스트
}

export interface APIResponse<T> {
  code: string;
  message: string;
  data: T;
}
