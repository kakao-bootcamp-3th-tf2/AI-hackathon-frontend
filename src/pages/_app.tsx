import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/store/auth/AuthProvider";
import { StoreProvider } from "@/store/StoreProvider";
import PageLayout from "@/components/layouts/PageLayout";
import DesktopLayoutWrapper from "@/components/layouts/DesktopLayoutWrapper";
import { createQueryClient } from "@/shared/api/queryClient";
import { apiInstance } from "@/shared/api/instance";
import { Toaster } from "@/components/ui/sonner";

/**
 * Parse URL fragment for OAuth token
 * Format: #accessToken=<token>&status=<status>
 */
const parseAuthTokenFromFragment = (hash: string) => {
  if (!hash) return null;

  // Remove leading '#'
  const fragmentString = hash.slice(1);
  const params = new URLSearchParams(fragmentString);
  const accessToken = params.get("accessToken");
  const status = params.get("status");

  return accessToken ? { accessToken, status } : null;
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const shouldUseLayout = !router.pathname.startsWith("/auth");

  // Create QueryClient instance
  const queryClient = useMemo(() => createQueryClient(), []);

  /**
   * Handle OAuth callback
   * Extract accessToken from URL fragment and save to localStorage
   * Also set Authorization header for subsequent requests
   * Redirect based on onboarding status (PENDING -> /auth/setup, ACTIVE -> /app)
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const authData = parseAuthTokenFromFragment(window.location.hash);

    if (authData?.accessToken) {
      // Save to localStorage
      localStorage.setItem("accessToken", authData.accessToken);
      if (authData.status) {
        localStorage.setItem("onboardingStatus", authData.status);
      }

      // Set Authorization header immediately
      apiInstance.setAuthorizationHeader(authData.accessToken);

      // Clean up URL fragment - replace with clean URL
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );

      console.log("✓ Access token received and stored");

      // Redirect based on onboarding status
      if (authData.status === "PENDING") {
        router.replace("/auth/setup");
      } else if (authData.status === "ACTIVE") {
        router.replace("/app");
      }
    } else {
      // Try to restore token from localStorage on app load
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        apiInstance.setAuthorizationHeader(storedToken);
        console.log("✓ Access token restored from localStorage");
      }
    }
  }, [router]);

  const content = <Component {...pageProps} />;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          {shouldUseLayout ? (
            <DesktopLayoutWrapper>
              <PageLayout>{content}</PageLayout>
            </DesktopLayoutWrapper>
          ) : (
            content
          )}
        </StoreProvider>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
