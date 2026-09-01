const OTP = require("../models/otp.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

// SEND OTP
const sendOTP = async (req, res) => {
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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Clear previous OTPs & save new OTP
    await OTP.deleteMany({ phone: formattedPhone });
    await OTP.create({
      phone: formattedPhone,
      otp: otp,
      expiresAt: expiresAt,
    });

    console.log(`====================================`);
    console.log(`🔥 YOUR OTP FOR ${formattedPhone} IS : ${otp}`);
    console.log(`====================================`);

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully. Check backend console terminal.",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
    });
  }
};

// VERIFY OTP
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, "");
    const formattedPhone = cleanPhone.startsWith("+91")
      ? cleanPhone
      : `+91${cleanPhone}`;

    const otpData = await OTP.findOne({ phone: formattedPhone });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Request a new one.",
      });
    }

    if (new Date() > otpData.expiresAt) {
      await OTP.deleteOne({ _id: otpData._id });
      return res.status(400).json({
        success: false,
        message: "OTP expired.",
      });
    }

    if (otpData.otp !== otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await OTP.deleteOne({ _id: otpData._id });

    let user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      user = await User.create({ phone: formattedPhone });
    }

    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Phone verified successfully",
      token,
      user: {
        _id: user._id,
        name: user.name || "",
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "OTP verification failed",
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
};