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

const router = express.Router();

// Register Routes
router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/logout", accessTokenMiddlewareVerify, userLogout);
router.get("/profile", accessTokenMiddlewareVerify, userProfile);
router.get("/alluser", accessTokenMiddlewareVerify, allUser);
router.get("/messages/:userId",accessTokenMiddlewareVerify, getUserData);

module.exports = router;
