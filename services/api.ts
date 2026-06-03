import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ─── SERVER CONFIGURATION ─────────────────────────────────
// Set to true to use your local Express backend, or false to use the AWS test server.
const USE_LOCAL_BACKEND = false; 

const AWS_BACKEND_URL = 'http://54.91.119.137:3000/api/v1';

// Dynamic Localhost Resolution (for iOS Simulators, Android Emulators, and Physical Devices)
const getLocalBackendUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api/v1';
  }
  
  // expoConfig?.hostUri is "192.168.x.x:8081" when running Expo Go
  const hostUri = Constants.expoConfig?.hostUri;
  const ip = hostUri ? hostUri.split(':')[0] : null;
  
  if (ip) {
    return `http://${ip}:3000/api/v1`;
  }
  
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';
};

const BASE_URL = USE_LOCAL_BACKEND ? getLocalBackendUrl() : AWS_BACKEND_URL;

console.log(`📡 Connecting API to: ${BASE_URL}`);

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const isAuthRequest = (url = '') => url.includes('/auth/');

const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  const res = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
  const newAccessToken = res.data.data.accessToken;
  const newRefreshToken = res.data.data.refreshToken;

  await AsyncStorage.setItem('accessToken', newAccessToken);
  await AsyncStorage.setItem('refreshToken', newRefreshToken);

  return newAccessToken;
};

// ─── REQUEST INTERCEPTOR ───────────────────────────────────
// Automatically attaches accessToken to every request
api.interceptors.request.use(async (config) => {
  const requestUrl = config.url || '';
  let token = await AsyncStorage.getItem('accessToken');

  if (!token && !isAuthRequest(requestUrl)) {
    try {
      token = await refreshAccessToken();
    } catch {
      await AsyncStorage.clear();
    }
  }

  if (token) {
    config.headers = config.headers || {};
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
    const isAuthEndpoint = isAuthRequest(requestUrl);

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true; // prevent infinite loop

      try {
        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) {
          await AsyncStorage.clear();
          return Promise.reject(error);
        }

        // Retry the original request with new token
        originalRequest.headers = originalRequest.headers || {};
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
