/**
 * Environment variable validation
 * Ensures all required environment variables are present before starting the server
 */

const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'REDIS_URL',
  'ALLOWED_ORIGIN'
];

const optionalEnvVars = [
  'NODE_ENV',
  'LOG_LEVEL'
];

/**
 * Validates that all required environment variables are set
 * @throws {Error} If any required environment variable is missing
 */
const validateEnv = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check optional variables and warn if missing
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });

  // If any required variables are missing, throw error
  if (missing.length > 0) {
    console.error('\n❌ ENVIRONMENT VALIDATION FAILED\n');
    console.error('Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('\nPlease set these variables in your .env file or environment.');
    console.error('See .env.example for reference.\n');

    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn about missing optional variables
  if (warnings.length > 0) {
    console.warn('\n⚠️  Optional environment variables not set:');
    warnings.forEach(varName => {
      console.warn(`  - ${varName}`);
    });
    console.warn('Using default values for these variables.\n');
  }

  // Validate specific formats
  validateFormats();

  console.log('✅ Environment validation passed\n');
};

/**
 * Validates the format of specific environment variables
 */
const validateFormats = () => {
  // Validate MongoDB URI format
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }

  // Validate Redis URL format
  if (process.env.REDIS_URL && !process.env.REDIS_URL.startsWith('redis')) {
    throw new Error('REDIS_URL must start with "redis://" or "rediss://"');
  }

  // Validate PORT is a number
  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    throw new Error('PORT must be a valid number');
  }

  // Validate NODE_ENV if set
  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    console.warn(`⚠️  NODE_ENV is set to "${process.env.NODE_ENV}" but should be one of: development, production, test`);
  }

  // Validate secrets are not default values
  if (process.env.ACCESS_TOKEN_SECRET === 'your-secret-key' ||
      process.env.REFRESH_TOKEN_SECRET === 'your-secret-key') {
    console.warn('⚠️  WARNING: Using default secret keys. Please change these in production!');
  }
};

module.exports = validateEnv;
