# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Development
- `pnpm dev` - Start the Next.js development server (runs on http://localhost:3000)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint on the codebase

### Docker
- `pnpm docker:build` - Build Docker image
- `pnpm docker:run` - Run Docker container

### Package Manager
This project uses **pnpm** (v9.12.2+). Always use `pnpm` instead of `npm` or `yarn`.

## Project Structure & Architecture

### Technology Stack
- **Framework**: Next.js 16 (Pages Router)
- **React**: 19.2.1
- **UI Components**: Shadcn/UI with Tailwind CSS 4
- **State Management**: React Context API (custom hooks)
- **Data Fetching**: TanStack React Query 5 + Axios
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Authentication**: Google OAuth (backend at http://localhost:8080)

### Directory Organization

```
src/
├── pages/              # Next.js page routes
│   ├── app/           # Authenticated app routes
│   ├── auth/          # Authentication routes (login, signup)
│   └── api/           # API routes
├── components/        # React components (organized by layer)
│   ├── ui/            # Shadcn UI primitives
│   ├── shared/        # Shared components across features
│   ├── features/      # Feature-specific components (calendar, benefits, actions)
│   ├── layouts/       # Page layouts
│   └── widgets/       # Standalone components (Header, Footer)
├── store/             # Global state management
│   ├── StoreProvider.tsx    # Main store context (date range, actions, cards, benefits)
│   └── auth/AuthProvider.tsx # Auth context (authentication state)
├── entities/          # Data types and constants
│   ├── action/        # Action entity (types, data, constants)
│   ├── benefit/       # Benefit entity
│   └── card/          # Card entity
├── lib/               # Utilities and helpers
│   ├── api/           # HTTP client configuration
│   ├── utils/         # Helper functions
│   └── mockData.ts    # Mock data for development
├── hooks/             # Custom React hooks (useAuth, useToast, useGoogleLogin)
└── styles/            # Global styles (Tailwind CSS)
```

### Core Architecture Patterns

#### State Management (Store Layer)
The app uses a **custom React Context-based store** (NOT Redux). Key context:

**`StoreProvider`** (`src/store/StoreProvider.tsx`):
- Manages **date range selection** (single date or date range)
- Stores **actions** (user activity records with title, category, description)
- Provides **cards** data (payment cards)
- Provides methods to query actions by date/date range
- Provides **benefits** based on selected date
- Uses `date-fns` for date normalization (startOfDay/endOfDay)

**`AuthProvider`** (`src/store/auth/AuthProvider.tsx`):
- Manages **authentication state** (isAuthenticated boolean)
- Uses **localStorage** for persistence (STORAGE_KEY: "ai-hackathon:isAuthenticated")
- Sets **HTTP-only cookie** (COOKIE_NAME: "ai-hackathon:auth-token") for 30 days
- Exposed via `useAuth()` hook

Access these via:
- `useStore()` - Get store context (throws if used outside provider)
- `useAuth()` - Get auth context (throws if used outside provider)

#### Authentication Flow
1. Both providers are initialized in `_app.tsx` and wrap all pages
2. Auth provider checks localStorage on mount and restores state
3. Google OAuth redirect to backend: `http://localhost:8080/oauth2/authorization/google`
4. Middleware is partially implemented but currently disabled (see `middleware.ts`)
5. Routes starting with `/auth` bypass the PageLayout

#### Routing Structure
- **Protected Routes**: `/app/*` (calendar, actions, benefits)
- **Auth Routes**: `/auth/login`, `/auth/signup`
- **Public**: Root path `/` shows app preview with login prompt when not authenticated
- Pages Router uses file-based routing (not App Router)

### Component Composition Pattern

Components follow a **feature-first** structure:
- **Feature components** (e.g., `CalendarFeature`, `BenefitPanel`) manage their own logic and state
- **UI components** (`/ui` folder) are presentational and don't use context
- **Widgets** are shared UI elements (Header, Footer)
- **Shared components** (`/shared`) are reusable across features

Example feature: Calendar
```
src/components/features/calendar/
├── CalendarFeature.tsx        # Main feature component
├── components/
│   ├── CalendarGrid.tsx       # Grid presentation
│   ├── CalendarHeader.tsx     # Header with nav
│   └── SelectedDateSummary.tsx
└── hooks/
    └── useCalendarNavigation.ts
```

### Data Flow Example (Adding an Action)
1. User clicks "일정 추가하기" button → opens `ActionInputDialog`
2. User fills form and submits
3. `useActionForm()` hook processes form data
4. Calls `store.addAction(payload)` → updates context state
5. Context re-renders components subscribed to `useStore()`
6. Actions appear in calendar grid and action lists

### Important Styling Notes
- **Tailwind CSS 4** with custom theme (see `src/styles/globals.css`)
- Color variables: `--foreground`, `--primary`, `--muted-foreground`, `--border`, `--card`, `--background`
- Animations defined in globals.css: `animate-fade-in`, `animate-slide-in-right`, `animate-float`
- Using `cn()` utility from `/lib/utils/cn.ts` for class merging

### API Integration (TanStack Query + Axios)

The frontend uses **TanStack Query (v5)** with **Axios** following **FSD architecture**:

**Structure:**
```
src/shared/api/                 # Shared HTTP client & QueryClient setup
entities/{domain}/
├── api/
│   ├── {domain}Api.ts         # Pure API functions
│   ├── {domain}QueryKeys.ts   # Query key factory
│   └── {domain}Queries.ts     # Query/Mutation hooks
├── types.ts
└── index.ts
```

**Currently Implemented:**
- `entities/auth/` - Authentication (status check, token refresh)
- `entities/googleCalendar/` - Google Calendar event fetching and creation

**Usage Pattern:**
```typescript
import { useAuthStatus, useRefreshToken } from "@/entities/auth";
import { usePrimaryCalendarEvents, useCreateCalendarEvent } from "@/entities/googleCalendar";

// Use in components
const { data, isLoading, error } = useAuthStatus();
const refreshMutation = useRefreshToken();
const { data: events } = usePrimaryCalendarEvents({ from: "...", to: "..." });
const createEventMutation = useCreateCalendarEvent();
```

**Key Points:**
- HTTP client with automatic baseURL, withCredentials: true for cookies
- Query keys follow TanStack's factory pattern for type safety
- Hooks use `enabled` option for conditional fetching
- API functions return only data, not full response
- All types wrapped in `APIResponse<T>` interface

See `API_SETUP_GUIDE.md` for detailed examples and adding new endpoints.

### Middleware Status
Middleware for route protection is currently **disabled** (commented out in `middleware.ts`). When implemented:
- Protected paths: `/api/actions`, `/api/benefits`, `/api/cards`, `/profile`, `/settings`
- Checks for auth cookie and redirects to home if not authenticated

## Development Workflow

### Adding a New Feature
1. Create component in `src/components/features/{featureName}/`
2. Create types in `src/entities/{entityName}/types.ts` if needed
3. Export from feature's main component
4. Import into appropriate page
5. Use `useStore()` for global state, `useAuth()` for auth state
6. Style with Tailwind classes

### Working with Dates
- Always use **date-fns** functions (imported in store: `startOfDay`, `endOfDay`)
- Date range is normalized: if end < start, they're automatically swapped
- Actions are filtered by comparing dates using day boundaries

### Common Patterns

**Using store in a component:**
```tsx
import { useStore } from "@/store/useStore";

export function MyComponent() {
  const { selectedRange, addAction, getActionsForDate } = useStore();
  // ...
}
```

**Using auth in a component:**
```tsx
import { useAuth } from "@/store/auth/AuthProvider";

export function MyComponent() {
  const { isAuthenticated, login, logout } = useAuth();
  // ...
}
```

**Creating a context hook:**
Follow the pattern used in `AuthProvider` and `StoreProvider`:
1. Create context with `createContext()`
2. Create provider component that provides value via `useContext`
3. Create custom hook that retrieves context and throws if used outside provider
4. Wrap app in _app.tsx

### Debugging Notes
- Local storage key for auth: `ai-hackathon:isAuthenticated`
- Auth cookie name: `ai-hackathon:auth-token`
- Component tree: `AuthProvider` > `StoreProvider` > `PageLayout` > Page components
- Mock data is in `src/entities/{entity}/data.ts` for local development

## Build & Deployment

- **Build Output**: `standalone` mode (optimized for Docker)
- **Dockerfile**: Multi-stage build, runs on port 3000
- **Environment Variables**: Stored in `.env.local` (Google OAuth keys, web push keys)

## Related Files
- ESLint config: `eslint.config.mjs` (Next.js core-web-vitals + TypeScript)
- TypeScript: `tsconfig.json` (ES2017 target, path alias `@/*` for `./src/*`)
- PostCSS: `postcss.config.mjs` (Tailwind CSS 4)
