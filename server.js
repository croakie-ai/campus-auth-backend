const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json()); // Allows us to read JSON from req.body
app.use(cors()); // Allows frontend to communicate with backend

// Import DB connection
require("dotenv").config();
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);


// Basic test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
