import { Router } from 'express';
import { saveUserProfile, getUserProfileStatus } from '../controllers/profileController';

const router = Router();

// Save/update client profile (sex, age, height, weight, goals)
router.put('/users/:userId/profile', saveUserProfile);

// Check if profile is completed
router.get('/users/:userId/profile-status', getUserProfileStatus);

export default router;