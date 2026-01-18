import express from "express";
import {
  createOTP,
  changePasswordWithOTP,
} from "../controllers/otp.controller.js";

const router = express.Router();

router.post("/send", createOTP);
router.post("/verify", changePasswordWithOTP);

export default router;
