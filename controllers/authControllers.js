const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");


// REGISTER USER
const registerUser = async (req, res) => {
  try {

    console.log("REGISTER FUNCTION RUNNING");

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!email.endsWith("@stu.upes.ac.in")) {
      return res.status(400).json({
        message: "Only UPES email allowed"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpires = Date.now() + 10 * 60 * 1000;

    // SAVE USER WITH OTP
    await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false
    });

    console.log("OTP GENERATED:", otp);

    // SEND EMAIL
    await sendEmail(
      email,
      "Your OTP Code",
      `Your OTP is: ${otp}`
    );

    console.log("EMAIL SENT");

    res.status(201).json({
      message: "User registered. OTP sent to email"
    });

  } catch (error) {

    console.log("REGISTER ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }
};


// VERIFY OTP
const verifyOTP = async (req, res) => {
  try {

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({
      message: "Account verified successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User already verified"
      });
    }

    // Generate new OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = newOTP;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      email,
      "Your New OTP Code",
      `Your new OTP is: ${newOTP}`
    );

    res.json({
      message: "New OTP sent successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



// LOGIN USER
const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Verify OTP first"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }
};


// PROFILE
const getUserProfile = async (req, res) => {

  const user = await User.findById(req.user).select("-password");

  res.json(user);

};

const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // generate reset OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP",
      `Your password reset OTP is: ${otp}`
    );

    res.json({
      message: "Reset OTP sent to email"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
const resetPassword = async (req, res) => {
  try {

    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.resetOTP !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (user.resetOTPExpires < Date.now()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    // hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // clear reset OTP
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;

    await user.save();

    res.json({
      message: "Password reset successful"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword
};
