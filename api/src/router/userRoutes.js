const express = require("express");
const { accessTokenMiddlewareVerify } = require("../middleware/tokenmiddleware");
const {
  userRegister,
  userLogin,
  userLogout,
  userProfile,
  allUser,
  getUserData,
} = require("../controller/userController");
const { validateBody, validateParams, validateQuery } = require("../middleware/validationMiddleware");
const { registerSchema, loginSchema, objectIdSchema, paginationSchema } = require("../validation/schemas");
const { authLimiter, apiLimiter } = require("../middleware/rateLimitMiddleware");
const Joi = require('joi');

const router = express.Router();

// Param validation schema for userId
const userIdParamsSchema = Joi.object({
  userId: objectIdSchema
});

// Authentication Routes (with strict rate limiting)
router.post("/register", authLimiter, validateBody(registerSchema), userRegister);
router.post("/login", authLimiter, validateBody(loginSchema), userLogin);

// Protected Routes (with standard rate limiting)
router.post("/logout", accessTokenMiddlewareVerify, userLogout);
router.get("/profile", accessTokenMiddlewareVerify, apiLimiter, userProfile);
router.get("/alluser", accessTokenMiddlewareVerify, apiLimiter, allUser);
router.get(
  "/messages/:userId",
  accessTokenMiddlewareVerify,
  apiLimiter,
  validateParams(userIdParamsSchema),
  validateQuery(paginationSchema),
  getUserData
);

module.exports = router;
