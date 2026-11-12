import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

function getDynamicApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).developerLauncherConfig?.host;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:3000/api/v1`;
    }
  }

  return 'https://vitaltron.onrender.com/api/v1';
}

export const API_BASE_URL = getDynamicApiBaseUrl();

const ACCESS_TOKEN_KEY = '@vitaltron/access-token';
const REFRESH_TOKEN_KEY = '@vitaltron/refresh-token';

export async function getStoredAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getStoredRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function setStoredTokens(accessToken: string, refreshToken?: string): Promise<void> {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function clearStoredTokens(): Promise<void> {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getStoredAccessToken();

  // For FormData, let fetch auto-generate the multipart/form-data boundary header!
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (isFormData) {
    delete headers['Content-Type'];
    delete headers['content-type'];
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Automatic Token Refresh on 401 Unauthorized
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      try {
        const refreshToken = await getStoredRefreshToken();
        if (refreshToken) {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.accessToken) {
              await setStoredTokens(refreshData.accessToken, refreshData.refreshToken);

              // Retry original request with fresh access token
              headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
              response = await fetch(url, {
                ...options,
                headers,
              });
            } else {
              // Refresh token failed, force redirect to login/welcome
              await clearStoredTokens();
              try {
                const { router } = require('expo-router');
                router.replace('/welcome');
              } catch (e) {
                // Ignore router error
              }
            }
          } else {
             // Refresh failed (invalid/expired), force redirect to login
             await clearStoredTokens();
             try {
               const { router } = require('expo-router');
               router.replace('/welcome');
             } catch (e) {
               // Ignore router error
             }
          }
        } else {
          // No refresh token available, force redirect to login
          await clearStoredTokens();
          try {
            const { router } = require('expo-router');
            router.replace('/welcome');
          } catch (e) {
            // Ignore router error
          }
        }
      } catch {
        // Network error during refresh or router failed
        await clearStoredTokens();
      }
    }

    const text = await response.text();
    let data: any;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      if (Array.isArray(data.message)) {
        errorMessage = data.message.join('; ');
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error: any) {
    throw new Error(error.message || 'Network request failed. Please check your connection.');
  }
}
