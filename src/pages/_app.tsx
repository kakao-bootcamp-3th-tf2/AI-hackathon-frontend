import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { AuthProvider } from "@/store/auth/AuthProvider";
import { StoreProvider } from "@/store/StoreProvider";
import PageLayout from "@/components/layouts/PageLayout";
import DesktopLayoutWrapper from "@/components/layouts/DesktopLayoutWrapper";
import { createQueryClient } from "@/shared/api/queryClient";
import { apiInstance } from "@/shared/api/instance";
import { Toaster } from "@/components/ui/sonner";

/**
 * Parse URL fragment for OAuth token
 * Format: #accessToken=<token>&status=<status>&memberId=<memberId>
 */
const parseAuthTokenFromFragment = (hash: string) => {
  if (!hash) return null;

  // Remove leading '#'
  const fragmentString = hash.slice(1);
  const params = new URLSearchParams(fragmentString);
  const accessToken = params.get("accessToken");
  const status = params.get("status");
  const memberId = params.get("memberId");

  return accessToken ? { accessToken, status, memberId } : null;
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
      if (authData.memberId) {
        localStorage.setItem("memberId", authData.memberId);

        // Save memberId to cookie for middleware access
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + 60 * 60 * 24 * 30); // 30 days
        document.cookie = `ai-hackathon:memberId=${encodeURIComponent(authData.memberId)}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
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

  /**
   * Handle root path navigation based on auth state
   * - If accessToken exists: redirect / to /app
   * - If no accessToken: redirect / to /auth/login
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only handle root path navigation
    if (router.pathname === "/") {
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        // Authenticated - redirect to app
        console.log("✓ Authenticated user - redirecting to /app");
        router.replace("/app");
      } else {
        // Not authenticated - redirect to login
        console.log("✗ Not authenticated - redirecting to /auth/login");
        router.replace("/auth/login");
      }
    }
  }, [router.pathname, router]);

  /**
   * Setup API Response Interceptor
   * Handle 401 errors by clearing auth data and redirecting to login
   */
  useEffect(() => {
    apiInstance.useResponseInterceptor(
      (response) => response,
      (error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log("✗ Access token expired or invalid");

          // Clear all auth data
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("onboardingStatus");
            localStorage.removeItem("memberId");
            localStorage.removeItem("ai-hackathon:isAuthenticated");

            // Clear auth cookies
            document.cookie =
              "ai-hackathon:auth-token=; path=/; max-age=0; SameSite=Strict";
            document.cookie =
              "ai-hackathon:memberId=; path=/; max-age=0; SameSite=Strict";
          }

          // Remove Authorization header
          apiInstance.removeAuthorizationHeader();

          // Redirect to login page
          router.replace("/auth/login");
        }
        return Promise.reject(error);
      }
    );
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
