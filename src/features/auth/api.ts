import { api, setAccessToken } from "@/lib/api-client"
import type { AuthResponse, UserSummary } from "@/types/api"
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "./types"

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", body)
  setAccessToken(data.accessToken)
  return data
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", body)
  setAccessToken(data.accessToken)
  return data
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout")
  } finally {
    setAccessToken(null)
  }
}

export async function fetchMe(): Promise<UserSummary> {
  const { data } = await api.get<UserSummary>("/users/me")
  return data
}

export async function forgotPassword(
  body: ForgotPasswordRequest
): Promise<void> {
  await api.post("/auth/forgot-password", body)
}

export async function resetPassword(body: ResetPasswordRequest): Promise<void> {
  await api.post("/auth/reset-password", body)
}

export async function verifyEmail(token: string): Promise<void> {
  await api.post("/auth/verify-email", { token })
}

export async function resendVerification(): Promise<void> {
  await api.post("/users/me/resend-verification")
}
