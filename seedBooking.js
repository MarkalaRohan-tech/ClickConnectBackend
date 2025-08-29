import mongoose from "mongoose";
import Booking from "./models/Booking.js";
import dotevn from "dotenv";
dotevn.config();

const dummyBookings = [
  {
    user: "68ad50341d87f51b073548eb",
    photographer: "68b05db3d6a63ecb6a73306d",
    date: new Date("2025-09-05"),
    timeSlot: "10:00 AM - 12:00 PM",
    package: "basic",
    title: "Birthday Party Shoot",
    status: "pending",
  },
  {
    user: "68ad50341d87f51b073548eb",
    photographer: "68b05db3d6a63ecb6a73306d",
    date: new Date("2025-09-07"),
    timeSlot: "2:00 PM - 4:00 PM",
    package: "premium",
    title: "Wedding Engagement Shoot",
    status: "approved",
  },
  {
    user: "68ad50341d87f51b073548eb",
    photographer: "68b05db3d6a63ecb6a73306d",
    date: new Date("2025-09-10"),
    timeSlot: "5:00 PM - 7:00 PM",
    package: "deluxe",
    title: "Corporate Event Coverage",
    status: "completed",
  },
  {
    user: "68ad50341d87f51b073548eb",
    photographer: "68b05db3d6a63ecb6a73306d",
    date: new Date("2025-09-12"),
    timeSlot: "9:00 AM - 11:00 AM",
    package: "basic",
    title: "Family Photoshoot",
    status: "pending",
  },
  {
    user: "68ad50341d87f51b073548eb",
    photographer: "68b05db3d6a63ecb6a73306d",
    date: new Date("2025-09-15"),
    timeSlot: "3:00 PM - 5:00 PM",
    package: "premium",
    title: "Graduation Ceremony",
    status: "rejected",
  },
  {
    user: "68ad50341d87f51b073548eb",
    photographer: "68b05db3d6a63ecb6a73306d",
    date: new Date("2025-09-18"),
    timeSlot: "1:00 PM - 3:00 PM",
    package: "deluxe",
    title: "Model Portfolio Shoot",
    status: "approved",
  },
  {
    user: "68ad50341d87f51b073548eb",
    photographer: "68b05db3d6a63ecb6a73306d",
    date: new Date("2025-09-20"),
    timeSlot: "11:00 AM - 1:00 PM",
    package: "basic",
    title: "Pet Photography",
    status: "completed",
  },
  {
    user: "68ad50341d87f51b073548eb",
    photographer: "68b05db3d6a63ecb6a73306d",
    date: new Date("2025-09-22"),
    timeSlot: "6:00 PM - 8:00 PM",
    package: "premium",
    title: "Anniversary Celebration",
    status: "pending",
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await Booking.insertMany(dummyBookings);
    console.log("Dummy bookings inserted ✅");
    process.exit();
  })
  .catch((err) => console.error(err));
