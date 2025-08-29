import Booking from '../models/Booking.js';
import Photographer from '../models/Photographer.js';


export const createBooking = async (req, res) => {
  try {
    const { photographerId,userId, date, timeSlot, selectedPackage, notes } = req.body;

    
    const photographer = await Photographer.findById(photographerId);
    if (!photographer || photographer.status !== 'approved') {
      return res.status(404).json({ message: 'Photographer not found or not approved' });
    }

    
    if (!['Basic','Premium','Deluxe'].includes(selectedPackage)) {
      return res.status(400).json({ message: 'Invalid package selected' });
    }

    
    const existingBooking = await Booking.findOne({ 
      photographer: photographerId, 
      user: userId,
      date, 
      timeSlot, 
      package: selectedPackage,
      status: { $in: ['pending','approved'] } 
    });
    if (existingBooking) {
      return res.status(400).json({ message: 'Selected slot is already booked' });
    }

    
    const booking = await Booking.create({
      user: userId,
      photographer: photographerId,
      date,
      timeSlot,
      package: selectedPackage,
      title: notes,
      status: 'pending'
    });

    return res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Helper function for relative time
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date; // milliseconds
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return `${date.toLocaleDateString("en-IN")}`;
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes >= 1) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}


export const myBookings = async (req, res) => {
  try {
    // Build filter depending on role
    let filter = {};
    if (req.user.role === "user") filter.user = req.user.id;
    if (req.user.role === "photographer") filter.photographer = req.user.id;

    // Fetch bookings
    const bookingDocs = await Booking.find(filter)
      .populate("user", "name email")
      .populate("photographer", "name email");


    // Transform into recent activities format
    const activities = bookingDocs.map((b) => ({
      id: b._id,
      photographer: b.photographer?.name || "Unknown",
      event: b.title || "Unknown",
      date: b.date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: getTimeAgo(b.createdAt),
      status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
    }));

    // Aggregate counts
    const totalBookings = await Booking.countDocuments(filter);
    const pendingBookings = await Booking.countDocuments({
      ...filter,
      status: "pending",
    });
    const completedBookings = await Booking.countDocuments({
      ...filter,
      status: "completed",
    });
    const rejectedBookings = await Booking.countDocuments({
      ...filter,
      status: "rejected",
    });

    res.json({ activities, totalBookings, pendingBookings, completedBookings, rejectedBookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["pending", "approved", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Prevent updates if already completed or rejected
    if (["rejected", "completed"].includes(booking.status)) {
      return res
        .status(400)
        .json({
          message: `Booking is ${booking.status}, cannot update again..!`,
        });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: `Booking ${status} successfully`, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
