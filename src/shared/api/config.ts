/**
 * API Configuration
 * Base configuration for HTTP client
 */

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
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
