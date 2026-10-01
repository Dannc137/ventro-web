export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
};

export type UpdateProfileRequest = {
  fullName: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};