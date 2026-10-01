import axios, { type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import type { ApiError, AuthResponse } from "@/types/api";

// ---------- the access token, held in memory only ----------

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// ---------- what to do when the session truly ends ----------

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

// ---------- the axios instance ----------

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach the access token to every outgoing request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ---------- refreshing, one request at a time ----------

let refreshPromise: Promise<AuthResponse> | null = null;

export function refreshSession(): Promise<AuthResponse> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = api
    // `keepalive` tells the browser to finish this exact request — including
    // applying the rotated refresh cookie from the response — even if the
    // page navigates away before we get to read the response ourselves.
    // Without it, a reload that interrupts an in-flight rotation strands the
    // browser on the now-revoked cookie, and the next refresh attempt is
    // rejected by the backend's reuse detection.
    .post<AuthResponse>("/auth/refresh", undefined, {
      adapter: "fetch",
      fetchOptions: { keepalive: true },
    })
    .then((res) => {
      setAccessToken(res.data.accessToken);
      return res.data;
    })
    .finally(() => {
      // Let everyone currently awaiting this promise resolve first.
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    });

  return refreshPromise;
}
// ---------- retry once after a 401 ----------

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

function isAuthRequest(config: InternalAxiosRequestConfig): boolean {
  return AUTH_PATHS.some((path) => config.url?.startsWith(path));
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableConfig | undefined;

    const shouldRefresh =
      error.response?.status === 401 &&
      original !== undefined &&
      !original._retried &&
      !isAuthRequest(original);

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    original._retried = true;

    try {
      const session = await refreshSession();
      original.headers.Authorization = `Bearer ${session.accessToken}`;
      return api(original);
    } catch (refreshError) {
      if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
        setAccessToken(null);
        onSessionExpired?.();
      }
      return Promise.reject(refreshError);
    }
  },
);

// ---------- turning errors into messages ----------

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError<ApiError>(error)) {
    if (!error.response) {
      return "Can't reach the server. Check your connection.";
    }
    return error.response.data?.message ?? fallback;
  }
  return fallback;
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.fields ?? {};
  }
  return {};
}

export function isRateLimited(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 429;
}

export function getAccessToken(): string | null {
  return accessToken;
}