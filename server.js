import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import photographerAuthRoutes from './routes/photographerAuthRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import passwordResetRoutes from './routes/passwordResetRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cookieParser from "cookie-parser";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, origin);
      }
      return cb(new Error("CORS blocked: " + origin), false);
    },
    credentials: true,
  })
);

// ✅ handle preflight explicitly (sometimes needed)
app.options(
  "*",
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/', (_req, res) => res.send('ClickConnect API ✅'));


app.use('/api/auth', authRoutes);
app.use('/api/photographer/auth', photographerAuthRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/password-reset', passwordResetRoutes);


app.use('/api/profiles', profileRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);


const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
});
