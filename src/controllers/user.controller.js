const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

// FIREBASE LOGIN / REGISTER SYNC
const firebaseAuth = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, "");
    const formattedPhone = cleanPhone.startsWith("+91")
      ? cleanPhone
      : `+91${cleanPhone}`;

    // Check if user already exists in MongoDB
    let user = await User.findOne({ phone: formattedPhone });

    // If user not found, automatically create a new user (Handles Register)
    if (!user) {
      user = await User.create({
        phone: formattedPhone,
        name: "",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
      },
      process.env.JWT_SECRET || "fallback_secret_key",
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      token,
      user: {
        _id: user._id,
        name: user.name || "",
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Firebase authentication failed",
    });
  }
};

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, "");
    const formattedPhone = cleanPhone.startsWith("+91")
      ? cleanPhone
      : `+91${cleanPhone}`;

    const existingUser = await User.findOne({ phone: formattedPhone });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      phone: formattedPhone,
    });

    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
      },
      process.env.JWT_SECRET || "fallback_secret_key",
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name || "",
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, "");
    const formattedPhone = cleanPhone.startsWith("+91")
      ? cleanPhone
      : `+91${cleanPhone}`;

    const user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
      },
      process.env.JWT_SECRET || "fallback_secret_key",
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name || "",
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// SEARCH USERS (ADD THIS FUNCTION)
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.keyword || req.query.query || "";

    if (!keyword.trim()) {
      return res.status(200).json({ success: true, users: [] });
    }

    const cleanKeyword = keyword.trim().replace(/\s+/g, "");

    // Search by name or phone using Regex
    const users = await User.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { phone: { $regex: cleanKeyword, $options: "i" } },
      ],
    }).select("_id name phone profilePic bio");

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to search users",
    });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  return res.status(400).json({
    message: "Password authentication is not used",
  });
};

// EXPORT
module.exports = {
  firebaseAuth,
  registerUser,
  loginUser,
  searchUsers,
  changePassword,
};