/**
 * Auth Query Keys
 * TanStack React Query key factory for auth domain
 * Reference: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
 */

export const authQueryKeys = {
  all: ["auth"] as const,
  status: {
    all: ["auth", "status"] as const,
    list: () => [...authQueryKeys.status.all] as const
  },
  token: {
    all: ["auth", "token"] as const,
    refresh: () => [...authQueryKeys.token.all, "refresh"] as const
  }
} as const;
