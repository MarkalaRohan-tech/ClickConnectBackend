import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import 'dotenv/config';

function sign(user) {
  return jwt.sign({ id: user._id, type: 'user', name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
}

export const register = async (req, res) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, email, phone, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, phone, password, role });
    console.log("User created:", user);

    // Wrap JWT signing in try/catch to see if this is the problem
    let token;
    try {
      token = sign(user);
    } catch (err) {
      console.error("JWT signing error:", err);
      return res.status(500).json({ message: "Token generation failed" });
    }

    return res.status(201).json({
      token,
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (e) {
    console.error("Register error:", e);
    return res.status(500).json({ message: e.message });
  }

};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isActive: true });
    console.log(user)
    if (!user) return res.status(400).json({ message: "Invalid Email" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid Password" });

    user.lastLogin = new Date();
    await user.save();

    const token = sign(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none", // allow cross-site (Netlify → Railway)
      secure: true, // required for SameSite=None
      maxAge: 60 * 60 * 1000,
    });


    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  }catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { name, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone; 

    await user.save();

    return res.json({
      message: 'Profile updated successfully',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
