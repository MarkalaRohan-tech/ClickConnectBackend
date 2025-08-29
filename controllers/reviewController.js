import Review from '../models/Review.js';
import Photographer from '../models/Photographer.js';
import { sendEmail } from '../utils/sendEmail.js';
import mongoose from 'mongoose';

export const addReview = async (req, res) => {
  try {
    const { name,text,rating,photographerId,userId } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    const ratingValue = Math.round(Number(rating) * 10) / 10;

    const review = await Review.create({
      user: userId,
      photographer: photographerId,
      rating: ratingValue,
      comment: text,
      name: name
    });

    // Update photographer rating
    const photographer = await Photographer.findById(photographerId);
    const avg = await Review.aggregate([
      { $match: { photographer: new mongoose.Types.ObjectId(photographerId) } },
      { $group: { _id: '$photographer', rating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (avg[0]) {
      photographer.rating = Math.round(avg[0].rating * 10) / 10;
      photographer.ratingCount = avg[0].count;
      await photographer.save();

      // Optional email
      if (photographer.email) {
        await sendEmail(
          photographer.email,
          "You received a new review!",
          `<p>Hello ${photographer.displayName},</p>
            <p>You received a new review from ${req.user.name}:</p>
            <p>Rating: ${ratingValue} ⭐</p>
            <p>Comment: ${text}</p>`
        );
      }

    }

    res.status(201).json(review);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getReview = async (req, res) => {
  try {
    const reviews = await Review.find({ photographer: req.params.id });
    res.status(200).json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};