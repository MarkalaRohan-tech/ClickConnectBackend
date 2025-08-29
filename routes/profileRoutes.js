import { Router } from 'express';
import { auth, permit } from '../middleware/auth.js';
import { listApproved, getMine, upsertMine, upsertImages, getPortfolio } from '../controllers/profileController.js';

const router = Router();

router.get('/', listApproved); // public browse
router.get("/:id", auth, permit("photographer"), getMine);
router.patch("/:id", auth, permit("photographer"), upsertMine);
router.patch("/:id/pictures", auth, permit("photographer"), upsertImages)
router.get(
  "/getProtfolio/:id",
  auth,
  permit("photographer", "admin", "user"),
  getPortfolio
);


export default router;
