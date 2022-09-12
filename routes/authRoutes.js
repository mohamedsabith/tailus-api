/* eslint-disable import/extensions */
import express from "express";
import {
  signUp,
  otpVerification,
  signIn,
  ForgotPassword,
  ResetPassword,
  googleSignUp,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/verifyOtp", otpVerification);
router.post("/signin", signIn);
router.post("/forgotPassword", ForgotPassword);
router.post("/resetPassword", ResetPassword);
router.post("/googleSignup", googleSignUp);

export default router;
