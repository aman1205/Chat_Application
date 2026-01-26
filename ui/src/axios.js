import axios from 'axios';
import { WS_URL } from './constant';

/**
 * Axios instance with interceptors for authentication and error handling
 */
const api = axios.create({
  baseURL: WS_URL,
  timeout: 30000, // 30 second timeout
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Request interceptor
 * - Adds Authorization header with access token
 * - Logs requests in development mode
 */
api.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
    const accessToken = localStorage.getItem('accessToken');

    // Add Authorization header if token exists
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * - Handles common HTTP errors
 * - Auto-logout on 401 errors
 * - Logs responses in development mode
 */
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response.status);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Response Error]', error.response?.status, error.message);
    }

    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear authentication data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Redirect to login page (using window.location to handle cases outside React context)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?session=expired';
      }

      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('[API] Forbidden access');
    }

    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        console.warn(`[API] Rate limited. Retry after ${retryAfter} seconds`);
      }
    }

    // Handle 5xx Server Errors with retry logic
    if (error.response?.status >= 500 && error.response?.status < 600) {
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0;
      }

      if (originalRequest._retryCount < 2) {
        originalRequest._retryCount += 1;
        const delay = 1000 * Math.pow(2, originalRequest._retryCount - 1); // Exponential backoff: 1s, 2s

        console.warn(`[API] Server error. Retrying in ${delay}ms... (attempt ${originalRequest._retryCount}/2)`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('[API] Network error - check your internet connection');
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Request timeout');
    }

    return Promise.reject(error);
  }
);

export default api; 