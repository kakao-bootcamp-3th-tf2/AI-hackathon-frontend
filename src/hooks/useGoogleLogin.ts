import { useMemo } from "react";

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
  const endpoint = useMemo(
    () => options.endpoint ?? DEFAULT_GOOGLE_AUTH_URL,
    [options.endpoint]
  );

  return () => {
    if (typeof window === "undefined" || !endpoint) return;
    options.onBeforeRedirect?.(endpoint);
    window.location.assign(endpoint);
  };
};
