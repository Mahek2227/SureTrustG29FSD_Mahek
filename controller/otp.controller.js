import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

import { OTP } from "../schemas/otp.schema.js";
import UserSchema from "../schemas/User.schema.js";

dotenv.config();

const salt = bcrypt.genSaltSync(10);
const resend = new Resend(process.env.RESEND_API_KEY);



/* ================= CREATE OTP ================= */
export const createOTP = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("OTP request for:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await UserSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.create({
      email,
      otp: generatedOTP,
      createdAt: Date.now(),
      is_expired: false,
    });

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${generatedOTP}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    });

    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("Error creating OTP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= VERIFY OTP & CHANGE PASSWORD ================= */
export const changePasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const otpEntry = await OTP.findOne({ email, otp }).sort({ createdAt: -1 });
    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpEntry.is_expired === true) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const user = await UserSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    await OTP.deleteMany({ email });

    return res
      .status(200)
      .json({ message: "Password changed successfully" });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
