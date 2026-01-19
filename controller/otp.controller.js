import { sendOTPEmail } from "../utility/emailService.js";
import User from "../schemas/User.schema.js";
import OTP from "../schemas/otp.schema.js";

/* ================= SEND OTP ================= */
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // ✅ STRING

  try {
    // ✅ SAVE OTP IN DATABASE
    await OTP.create({
      email,
      otp
    });

    // ✅ SEND EMAIL
    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ================= VERIFY OTP ================= */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    // ✅ FIND OTP
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ✅ FIND USER
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ⚠️ HASH PASSWORD IN REAL PROJECT
    user.password = newPassword;
    await user.save();

    // ✅ DELETE OTP AFTER USE
    await OTP.deleteOne({ email });

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
