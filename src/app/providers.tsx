import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth";
import { queryClient } from "./query-client";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast: "cn-toast rounded-xl border shadow-md",
                success: "bg-success-tint text-success-strong border-success/30",
                error: "bg-destructive-tint text-destructive-strong border-destructive/30",
                warning: "bg-warning-tint text-warning-strong border-warning/30",
                info: "bg-primary-tint text-primary-strong border-primary/30",
              },
            }}
          />
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}