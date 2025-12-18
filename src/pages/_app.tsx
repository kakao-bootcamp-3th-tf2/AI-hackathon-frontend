import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AuthProvider } from "@/store/auth/AuthProvider";
import { StoreProvider } from "@/store/StoreProvider";
import PageLayout from "@/components/layouts/PageLayout";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const shouldUseLayout = !router.pathname.startsWith("/auth");

  const content = <Component {...pageProps} />;

  return (
    <AuthProvider>
      <StoreProvider>
        {shouldUseLayout ? <PageLayout>{content}</PageLayout> : content}
      </StoreProvider>
    </AuthProvider>
  );
}
