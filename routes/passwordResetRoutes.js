import { Router } from "express";
import { body } from "express-validator";
import { forgotPassword, resetPassword } from "../controllers/passwordResetController.js";

const router = Router();


router.post(
  "/forgot",
  [
    body("email").isEmail(),
    body("userType").isIn(["user", "photographer", "admin"]),
  ],
  forgotPassword
);


router.post(
  "/reset",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("userType").isIn(["user", "photographer", "admin"]),
    body("otp").notEmpty().withMessage("Otp is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  resetPassword
);

export default router;
