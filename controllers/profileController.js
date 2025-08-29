import Photographer from '../models/Photographer.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import mongoose from 'mongoose';


export const listApproved = async (req, res) => {
  try {
    const { city, genre, sortBy = 'pricing.baseRate', sortOrder = 'asc', page = 1, limit = 10 } = req.query;

   
    const filter = { status: 'approved', isActive: true };

   
    if (city) filter['location.city'] = new RegExp(`^${city}$`, 'i');
    if (genre) filter.genres = { $in: [new RegExp(genre, 'i')] };

  
    const sortField = sortBy === 'genre' ? 'genres' : 'pricing.baseRate';
    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    const photographers = await Photographer.find(filter, '-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort(sort);

    res.json(photographers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMine = async (req, res) => {
  try {
    const photographer = await Photographer.findById(req.params.id);
    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" });
    }

    const bookings = await Booking.find({ photographer: req.params.id });

    // Aggregate ratings
    const avgRating = await Review.aggregate([
      { $match: { photographer: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: "$photographer",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const ratingData = avgRating.length
      ? {
          avgRating: Math.round(avgRating[0].avgRating * 10) / 10, // rounded to 1 decimal
          totalReviews: avgRating[0].totalReviews,
        }
      : { avgRating: 0, totalReviews: 0 };

    // Booking stats
    const completedBookings = await Booking.countDocuments({
      photographer: req.params.id,
      status: "completed",
    });
    const pendingBookings = await Booking.countDocuments({
      photographer: req.params.id,
      status: "pending",
    });

    res.json({
      photographer,
      bookings,
      ...ratingData, // spreads avgRating + totalReviews
      completedBookings,
      pendingBookings,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const upsertMine = async (req, res) => {
  try {
  const id = req.params.id;
  const data = req.body;
    const photographer = await Photographer.findByIdAndUpdate(id, data, {
      new: true,
    })
    if(!photographer){
      return res.status(404).json({ message: "Photographer not found" });
    }
  res.status(200).json(photographer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upsertImages = async (req, res) => {
  try {
    const id = req.params.id;
    const { profilePic, portfolio } = req.body;

    // Convert array of URLs to objects matching schema
    const portfolioObjects = portfolio.map((url) => ({ url, caption: "MyPortfolio" }));

    const photographer = await Photographer.findByIdAndUpdate(
      id,
      {
        profilePic,
        $push: { portfolio: { $each: portfolioObjects } },
      },
      { new: true }
    );

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" });
    }

    res.status(200).json(photographer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPortfolio = async (req, res) => {
  console.log(req.params.id);
  try {
    const photographer = await Photographer.findById(req.params.id);
    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" });
    }
    res.status(200).json(photographer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};