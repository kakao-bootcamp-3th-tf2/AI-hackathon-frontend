import { useCallback } from "react";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const useToast = () => {
  const toast = useCallback((options: ToastOptions) => {
    console.info(`[toast:${options.variant ?? "default"}] ${options.title}`, options.description);
  }, []);

  return { toast };
};
