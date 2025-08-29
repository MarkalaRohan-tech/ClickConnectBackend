import { Router } from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  updatePhotographerProfile, 
  getPhotographerDashboard 
} from '../controllers/photographerAuthController.js';
import { auth, permit } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('phone').isLength({ min: 10, max: 15 }).matches(/^[0-9]+$/),
    body('displayName').notEmpty(),
    body('bio').notEmpty(),
    body('location').notEmpty(),
    body('genres').notEmpty(),
    body('baseRate').notEmpty().isNumeric(),
  ],
  register
);


router.post('/login',login);
router.put('/profile', auth, permit("photographer"), updatePhotographerProfile);
router.get('/dashboard', auth, permit("photographer"), getPhotographerDashboard);

export default router;
