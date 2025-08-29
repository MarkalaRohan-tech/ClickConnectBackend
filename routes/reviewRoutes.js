import { Router } from 'express';
import { auth, permit } from '../middleware/auth.js';
import { addReview,getReview } from '../controllers/reviewController.js';

const router = Router();

router.post('/', auth, permit("user"), addReview);
router.get("/:id", auth, permit("user","admin","photographer"), getReview);

export default router;
