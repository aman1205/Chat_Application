const Joi = require('joi');

// User Registration Schema
const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z0-9_\s]+$/)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'string.pattern.base': 'Name can only contain letters, numbers, underscores, and spaces',
      'any.required': 'Name is required'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  profilePhoto: Joi.string()
    .uri()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Profile photo must be a valid URL',
      'string.max': 'Profile photo URL cannot exceed 500 characters'
    })
});

// User Login Schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Message Schema (for WebSocket validation)
const messageSchema = Joi.object({
  recipient: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Recipient ID must be a valid MongoDB ObjectId',
      'any.required': 'Recipient is required'
    }),
  text: Joi.string()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message cannot exceed 5000 characters',
      'any.required': 'Message text is required'
    }),
  file: Joi.string()
    .uri()
    .max(500)
    .optional()
    .messages({
      'string.uri': 'File must be a valid URL',
      'string.max': 'File URL cannot exceed 500 characters'
    })
});

// MongoDB ObjectId validation schema
const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'Invalid ID format'
  });

// Query parameter schemas
const paginationSchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  before: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Before must be a valid ISO date'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  messageSchema,
  objectIdSchema,
  paginationSchema
};
