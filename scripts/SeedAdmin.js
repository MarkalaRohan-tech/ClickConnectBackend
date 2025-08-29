// seedAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

const seedAdmin = async () => {
  try {
    const email = "vamshiamudala126@gmail.com";
    const plainPassword = process.env.ADMIN_PASSWORD;

    if (!plainPassword) {
      throw new Error("ADMIN_PASSWORD is not set in .env file");
    }

    // Hash fresh password every run
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Upsert: create if not exists, update password if exists
    const admin = await Admin.findOneAndUpdate(
      { email },
      {
        $set: {
          name: "Admin",
          password: hashedPassword,
          role: "admin",
          isActive: true,
          permissions: ["manage_users", "manage_photographers", "view_stats"],
          lastLogin: null,
        },
      },
      { new: true, upsert: true }
    );

    console.log("✅ Admin account created/updated:", admin.email);
    mongoose.connection.close();
  } catch (err) {
    console.log("❌ Error:", err);
    mongoose.connection.close();
  }
};

seedAdmin();
