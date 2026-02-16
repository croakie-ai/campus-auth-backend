const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/authControllers");
const protect = require("../middlewares/authMiddlewares");

router.post("/register", registerUser);
router.post("/login", loginUser);

// protected route
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Access granted",
    userId: req.user
  });
});

module.exports = router;
