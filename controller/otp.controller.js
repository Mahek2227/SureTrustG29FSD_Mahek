import { sendOTPEmail } from "../utility/emailService.js";

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  try {
    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP sent successfully",
      otp, // remove in production
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};
