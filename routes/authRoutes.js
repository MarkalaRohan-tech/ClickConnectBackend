import { Router } from "express";
import { body } from "express-validator";
import {
  login,
  register,
  updateUserProfile,
} from "../controllers/authController.js";
import { auth, permit } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phone")
      .isLength({ min: 10, max: 15 })
      .withMessage("Phone must be 10–15 digits")
      .matches(/^[0-9]+$/)
      .withMessage("Phone must contain only numbers"),
    body("role")
      .optional()
      .trim()
      .customSanitizer((v) => v.toLowerCase())
      .isIn(["user", "photographer", "admin"])
      .withMessage("Invalid role"),
  ],
  register
);


router.post("/login", login);

router.put(
  "/update",
  auth,
  permit("user", "photographer"),
  [
    body("name").optional().isString(),
    body("phone").optional().isLength({ min: 10, max: 10 }),
  ],
  updateUserProfile
);

export default router;
