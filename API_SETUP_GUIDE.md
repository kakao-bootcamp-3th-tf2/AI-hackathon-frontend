# API Setup Guide

This guide explains the TanStack Query + Axios API architecture using FSD (Feature Sliced Design) pattern.

## Architecture Overview

```
shared/api/                    # Shared API layer (HTTP client, QueryClient)
├── config.ts                  # API configuration
├── instance.ts                # Axios instance
├── queryClient.ts             # TanStack Query client setup
└── index.ts                   # Public exports

entities/{domain}/             # Domain-specific API layer (Auth, Health, Google Calendar)
├── api/
│   ├── {domain}Api.ts        # Pure API functions
│   ├── {domain}QueryKeys.ts  # TanStack Query keys
│   └── {domain}Queries.ts    # Query/Mutation hooks
├── types.ts                  # Type definitions
└── index.ts                  # Public exports
```

## Key Concepts

### 1. HTTP Client (`shared/api/instance.ts`)

The HTTP client is based on Axios with:
- Automatic baseURL injection from `.env.local` (`NEXT_PUBLIC_API_BASE_URL`)
- HTTP methods: `get`, `post`, `put`, `patch`, `delete`
- Authorization header management
- Request/response interceptors

**Usage:**
```typescript
import { apiInstance } from "@/shared/api";

// Simple GET
const response = await apiInstance.get("/health");

// GET with params
const response = await apiInstance.get("/api/auth/status", {
  params: { limit: 10 }
});

// POST with data
const response = await apiInstance.post("/api/auth/token", {
  refreshToken: "..."
});
```

### 2. Query Keys (`{domain}QueryKeys.ts`)

Query keys follow TanStack Query's recommended structure with a key factory pattern:

**Example - Auth:**
```typescript
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
```

Benefits:
- Type-safe key management
- Easy invalidation and refetching
- Hierarchical cache organization
- Consistent naming convention

### 3. API Functions (`{domain}Api.ts`)

Pure functions that make HTTP requests without any React Query logic:

**Example - Auth API:**
```typescript
export const getAuthStatus = async () => {
  const response = await apiInstance.get<APIResponse<AuthStatusResponse>>(
    "/api/auth/status"
  );
  return response.data.data; // Return only data, not full response
};
```

Guidelines:
- Return only the `data` field, not the full response
- Use generic types for type safety: `<APIResponse<ResponseType>>`
- Keep functions simple and pure
- Handle API response structure (APIResponse wrapper)

### 4. Query/Mutation Hooks (`{domain}Queries.ts`)

React hooks using TanStack Query that wrap API functions:

**Query Example:**
```typescript
export const useAuthStatus = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: authQueryKeys.status.list(),
    queryFn: getAuthStatus,
    enabled: options?.enabled ?? true
  });
};
```

**Mutation Example:**
```typescript
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      // Update cache or other side effects
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.status.list()
      });
    },
    onError: (error) => {
      // Handle error
    }
  });
};
```

### 5. Entity Exports (`entities/{domain}/index.ts`)

Each entity exports its public API:

```typescript
// Types
export type { AuthStatusResponse, AuthTokenResponse } from "./types";

// Hooks (primary usage)
export { useAuthStatus, useRefreshToken } from "./api/authQueries";

// Query keys (for manual cache management)
export { authQueryKeys } from "./api/authQueryKeys";

// API functions (if needed)
export { getAuthStatus, refreshToken } from "./api/authApi";
```

## Usage Examples

### Using Query Hooks in Components

**Fetching Data:**
```typescript
import { useAuthStatus } from "@/entities/auth";

export function UserProfile() {
  const { data: authStatus, isLoading, error } = useAuthStatus();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Welcome, {authStatus?.name}</div>;
}
```

**Conditional Fetching:**
```typescript
const { isAuthenticated } = useAuth();
const { data: authStatus } = useAuthStatus({
  enabled: isAuthenticated
});
```

**With Date Parameters:**
```typescript
import { usePrimaryCalendarEvents } from "@/entities/googleCalendar";

export function CalendarView() {
  const startDate = "2025-12-18T00:00:00Z";
  const endDate = "2025-12-19T00:00:00Z";

  const { data: events, isLoading } = usePrimaryCalendarEvents({
    from: startDate,
    to: endDate,
    enabled: true
  });

  return <>{/* render events */}</>;
}
```

### Using Mutations in Components

