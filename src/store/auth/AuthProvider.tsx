import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const STORAGE_KEY = "ai-hackathon:isAuthenticated";
const COOKIE_NAME = "ai-hackathon:auth-token";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const AuthContext = createContext<AuthContextValue | null>(null);

const setCookie = (value: string) => {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setSeconds(expires.getSeconds() + COOKIE_MAX_AGE_SECONDS);
  document.cookie = `${COOKIE_NAME}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
};

const clearCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (storedValue === "true") {
      const handle = window.setTimeout(() => {
        setIsAuthenticated(true);
      }, 0);

      return () => {
        window.clearTimeout(handle);
      };
    }
  }, []);

  const login = useCallback(() => {
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
      setCookie("true");
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      clearCookie();
    }
  }, []);

  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
