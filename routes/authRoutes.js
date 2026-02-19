const express = require("express");
const router = express.Router();



const {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword
} = require("../controllers/authControllers");


// IMPORTANT: matches your filename authMiddlewares.js
const protect = require("../middlewares/authMiddlewares");


// PUBLIC ROUTES

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// PROTECTED ROUTE

router.get("/profile", protect, getUserProfile);
// JWT TOKENIZATION/AUTHORIZATION IS HANDLED IN THE PROTECT MIDDLEWARE

module.exports = router;
