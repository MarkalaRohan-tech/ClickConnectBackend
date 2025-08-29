import Photographer from "../models/Photographer.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import { sendEmail } from "../utils/sendEmail.js";

// ---------------- USERS ----------------

// Approve or block user
// Approve user
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected: "approved" 
    
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    // Set default status if not provided
    const userStatus = status || "approved";
    const isActive = userStatus === "approved";

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isActive: isActive, 
        status: userStatus 
      },
      { 
        new: true,
        select: "name email role isActive status createdAt updatedAt"
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send email with error handling
    try {
      if (userStatus === "approved") {
        await sendEmail(
          user.email,
          "Account Approved ✅",
          `
          <p>Hello ${user.name},</p>
          <p>Your account has been approved. You can now use all features!</p>
          `
        );
      }
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
      // Don't fail the entire operation if email fails
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      status: user.status,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error("Error in approveUser:", err);
    res.status(500).json({ 
      message: "Failed to approve user", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Block user
export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isActive: false, 
        status: "blocked" 
      },
      { 
        new: true,
        select: "name email role isActive status createdAt updatedAt"
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send email with error handling
    try {
      await sendEmail(
        user.email,
        "Account Blocked ❌",
        `
        <p>Hello ${user.name},</p>
        <p>Unfortunately, your account has been blocked. Contact support for details.</p>
        `
      );
    } catch (emailError) {
      console.error("Failed to send block email:", emailError);
      // Don't fail the entire operation if email fails
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      status: user.status,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error("Error in blockUser:", err);
    res.status(500).json({ 
      message: "Failed to block user", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "User deleted successfully", 
      id: user._id,
      deletedUser: {
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    res.status(500).json({ 
      message: "Failed to delete user", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const stats = await getStatsData();
    res.json(stats);
  } catch (err) {
    console.error("Error in getStats:", err);
    res.status(500).json({ 
      message: "Failed to fetch stats", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

const getStatsData = async () => {
  const totalUsers = await User.countDocuments();
  const blockedUsers = await User.countDocuments({ isActive: false });
  const activePhotographers = await Photographer.countDocuments({ status: "approved", isActive: true });
  const pendingApprovals = await Photographer.countDocuments({ status: "pending" });
  const pendingBookings = await Booking.countDocuments({ status: "pending" });
  const completedBookings = await Booking.countDocuments({ status: "completed" });

  return {
    totalUsers,
    blockedUsers,
    activePhotographers,
    pendingApprovals,
    pendingBookings,
    completedBookings
  };
};


// List users
export const listUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "_id name email role isActive status createdAt updatedAt"
    );

    // Transform data to match frontend expectations
    const userData = users.map(user => ({
      _id: user._id,
      name: user.name || 'Unknown',
      email: user.email || 'No email',
      role: user.role || 'user',
      isActive: user.isActive !== undefined ? user.isActive : true,
      status: user.status || (user.isActive ? 'approved' : 'blocked'),
      createdAt: user.createdAt
    }));

    res.json(userData);
  } catch (err) {
    console.error("Error in listUsers:", err);
    res.status(500).json({ 
      message: "Failed to fetch users", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Additional utility function to get user statistics
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const blockedUsers = await User.countDocuments({ isActive: false });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    res.json({
      totalUsers,
      activeUsers,
      blockedUsers,
      newUsersThisMonth
    });
  } catch (err) {
    console.error("Error in getUserStats:", err);
    res.status(500).json({ 
      message: "Failed to fetch user statistics", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// ---------------- PHOTOGRAPHERS ----------------

// Approve photographer 
export const approvePhotographers = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid photographer ID format" });
    }

    const photographer = await Photographer.findByIdAndUpdate(
      id,
      { status: "approved", isActive: true },
      {
        new: true,
        select: "name email displayName status isActive createdAt updatedAt rating pricing.baseRate",
      }
    );

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" });
    }

    // Add error handling for email sending
    try {
      await sendEmail(
        photographer.email,
        "Profile Approved ✅",
        `
        <p>Hello ${photographer.displayName || photographer.name},</p>
        <p>Your profile has been approved. You can now start accepting bookings!</p>
        `
      );
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
      // Don't fail the entire operation if email fails
    }

    // Return data in format expected by frontend
    res.json({
      id: photographer._id,
      name: photographer.name,
      email: photographer.email,
      status: photographer.status,
      isActive: photographer.isActive,
      rating: photographer.rating,
      basePrice: photographer.pricing?.baseRate || 0
    });
  } catch (err) {
    console.error("Error in approvePhotographers:", err);
    res.status(500).json({ 
      message: "Failed to approve photographer", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Block photographer
export const blockPhotographer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid photographer ID format" });
    }

    const photographer = await Photographer.findByIdAndUpdate(
      id,
      { status: "blocked", isActive: false },
      { 
        new: true,
        select: "name email displayName status isActive"
      }
    );

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" });
    }

    // Add error handling for email sending
    try {
      await sendEmail(
        photographer.email,
        "Profile Rejected ❌",
        `
        <p>Hello ${photographer.displayName || photographer.name},</p>
        <p>Unfortunately, your profile registration was rejected. Contact support for details.</p>
        `
      );
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
      // Don't fail the entire operation if email fails
    }

    res.json({
      id: photographer._id,
      status: photographer.status,
      isActive: photographer.isActive
    });
  } catch (err) {
    console.error("Error in blockPhotographer:", err);
    res.status(500).json({ 
      message: "Failed to block photographer", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Delete photographer
export const deletePhotographer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid photographer ID format" });
    }

    const photographer = await Photographer.findByIdAndDelete(id);

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" });
    }

    res.json({
      message: "Photographer deleted successfully",
      id: photographer._id,
    });
  } catch (err) {
    console.error("Error in deletePhotographer:", err);
    res.status(500).json({ 
      message: "Failed to delete photographer", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// List photographers
export const listPhotographers = async (req, res) => {
  try {
    const photographers = await Photographer.find(
      {},
      "_id name email displayName status isActive createdAt updatedAt rating pricing.baseRate"
    );

    const sendingData = photographers.map((p) => ({
      id: p._id,
      name: p.name,
      email: p.email,
      status: p.status,
      joined: p.createdAt,
      rating: p.rating || 0,
      basePrice: p.pricing?.baseRate || 0, // Safe access with optional chaining
    }));

    res.json(sendingData);
  } catch (err) {
    console.error("Error in listPhotographers:", err);
    res.status(500).json({ 
      message: "Failed to fetch photographers", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// ---------------- DASHBOARD ----------------

export const getAdminDashboard = async (req, res) => {
  try {
    // Use Promise.allSettled to handle potential failures in individual queries
    const results = await Promise.allSettled([
      User.countDocuments(),
      User.countDocuments({ isActive: false }),
      Photographer.countDocuments({ status: "approved", isActive: true }),
      Photographer.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "completed" })
    ]);

    // Extract values or provide defaults
    const [
      totalUsersResult,
      blockedUsersResult,
      activePhotographersResult,
      photographersPendingResult,
      bookingsPendingResult,
      bookingsCompletedResult
    ] = results;

    res.json({
      totalUsers: totalUsersResult.status === 'fulfilled' ? totalUsersResult.value : 0,
      blockedUsers: blockedUsersResult.status === 'fulfilled' ? blockedUsersResult.value : 0,
      activePhotographers: activePhotographersResult.status === 'fulfilled' ? activePhotographersResult.value : 0,
      photographersPending: photographersPendingResult.status === 'fulfilled' ? photographersPendingResult.value : 0,
      bookingsPending: bookingsPendingResult.status === 'fulfilled' ? bookingsPendingResult.value : 0,
      bookingsCompleted: bookingsCompletedResult.status === 'fulfilled' ? bookingsCompletedResult.value : 0,
    });
  } catch (err) {
    console.error("Error in getAdminDashboard:", err);
    res.status(500).json({ 
      message: "Failed to fetch dashboard data", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};