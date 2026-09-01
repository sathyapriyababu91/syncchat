const express = require("express");
const router = express.Router();

const { sendOTP, verifyOTP } = require("../controllers/otp.controller");

console.log("sendOTP type:", typeof sendOTP);
console.log("verifyOTP type:", typeof verifyOTP);

router.post("/send", sendOTP);
router.post("/verify", verifyOTP);

module.exports = router;