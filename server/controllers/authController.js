const User = require("../models/User");
const { generateToken } = require("../config/jwt");

// OTP generator
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* =========================
   SEND OTP
========================= */
exports.sendOTP = async (req, res) => {
  try {
    // ✅ Validate request body
    if (!req.body || !req.body.phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const { phone } = req.body;

    // ✅ Generate OTP & expiry
    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // 🔥 PRINT OTP IN TERMINAL (DEV ONLY)
    console.log(`📨 OTP for ${phone}: ${otp}`);

    // ✅ Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({ phone });
    }

    // ✅ Save OTP details
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.isVerified = false;

    await user.save();

    // ✅ SEND RESPONSE
    return res.json({
      message: "OTP sent successfully",
      otp // ⚠️ DEV ONLY — remove in production
    });

  } catch (err) {
    console.error("Send OTP error:", err);
    return res.status(500).json({ error: "OTP failed" });
  }
};

/* =========================
   VERIFY OTP
========================= */
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP required" });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // ✅ Mark verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    // ✅ Generate JWT
    const token = generateToken({ id: user._id });

    return res.json({
      token,
      user
    });

  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ error: "OTP verification failed" });
  }
};
