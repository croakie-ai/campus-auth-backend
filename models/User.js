const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    // Email verification
    isVerified: {
        type: Boolean,
        default: false
    },

    otp: {
        type: String
    },

    otpExpires: {
        type: Date
    },

    // Forgot password
    resetOTP: {
        type: String
    },

    resetOTPExpires: {
        type: Date
    },

    // Auto cleanup support
    createdAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true // adds createdAt and updatedAt automatically
});

const User = mongoose.model("User", userSchema);

module.exports = User;
