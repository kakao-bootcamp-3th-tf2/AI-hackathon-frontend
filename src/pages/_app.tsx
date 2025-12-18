import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { AuthProvider } from "@/store/auth/AuthProvider";
import { StoreProvider } from "@/store/StoreProvider";
import { SuggestNotificationProvider } from "@/store/suggestions/SuggestNotificationProvider";
import PageLayout from "@/components/layouts/PageLayout";
import DesktopLayoutWrapper from "@/components/layouts/DesktopLayoutWrapper";
import { createQueryClient } from "@/shared/api/queryClient";
import { apiInstance } from "@/shared/api/instance";
import { Toaster } from "@/components/ui/sonner";
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const shouldUseLayout = !router.pathname.startsWith("/auth");

  // Create QueryClient instance
  const queryClient = useMemo(() => createQueryClient(), []);
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
      <SuggestNotificationProvider>
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
      </SuggestNotificationProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
