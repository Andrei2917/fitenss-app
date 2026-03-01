import { Router } from 'express';
import { registerUser, loginUser, registerCoach, loginCoach } from '../controllers/authController';

const router = Router();

// Client (Mobile App) Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Coach (Admin Dashboard) Routes
router.post('/coach/register', registerCoach);
router.post('/coach/login', loginCoach);

export default router;