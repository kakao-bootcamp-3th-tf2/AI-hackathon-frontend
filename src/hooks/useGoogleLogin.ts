import { useCallback, useMemo } from "react";
import { useAuth } from "@/store/auth/AuthProvider";

const DEFAULT_GOOGLE_AUTH_URL = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL;

export interface UseGoogleLoginOptions {
  /**
   * OAuth authorization endpoint that should be hit when login starts.
   */
  endpoint?: string;
  /**
   * Optional hook to run right before the browser navigates away.
   */
  onBeforeRedirect?: (endpoint: string) => void;
}

export const useGoogleLogin = (options: UseGoogleLoginOptions = {}) => {
  const { apiBaseUrl, setApiBaseUrl } = useAuth();
  const endpoint = useMemo(
    () => options.endpoint ?? DEFAULT_GOOGLE_AUTH_URL,
    [options.endpoint]
  );

  return (baseUrl?: string) => {
    const normalizedBaseUrl = (baseUrl?.trim() ?? apiBaseUrl ?? "").trim();
    if (normalizedBaseUrl) {
      setApiBaseUrl(normalizedBaseUrl);
    }

    if (typeof window === "undefined") return;
    options.onBeforeRedirect?.(endpoint);
    window.location.assign(endpoint);
  };
};
