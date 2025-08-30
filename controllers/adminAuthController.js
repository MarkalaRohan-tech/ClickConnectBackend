import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";

// Helper function to sign JWT
function sign(admin) {
  return jwt.sign(
    {
      id: admin._id,
      role: "admin",
      name: admin.name,
      permissions: admin.permissions,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "7d" }
  );
}

// Admin login controller
// Enhanced adminLogin controller with debug logging
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Debug: Log incoming request
    console.log('Login attempt:', { email, passwordProvided: !!password });
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Debug: Check what we're searching for
    console.log('Searching for admin with:', { 
      email, 
      role: "admin", 
      isActive: true 
    });

    const admin = await Admin.findOne({
      email: email,
      role: "admin",
      isActive: true,
    });

    if (!admin) {
      console.log('No admin found with email:', email);
      // Check if admin exists without role/isActive filters
      const anyAdmin = await Admin.findOne({ email: email });
      if (anyAdmin) {
        console.log('Admin exists but:', {
          role: anyAdmin.role,
          isActive: anyAdmin.isActive
        });
      } else {
        console.log('No admin found with this email at all');
      }
      return res.status(404).json({ message: "Invalid credentials" });
    }

    console.log('Admin found:', {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      hasPassword: !!admin.password
    });

    // Debug: Password comparison
    console.log('Comparing passwords...');
    console.log('Plain password length:', password.length);
    console.log('Hashed password length:', admin.password?.length);
    
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    if (admin.lastLogin === null) {
      admin.lastLogin = new Date();
    }
    await admin.save();

    const token = sign(admin);
    console.log('Login successful for:', email);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none", // allow cross-site (Netlify → Railway)
      secure: true, // required for SameSite=None
      maxAge: 60 * 60 * 1000,
    });


    // Send response
    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        permissions: admin.permissions,
        role: admin.role,
      },
      token,
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
