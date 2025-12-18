import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from "react";
import { useRouter } from "next/router";
import httpClient, { AuthRedirectFragment } from "@/lib/api/httpClient";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const STORAGE_KEY = "ai-hackathon:isAuthenticated";
const MEMBER_ID_STORAGE_KEY = "memberId";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MEMBER_ID_COOKIE = "ai-hackathon:memberId";

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthState {
  isAuthenticated: boolean;
}

type AuthAction = { type: "SET_AUTHENTICATED"; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload };
    default:
      return state;
  }
};

const getInitialState = (): AuthState => ({
  isAuthenticated: false
});

const syncMemberCookie = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  const memberId = window.localStorage.getItem(MEMBER_ID_STORAGE_KEY);
  if (!memberId) {
    return;
  }
  const expires = new Date();
  expires.setSeconds(expires.getSeconds() + COOKIE_MAX_AGE_SECONDS);
  document.cookie = `${MEMBER_ID_COOKIE}=${encodeURIComponent(memberId)}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
};

const setIsAuthenticatedFlag = (value: boolean) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialState);
  const redirectRef = useRef<AuthRedirectFragment | null>(null);
  const handledRedirectRef = useRef(false);

  if (redirectRef.current === null) {
    redirectRef.current = httpClient.consumeRedirectData();
  }

  useEffect(() => {
    const unsubscribe = httpClient.onAccessTokenChange((token) => {
      dispatch({ type: "SET_AUTHENTICATED", payload: Boolean(token) });
      setIsAuthenticatedFlag(Boolean(token));
      if (token) {
        syncMemberCookie();
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!router.isReady || handledRedirectRef.current) {
      return;
    }

    const redirectData = redirectRef.current;
    if (!redirectData) {
      return;
    }

    handledRedirectRef.current = true;

    if (redirectData.status === "PENDING") {
      if (router.pathname !== "/auth/setup") {
        router.replace("/auth/setup");
      }
      return;
    }

    if (router.pathname !== "/app") {
      router.replace("/app");
    }
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;
    if (state.isAuthenticated && router.pathname === "/auth/login") {
      router.replace("/app");
    }
  }, [router, state.isAuthenticated]);

  const login = useCallback(() => {
    dispatch({ type: "SET_AUTHENTICATED", payload: true });
    setIsAuthenticatedFlag(true);
  }, []);

  const logout = useCallback(() => {
    httpClient.removeAuthorizationHeader();
    setIsAuthenticatedFlag(false);
    router.replace("/auth/login");
  }, [router]);

  const value = useMemo(
    () => ({
      isAuthenticated: state.isAuthenticated,
      login,
      logout
    }),
    [login, logout, state.isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
