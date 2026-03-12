import { Router } from 'express';
import { 
  getAllCoaches, 
  generateAccessCode, 
  getCoachClients, 
  getCoachAccessCodes,
  getCoachProfile,
  updateCoachProfile,
  checkSubscription
} from '../controllers/coachController';

const router = Router();
router.get('/', getAllCoaches);
router.post('/generate-code', generateAccessCode);

router.get('/:coachId/clients', getCoachClients);
router.get('/:coachId/codes', getCoachAccessCodes);

// NEW: Coach profile routes
router.get('/:coachId/profile', getCoachProfile);
router.put('/:coachId/profile', updateCoachProfile);

// NEW: Check if a user is subscribed to a specific coach
router.get('/:coachId/check-subscription/:userId', checkSubscription);

export default router;