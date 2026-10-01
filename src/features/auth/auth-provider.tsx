import { useCallback, useEffect, useMemo, useState, useRef, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { refreshSession, setSessionExpiredHandler } from "@/lib/api-client";
import type { UserSummary } from "@/types/api";
import { AuthContext, type AuthStatus } from "./auth-context";
import * as authApi from "./api";
import type { LoginRequest, RegisterRequest } from "./types";
import * as Sentry from "@sentry/react";
import { disconnectRealtime } from "@/lib/realtime";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserSummary | null>(null);

  const clearSession = useCallback(() => {
    setUser(null);
    setStatus("anonymous");
    queryClient.clear();
    Sentry.setUser(null);
    disconnectRealtime();
  }, [queryClient]);

  // Let the API client tell us when the session truly ends
  useEffect(() => {
    setSessionExpiredHandler(clearSession);
    return () => setSessionExpiredHandler(null);
  }, [clearSession]);

     const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    refreshSession()
      .then((session) => {
        setUser(session.user);
        setStatus("authenticated");
        Sentry.setUser({ id: session.user.id });
      })
      .catch(() => {
        setStatus("anonymous");
        Sentry.setUser(null);
      });
  }, []);

  const login = useCallback(async (body: LoginRequest) => {
    const session = await authApi.login(body);
    setUser(session.user);
    setStatus("authenticated");
    Sentry.setUser({ id: session.user.id });
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    const session = await authApi.register(body);
    setUser(session.user);
    setStatus("authenticated");
    Sentry.setUser({ id: session.user.id });
  }, []);

    const refreshUser = useCallback(async () => {
    try {
      const fresh = await authApi.fetchMe();
      setUser(fresh);
    } catch {
      // Not critical — the next page load picks it up.
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      window.location.replace("/login");
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ status, user, login, register, logout, refreshUser }),
    [status, user, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}