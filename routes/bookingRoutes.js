import { Router } from 'express';
import { auth, permit } from '../middleware/auth.js';
import { createBooking, myBookings, updateStatus } from '../controllers/bookingController.js';

const router = Router();

router.post('/', auth, permit('user'), createBooking);
router.get('/mine/:id', auth, permit('user', 'photographer'), myBookings);
router.patch('/:id/status', auth, permit('photographer', 'admin'), updateStatus)

export default router;
