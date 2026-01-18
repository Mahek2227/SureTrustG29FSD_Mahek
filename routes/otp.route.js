import express from "express";
import {
  createOTP,
  changePasswordWithOTP,
} from "../controller/otp.controller.js";

const router = express.Router();

router.post("/otp", createOTP);
router.post("/verify-otp", changePasswordWithOTP);

export default router;
