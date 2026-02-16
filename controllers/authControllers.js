const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// REGISTER USER CONTROLLER
const registerUser = async (req, res) => {
  try {
    // 1. Extract data from request body
    const { name, email, password } = req.body;

    // 2. Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // 3. Restrict to UPES student email only
    if (!email.endsWith("@stu.upes.ac.in")) {
      return res.status(400).json({
        message: "Only @stu.upes.ac.in email allowed"
      });
    }

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

  // hash password
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// create user with hashed password
const newUser = await User.create({
  name,
  email,
  password: hashedPassword
});

    // 6. Send success response
    res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });

  } catch (error) {
    // 7. Handle server error
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
// LOGIN USER CONTROLLER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // 2. Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5. Send response
    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
module.exports = {
  registerUser,
  loginUser
};


