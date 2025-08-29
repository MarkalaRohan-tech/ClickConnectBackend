import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"PhotoBooking 📸" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Email sending failed");
  }
};

export const approveProfile = async (req, res) => {
  const { photographerId, status } = req.body;
  const photographer = await Photographer.findByIdAndUpdate(
    photographerId, 
    { status }, 
    { new: true }
  );

  if (!photographer) return res.status(404).json({ message: "Photographer not found" });


  if (status === 'approved') {
    await sendEmail(
      photographer.email,
      "Profile Approved ✅",
      `<p>Hello ${photographer.displayName},</p>
       <p>Your profile has been approved. You can now update your studio details and start accepting bookings!</p>`
    );
  } else if (status === 'blocked') {
    await sendEmail(
      photographer.email,
      "Profile Rejected ❌",
      `<p>Hello ${photographer.displayName},</p>
       <p>Unfortunately, your profile registration was rejected. Contact support for details.</p>`
    );
  }

  res.json(photographer);
};