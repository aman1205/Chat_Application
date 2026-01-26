/**
 * Error handling utilities for API and application errors
 * Provides consistent error message extraction and formatting
 */

/**
 * Extract error message from various error types
 * @param {Error|Object} error - Error object from API or application
 * @returns {string} - User-friendly error message
 */
export const extractErrorMessage = (error) => {
  // Network error (no response from server)
  if (error.message === 'Network Error') {
    return 'Unable to connect to server. Please check your internet connection.';
  }

  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  // Server responded with error
  if (error.response) {
    const { status, data } = error.response;

    // Handle different status codes
    switch (status) {
      case 400:
        // Validation error - try to extract field-specific errors
        if (data.errors && Array.isArray(data.errors)) {
          return data.errors.map(err => err.message).join(', ');
        }
        return data.message || 'Invalid request. Please check your input.';

      case 401:
        return 'Your session has expired. Please log in again.';

      case 403:
        return 'You do not have permission to perform this action.';

      case 404:
        return data.message || 'The requested resource was not found.';

      case 409:
        return data.message || 'This resource already exists.';

      case 429:
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter) {
          return `Too many requests. Please try again in ${retryAfter} seconds.`;
        }
        return data.message || 'Too many requests. Please slow down and try again later.';

      case 500:
        return 'A server error occurred. Please try again later.';

      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again in a few moments.';

      default:
        return data.message || `An error occurred (${status}). Please try again.`;
    }
  }

  // Request was made but no response received
  if (error.request) {
    return 'No response from server. Please check your connection and try again.';
  }

  // Something else happened
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Handle authentication errors
 * @param {Error} error - Error object
 * @param {Function} navigate - React Router navigate function
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} logoutAction - Logout action creator
 */
export const handleAuthError = (error, navigate, dispatch, logoutAction) => {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    // Clear tokens and user data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Dispatch logout action
    if (dispatch && logoutAction) {
      dispatch(logoutAction());
    }

    // Navigate to login
    if (navigate) {
      navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
    }

    return true;
  }
  return false;
};

/**
 * Format validation errors from server
 * @param {Array|Object} errors - Validation errors from server
 * @returns {Object} - Formatted errors keyed by field name
 */
export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    // Convert array of errors to object keyed by field
    return errors.reduce((acc, error) => {
      if (error.field) {
        acc[error.field] = error.message;
      }
      return acc;
    }, {});
  }

  if (typeof errors === 'object' && errors !== null) {
    // Already in object format
    return errors;
  }

  return {};
};

/**
 * Check if error is a rate limit error
 * @param {Error} error - Error object
 * @returns {boolean}
 */
export const isRateLimitError = (error) => {
  return error.response && error.response.status === 429;
};

/**
 * Get retry-after time from rate limit error
 * @param {Error} error - Error object
 * @returns {number|null} - Seconds to wait, or null if not available
 */
export const getRetryAfterTime = (error) => {
  if (!isRateLimitError(error)) {
    return null;
  }

  const retryAfter = error.response.headers['retry-after'];
  if (retryAfter) {
    return parseInt(retryAfter, 10);
  }

  // Extract from error response body
  if (error.response.data && error.response.data.retryAfter) {
    return Math.ceil(error.response.data.retryAfter - Date.now() / 1000);
  }

  return null;
};

/**
 * Log error to console (development only)
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`Error ${context ? `in ${context}` : ''}`);
    console.error('Error:', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
    if (error.request) {
      console.error('Request:', error.request);
    }
    console.groupEnd();
  }
};

/**
 * Create user-friendly error object
 * @param {Error} error - Original error
 * @param {string} defaultMessage - Default message if extraction fails
 * @returns {{message: string, type: string, details: Object}}
 */
export const createErrorObject = (error, defaultMessage = 'An error occurred') => {
  const message = extractErrorMessage(error);
  const status = error.response?.status;

  let type = 'error';
  if (status === 429) type = 'warning';
  if (status === 401 || status === 403) type = 'auth';
  if (status >= 500) type = 'server';

  return {
    message: message || defaultMessage,
    type,
    status,
    details: error.response?.data || null
  };
};