**Token Refresh:**
```typescript
import { useRefreshToken } from "@/entities/auth";

export function AuthRefresh() {
  const refreshMutation = useRefreshToken();

  const handleRefresh = () => {
    refreshMutation.mutate(undefined, {
      onSuccess: (data) => {
        console.log("Token refreshed:", data.accessToken);
      }
    });
  };

  return (
    <button onClick={handleRefresh} disabled={refreshMutation.isPending}>
      {refreshMutation.isPending ? "Refreshing..." : "Refresh Token"}
    </button>
  );
}
```

## Adding a New API Endpoint

### Step 1: Create Entity Types
```typescript
// src/entities/myDomain/types.ts
export interface MyResponse {
  id: string;
  name: string;
}

export interface APIResponse<T> {
  code: string;
  message: string;
  data: T;
}
```

### Step 2: Create API Functions
```typescript
// src/entities/myDomain/api/myDomainApi.ts
import { apiInstance } from "@/shared/api";
import { MyResponse, APIResponse } from "../types";

export const fetchMyData = async (id: string) => {
  const response = await apiInstance.get<APIResponse<MyResponse>>(
    `/api/my-domain/${id}`
  );
  return response.data.data;
};
```

### Step 3: Define Query Keys
```typescript
// src/entities/myDomain/api/myDomainQueryKeys.ts
export const myDomainQueryKeys = {
  all: ["myDomain"] as const,
  list: {
    all: ["myDomain", "list"] as const,
    detail: (id: string) =>
      [...myDomainQueryKeys.list.all, id] as const
  }
} as const;
```

### Step 4: Create Query Hooks
```typescript
// src/entities/myDomain/api/myDomainQueries.ts
import { useQuery } from "@tanstack/react-query";
import { myDomainQueryKeys } from "./myDomainQueryKeys";
import { fetchMyData } from "./myDomainApi";

export const useMyData = (id: string) => {
  return useQuery({
    queryKey: myDomainQueryKeys.list.detail(id),
    queryFn: () => fetchMyData(id),
    enabled: !!id
  });
};
```

### Step 5: Export Public API
```typescript
// src/entities/myDomain/index.ts
export type { MyResponse } from "./types";
export { useMyData } from "./api/myDomainQueries";
export { myDomainQueryKeys } from "./api/myDomainQueryKeys";
export { fetchMyData } from "./api/myDomainApi";
```

## Configuration

### Base URL
Set in `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Query Configuration
Modify in `src/shared/api/config.ts`:
```typescript
export const QUERY_CONFIG = {
  staleTime: 1000 * 60 * 5,        // Cache validity
  gcTime: 1000 * 60 * 10,           // Cache collection time
  retry: 1,                          // Retry failed requests
  retryDelay: 1000                  // Delay between retries
} as const;
```

## Best Practices

1. **Keep API functions pure** - No side effects, only data fetching
2. **Use type generics** - Always specify response types: `<APIResponse<T>>`
3. **Return data only** - Extract `response.data.data` in API functions
4. **Organize by domain** - Each business entity gets its own folder
5. **Query key hierarchy** - Use nested structure for related queries
6. **Lazy load queries** - Use `enabled` option to control when queries run
7. **Handle loading/error states** - Always handle these in components
8. **Invalidate strategically** - After mutations, invalidate affected caches

## Debugging Tips

1. **Browser DevTools** - Install React Query DevTools chrome extension
2. **Network Tab** - Monitor actual API requests
3. **Query Keys** - Log query keys to understand cache structure
4. **Stale vs. Fresh** - Adjust `staleTime` to see immediate refetches
5. **Concurrent Requests** - Watch for duplicate requests that can be deduplicated

## Common Patterns

### Dependent Queries
```typescript
const { data: user } = useAuthStatus();
const { data: calendar } = usePrimaryCalendarEvents({
  from: "...",
  to: "...",
  enabled: !!user
});
```

### Infinite Queries (for pagination)
```typescript
export const useInfiniteMyData = () => {
  return useInfiniteQuery({
    queryKey: myDomainQueryKeys.list.all,
    queryFn: ({ pageParam = 1 }) => fetchMyData({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined
  });
};
```

### Optimistic Updates
```typescript
const mutation = useMutation({
  mutationFn: updateMyData,
  onMutate: (newData) => {
    queryClient.setQueryData(
      myDomainQueryKeys.list.all,
      (old) => ({ ...old, ...newData })
    );
  },
  onError: (_, __, context) => {
    // Rollback on error
  }
});
```

## References

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com)
- [FSD Pattern](https://feature-sliced.design)
- [Query Key Factory Pattern](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys#using-the-query-key-factory-pattern)
