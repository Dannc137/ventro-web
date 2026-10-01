import { api, setAccessToken } from "@/lib/api-client"
import type { AuthResponse, UserSummary } from "@/types/api"
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
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

export async function verifyCode(code: string): Promise<void> {
  await api.post("/auth/verify-code", { code });
}

export async function resendCode(): Promise<void> {
  await api.post("/auth/resend-code");
}

export async function resendVerification(): Promise<void> {
  await api.post("/users/me/resend-verification")
}

export async function updateProfile(
  body: UpdateProfileRequest,
): Promise<UserSummary> {
  const { data } = await api.patch<UserSummary>("/users/me", body);
  return data;
}

export async function changePassword(
  body: ChangePasswordRequest,
): Promise<void> {
  await api.post("/users/me/change-password", body);
}
