/**
 * Frontend validation utilities
 * Provides comprehensive validation for forms with detailed error messages
 */

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {{isValid: boolean, error: string|null, strength: string}}
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required', strength: 'none' };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
      strength: 'weak'
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: 'Password is too long (max 128 characters)',
      strength: 'none'
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const criteriaMet = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      isValid: false,
      error: 'Password must contain uppercase, lowercase, and numbers',
      strength: criteriaMet >= 2 ? 'weak' : 'very weak'
    };
  }

  // Determine strength
  let strength = 'weak';
  if (criteriaMet === 4 && password.length >= 12) {
    strength = 'strong';
  } else if (criteriaMet >= 3 && password.length >= 10) {
    strength = 'medium';
  }

  return { isValid: true, error: null, strength };
};

/**
 * Validates password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Password confirmation
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates name
 * @param {string} name - Name to validate
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Name is too long (max 50 characters)' };
  }

  // Allow letters, numbers, spaces, underscores, hyphens
  const nameRegex = /^[a-zA-Z0-9_\s-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Name can only contain letters, numbers, spaces, and hyphens'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates image file
 * @param {File} file - Image file to validate
 * @param {number} maxSizeInMB - Maximum file size in MB (default: 2MB)
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateImageFile = (file, maxSizeInMB = 2) => {
  if (!file) {
    return { isValid: true, error: null }; // Optional field
  }

  // Check if it's a File object
  if (!(file instanceof File)) {
    return { isValid: false, error: 'Invalid file object' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image'
    };
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeInMB}MB. Please choose a smaller image`
    };
  }

  // Check minimum size (1KB to avoid empty files)
  if (file.size < 1024) {
    return { isValid: false, error: 'File is too small. Please choose a valid image' };
  }

  return { isValid: true, error: null };
};

/**
 * Password strength calculator for visual indicators
 * @param {string} password - Password to analyze
 * @returns {{score: number, feedback: string, color: string}}
 */
export const calculatePasswordStrength = (password) => {
  if (!password) {
    return { score: 0, feedback: '', color: '#e5e7eb' };
  }

  let score = 0;
  const feedback = [];

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety scoring
  if (/[a-z]/.test(password)) {
    score += 1;
    feedback.push('lowercase');
  }
  if (/[A-Z]/.test(password)) {
    score += 1;
    feedback.push('uppercase');
  }
  if (/\d/.test(password)) {
    score += 1;
    feedback.push('numbers');
  }
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 1;
    feedback.push('special characters');
  }

  // Determine strength level and color
  let strengthText = 'Weak';
  let color = '#ef4444'; // red

  if (score >= 7) {
    strengthText = 'Strong';
    color = '#22c55e'; // green
  } else if (score >= 5) {
    strengthText = 'Medium';
    color = '#f59e0b'; // orange
  } else if (score >= 3) {
    strengthText = 'Fair';
    color = '#eab308'; // yellow
  }

  return {
    score: Math.min(score, 7),
    feedback: strengthText,
    color,
    percentage: (score / 7) * 100
  };
};

/**
 * Debounce function for validation
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
