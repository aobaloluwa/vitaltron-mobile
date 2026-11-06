import {
  apiRequest,
  clearStoredTokens,
  getStoredRefreshToken,
  setStoredTokens,
} from './api';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  emailVerifiedAt?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: User;
  message?: string;
  requiresEmailVerification?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyEmailDto {
  email: string;
  code: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface GoogleSignInDto {
  idToken: string;
}

export async function loginUser(dto: LoginDto): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(dto),
  });

  if (data.accessToken) {
    await setStoredTokens(data.accessToken, data.refreshToken);
  }

  return data;
}

export async function registerUser(dto: RegisterDto): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function verifyEmail(dto: VerifyEmailDto): Promise<{ message?: string; success?: boolean }> {
  return apiRequest('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function resendVerification(dto: ResendVerificationDto): Promise<{ message?: string }> {
  return apiRequest('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function forgotPassword(dto: ForgotPasswordDto): Promise<{ message?: string }> {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function resetPassword(dto: ResetPasswordDto): Promise<{ message?: string }> {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function googleSignIn(dto: GoogleSignInDto): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(dto),
  });

  if (data.accessToken) {
    await setStoredTokens(data.accessToken, data.refreshToken);
  }

  return data;
}

export async function refreshAuthToken(): Promise<AuthResponse> {
  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const data = await apiRequest<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  if (data.accessToken) {
    await setStoredTokens(data.accessToken, data.refreshToken);
  }

  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    const refreshToken = await getStoredRefreshToken();
    if (refreshToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch {
    // Ignore error on logout
  } finally {
    await clearStoredTokens();
  }
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/auth/me', { method: 'GET' });
}
