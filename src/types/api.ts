export type ApiError = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fields: Record<string, string> | null;
};

export type UserSummary = {
  id: string;
  fullName: string;
  email: string;
};

export type AuthResponse = {
  accessToken: string;
  expiresIn: number;
  user: UserSummary;
};