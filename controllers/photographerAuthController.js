import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import Photographer from '../models/Photographer.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

function sign(photographer) {
  return jwt.sign({ 
    id: photographer._id, 
    type: 'photographer', 
    name: photographer.name 
  }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES || '7d' 
  });
}

// Registration: minimal info
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  try {
    const { name, email, password, displayName, phone, location, genres, baseRate,bio } = req.body;

    const exists = await Photographer.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const genresList = genres.split(',').map(genre => genre.trim());

    const photographer = await Photographer.create({ 
      name, 
      email, 
      password, 
      displayName, 
      phone,
      status: 'pending', 
      isActive: true,
      pricing: { baseRate: baseRate, currency: 'INR' }, 
      location, 
      genres: genresList || [],
      bio,
      profilePic: "",
      portfolio: []
    });

    
    return res.status(201).json({ 
      token: sign(photographer), 
      photographer: { 
        id: photographer._id, 
        name: photographer.name, 
        email: photographer.email,
        phone: photographer.phone,
        displayName: photographer.displayName,
        status: photographer.status,
        bio: photographer.bio,
        location: photographer.location,
        genres: photographer.genres,
        baseRate: photographer.baseRate
      } 
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// Login remains unchanged
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const photographer = await Photographer.findOne({ email, isActive: true });
    if (!photographer) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    const ok = await photographer.comparePassword(password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    photographer.lastLogin = new Date();
    await photographer.save();

    const token = sign(photographer);

    // Store token in httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      token,
      photographer: {
        id: photographer._id,
        name: photographer.name,
        email: photographer.email,
        phone: photographer.phone,
        displayName: photographer.displayName,
        status: photographer.status,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};



export const updatePhotographerProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const photographerId = req.user.id;
    const updates = req.body;

    const photographer = await Photographer.findById(photographerId);
    if (!photographer) return res.status(404).json({ message: "Photographer not found" });

    if (photographer.status !== 'approved') {
      return res.status(403).json({ message: "Profile update allowed only after admin approval" });
    }

    if (updates.portfolio) {
    photographer.portfolio.push(...updates.portfolio);
    delete updates.portfolio;
  }

      for (const key in updates) {
    if (updates.hasOwnProperty(key)) {
      photographer[key] = updates[key];
    }
  }

    await photographer.save();

    return res.json({
      message: "Profile updated successfully",
      photographer
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



export const getPhotographerDashboard = async (req, res) => {
  try {
    const photographerId = req.user.id;
    const photographer = await Photographer.findById(photographerId);
    if (!photographer) return res.status(404).json({ message: "Photographer not found" });

    const bookings = await Booking.find({ photographer: photographerId });

    let totalBookings = bookings.length;
    let pendingBookings = 0;
    let acceptedBookings = 0;
    let completedBookings = 0;
    let totalEarnings = 0;

    bookings.forEach(b => {
      if (b.status === 'pending') pendingBookings++;
      if (b.status === 'approved') acceptedBookings++;
      if (b.status === 'completed') {
        completedBookings++;
        if (b.price != null) totalEarnings += Number(b.price);
        else if (b.package) totalEarnings += photographer.pricing.packages[b.package]?.price || 0;
      }
    });

    const recentReviews = await Review.find({ photographer: photographerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.json({
      totalBookings,
      pendingBookings,
      acceptedBookings,
      completedBookings,
      totalEarnings,
      rating: photographer.rating,
      ratingCount: photographer.ratingCount,
      recentReviews
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};