import { Router } from 'express';
import { registerUser, loginUser, registerCoach, loginCoach } from '../controllers/authController';
import { upload, uploadAvatar } from '../controllers/uploadController'; // <-- NEW: Import the uploader

const router = Router();

// Client (Mobile App) Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Coach (Admin Dashboard) Routes
router.post('/coach/register', registerCoach);
router.post('/coach/login', loginCoach);

// --- NEW: AVATAR UPLOAD ROUTE ---
router.post('/upload-avatar', upload.single('image'), uploadAvatar);

export default router;