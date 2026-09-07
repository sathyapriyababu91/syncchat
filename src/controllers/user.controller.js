const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

// DIRECT PHONE & NAME LOGIN / REGISTER (No OTP / No Firebase)
const phoneLogin = async (req, res) => {
  try {
    const { phone, name } = req.body;

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

    if (!user) {
      // If new user, name is mandatory
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required for registration",
        });
      }

      user = await User.create({
        phone: formattedPhone,
        name: name.trim(),
      });
    } else {
      // If user exists and name is provided/updated, save it
      if (name && name.trim() && (!user.name || user.name === "")) {
        user.name = name.trim();
        await user.save();
      }
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
      message: "Login successful",
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
      message: error.message || "Login failed",
    });
  }
};

// SEARCH USERS
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
  phoneLogin,
  searchUsers,
  changePassword,
};