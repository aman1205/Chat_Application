/**
 * Wraps async route handlers to catch errors and pass them to the error middleware
 * This eliminates the need for try-catch blocks in every controller function
 *
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function that catches errors
 *
 * @example
 * const getUser = asyncHandler(async (req, res, next) => {
 *   const user = await User.findById(req.params.id);
 *   res.json(user);
 * });
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
