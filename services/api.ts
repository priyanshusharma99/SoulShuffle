import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// backend base URL
const BASE_URL = 'http://10.7.4.133:3000/api/v1';
// Note: Use your actual local IP (like 192.168.1.5) if running on a physical device, not localhost

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── REQUEST INTERCEPTOR ───────────────────────────────────
// Automatically attaches accessToken to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────
// If token expired (401), silently refresh and retry
// BUT skip refresh logic for auth endpoints (login, signup, etc.)
api.interceptors.response.use(
  (response) => response, // success — just return it
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // Don't attempt token refresh for auth endpoints — these 401s are real auth failures
    const isAuthEndpoint = requestUrl.includes('/auth/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true; // prevent infinite loop

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token — user must log in
          await AsyncStorage.clear();
          return Promise.reject(error);
        }

        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });

        const newAccessToken = res.data.data.accessToken;
        const newRefreshToken = res.data.data.refreshToken;

        // Save new tokens
        await AsyncStorage.setItem('accessToken', newAccessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh also failed → user must log in again
        await AsyncStorage.clear();
        // TODO: Navigate to Login screen here
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;