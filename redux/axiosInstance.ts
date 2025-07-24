import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Determine the appropriate baseURL based on platform
const getBaseUrl = () => {
  // Use environment variable if available
  if (process.env.EXPO_PUBLIC_API_URL) {
    return `${process.env.EXPO_PUBLIC_API_URL}/api`;
  }

  // For Android emulator, localhost refers to the emulator itself, not your machine
  if (Platform.OS === 'android') {
    return 'http://192.168.43.115:3000/api'; // Special IP for Android emulator to reach host
  }

  // For iOS simulator, localhost works but you might want to use your machine's IP
  // when testing on physical devices
  return 'http://192.168.43.115:3000/api';
};

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  withCredentials: true,
  timeout: 100000, // Timeout after 100 seconds
});

// Import the safe store initializer
import initializeStore from './storeInitializer';

// Get a safe store reference
let storeRef: any = initializeStore();
let refreshTokenRequest: Promise<string | null> | null = null; // Prevent multiple refresh calls

// Function to set the store reference
export const setStore = (store: any) => {
  storeRef = store;
};

// Function to refresh the token
const refreshAuthToken = async () => {
  if (!refreshTokenRequest) {
    // Use the same base URL logic for refresh token
    const refreshUrl = `${getBaseUrl().replace('/api', '')}/api/users/refresh-token`;

    refreshTokenRequest = axios
      .get(refreshUrl, { withCredentials: true })
      .then(({ data }) => {
        if (storeRef) {
          // Import these actions dynamically to avoid circular dependencies
          const { setAccessToken } = require('./slices/userSlice');
          storeRef.dispatch(setAccessToken(data.accessToken)); // Update Redux store
        }
        return data.accessToken;
      })
      .catch((error) => {
        if (storeRef) {
          // Import these actions dynamically to avoid circular dependencies
          const { logoutUser } = require('./slices/userSlice');
          storeRef.dispatch(logoutUser()); // Logout user on failure
        }
        return null;
      })
      .finally(() => {
        refreshTokenRequest = null;
      });
  }

  return refreshTokenRequest;
};

// Request Interceptor - Attach Token
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      if (storeRef) {
        const state = storeRef.getState();
        // Add null check for state.user
        const token = state?.user?.accessToken; // Get token from Redux store
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
      // Continue with the request even if there's an error getting the token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Refresh Token on 401
axiosInstance.interceptors.response.use(
  (response) => response.data, // Return data directly
  async (error) => {
    try {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const newToken = await refreshAuthToken();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest); // Retry with new token
        }
      }

      return Promise.reject(error.response ? error.response.data : error.message);
    } catch (interceptorError) {
      console.error('Error in response interceptor:', interceptorError);
      return Promise.reject(error);
    }
  }
);

// ✅ Auto Refresh Token Every 14 Minutes
// We'll use a function that can be called from a component's useEffect
export const startTokenRefreshInterval = () => {
  const intervalId = setInterval(async () => {
    try {
      await refreshAuthToken();
    } catch (error) {
      console.error("Auto-refresh failed:", error);
    }
  }, 14 * 60 * 1000); // Refresh every 14 minutes

  // Return the interval ID so it can be cleared when needed
  return intervalId;
};

// Function to stop the interval
export const stopTokenRefreshInterval = (intervalId: NodeJS.Timeout | null) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};

export default axiosInstance;
