import { validationResult } from "express-validator";
import PasswordReset from "../models/PasswordReset.js";
import User from "../models/User.js";
import Photographer from "../models/Photographer.js";
import Admin from "../models/Admin.js";
import { sendEmail } from "../utils/sendEmail.js";
import dotenv from "dotenv";
dotenv.config();


const getUserModel = (userType) => {
  switch (userType) {
    case "user": return User;
    case "photographer": return Photographer;
    case "admin": return Admin;
    default: throw new Error("Invalid user type");
  }
};


export const forgotPassword = async (req, res) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, userType } = req.body;
    console.log(email, userType);
    console.log(getUserModel(userType));
    const UserModel = getUserModel(userType);
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await PasswordReset.deleteMany({ email, userType });

    await PasswordReset.create({ email, otp, userType, expiresAt });

    await sendEmail(
      email,
      "Password Reset OTP",
      `
        <h2>Password Reset</h2>
        <p>Hello ${user.name},</p>
        <p>Your OTP is:</p>
        <h3>${otp}</h3>
        <p>Valid for 5 minutes.</p>
      `
    );

    return res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err); // <-- log full error in backend
    return res.status(500).json({ message: err.message });
  }
};


export const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, userType, otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

   
    const record = await PasswordReset.findOne({ email, userType, otp });
    if (!record) return res.status(400).json({ message: "Invalid OTP" });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired" });

    const UserModel = getUserModel(userType);
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    
    user.password = newPassword;
    await user.save();

    
    await PasswordReset.deleteMany({ email, userType });

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
