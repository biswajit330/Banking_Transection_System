const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Register (supporting standard spelling and legacy spelling)
router.post("/register", authController.userResisterController);
router.post("/resister", authController.userResisterController);

// Login
router.post("/login", authController.userLoginController);

// Logout
router.post("/logout", authMiddleware.authMiddleware, authController.userLogoutController);

// Current User Profile
router.get("/me", authMiddleware.authMiddleware, authController.userProfileController);

module.exports = router;
