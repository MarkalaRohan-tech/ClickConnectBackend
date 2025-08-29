import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    userType: { type: String, enum: ['user', 'photographer', 'admin'], required: true },
    expiresAt: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    isUsed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('PasswordReset', passwordResetSchema);
