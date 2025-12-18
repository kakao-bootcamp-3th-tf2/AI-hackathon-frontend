import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/store/auth/AuthProvider";
import { StoreProvider } from "@/store/StoreProvider";
import PageLayout from "@/components/layouts/PageLayout";
import { createQueryClient } from "@/shared/api/queryClient";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const shouldUseLayout = !router.pathname.startsWith("/auth");

  // Create QueryClient instance
  const queryClient = useMemo(() => createQueryClient(), []);

  const content = <Component {...pageProps} />;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          {shouldUseLayout ? <PageLayout>{content}</PageLayout> : content}
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
