/**
 * API Configuration
 * Base configuration for HTTP client
 */

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// 프로덕션 환경에서 환경 변수 누락 시 경고
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_BASE_URL) {
  console.warn(
    "[API_CONFIG] NEXT_PUBLIC_API_BASE_URL is not defined in production. Using default: http://localhost:8080"
  );
}

export const API_CONFIG = {
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
} as const;

export const QUERY_CONFIG = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  retry: 1,
  retryDelay: 1000
} as const;
