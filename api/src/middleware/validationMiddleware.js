/**
 * Validation middleware factory
 * Creates middleware functions that validate request data against Joi schemas
 */

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[property];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown properties
      convert: true // Convert values to proper types
    });

    if (error) {
      // Extract error messages from Joi validation error
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors
      });
    }

    // Replace the request data with validated and sanitized value
    req[property] = value;
    next();
  };
};

/**
 * Validates request body
 */
const validateBody = (schema) => validate(schema, 'body');

/**
 * Validates request query parameters
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validates request params (URL parameters)
 */
const validateParams = (schema) => validate(schema, 'params');

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams
};
