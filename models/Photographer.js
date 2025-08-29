import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const photographerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, trim: true },
  phone: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
  displayName: { type: String, required: true, trim: true },
  pricing: {
    currency: { type: String, default: 'INR', trim: true },
    baseRate: { type: Number, default: 5000 },
    packages: {
      basic: { price: Number, duration: String, services: { type: [String], default: ["Digital delivery", "Basic photo editing", "Up to 10 high-resolution photos", "1 outfit change allowed"] } },
      premium: { price: Number, duration: String, services: {
        type: [String],
        default: [
          "Digital delivery",
          "Advanced photo editing",
          "Up to 25 high-resolution photos",
          "2 outfit changes allowed",
          "Priority delivery",
          "Online gallery with download options"
        ],
      } },
      deluxe: { price: Number, duration: String, services: {
        type: [String],
        default: [
          "Digital delivery",
          "Professional retouching",
          "Up to 50 high-resolution photos",
          "Unlimited outfit changes",
          "Printed album included",
          "VIP online gallery access"
        ],
      } }
    }
  },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  genres: [{ type: String, trim: true }],
  location: { type: String, required: true, trim: true },
  bio: { type: String, required: true, trim: true },
  portfolio: [{ url: String, caption: String, genre: String, price: Number }],
  status: { type: String, enum: ['pending', 'approved', 'blocked'], default: 'pending', trim: true },
  profilePic: { type: String, default: "", trim: true }
}, { timestamps: true });

photographerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt).catch((err) => {
    console.error(err);
    next(err);
  });
  next();
});

photographerSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('Photographer', photographerSchema);
