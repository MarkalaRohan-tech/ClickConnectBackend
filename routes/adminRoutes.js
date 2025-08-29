import { Router } from 'express';
import { auth, permit} from '../middleware/auth.js';
import {
  listUsers,
  listPhotographers,
  approvePhotographers,
  deleteUser,
  blockPhotographer,
  blockUser,
  deletePhotographer,
  approveUser,
  getStats
} from '../controllers/adminController.js';

const router = Router();

router.patch('/users/:id/approve', auth, permit("admin"), approveUser);
router.get('/users', auth, permit("admin"), listUsers);
router.patch('/users/:id/block', auth, permit("admin"), blockUser);
router.delete('/users/:id', auth, permit("admin"), deleteUser);

router.get("/stats", auth, permit("admin"), getStats);

//Photographers
router.get('/photographers', auth, permit("admin"), listPhotographers);
router.patch(
  "/photographers/:id/approve",
  auth,
  permit("admin"),
  approvePhotographers
);
router.patch('/photographers/:id/block', auth, permit("admin"), blockPhotographer);
router.delete('/photographers/:id', auth, permit("admin"), deletePhotographer);

export default router;
